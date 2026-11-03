import type{AdultAccount}from'./productSession';
export const DEMO_LOGIN={email:'adult@example.test',password:'Reading123!'};
export const DEMO_PRODUCT={id:'full-course',title:'Полный доступ',price:990,currency:'₽',period:'Разовая покупка'};
export type AuthResult={account:AdultAccount;hasAccess:boolean};
export type AuthValues={email:string;password:string;confirm?:string;name?:string};
const normalize=(email:string)=>email.trim().toLowerCase();
export function validateAuth(mode:string,values:AuthValues):Record<string,string>{
 const errors:Record<string,string>={};if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))errors.email='Введите корректную электронную почту.';
 if(mode!=='reset'&&values.password.length<8)errors.password='Пароль должен содержать не меньше 8 символов.';
 if(mode==='register'){if(!values.name?.trim())errors.name='Введите имя взрослого.';if(values.confirm!==values.password)errors.confirm='Пароли не совпадают.'}
 return errors;
}
const digest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');
/** In-memory prototype provider. It sends no requests and grants no real account or purchase. */
export function createDemoAccountService(){
 const records=new Map<string,{name:string;password:Promise<string>;access:boolean}>([[DEMO_LOGIN.email,{name:'Взрослый',password:digest(DEMO_LOGIN.password),access:false}]]);
 const result=(email:string)=>({account:{email,name:records.get(email)!.name},hasAccess:records.get(email)!.access});
 return{
  async login(email:string,password:string):Promise<AuthResult>{email=normalize(email);const record=records.get(email);if(!record||await record.password!==await digest(password))throw new Error('Проверьте почту и пароль.');return result(email)},
  async register(name:string,email:string,password:string):Promise<AuthResult>{email=normalize(email);const errors=validateAuth('register',{name,email,password,confirm:password});if(Object.keys(errors).length)throw new Error(Object.values(errors)[0]);if(records.has(email))throw new Error('Эта почта уже зарегистрирована. Войдите в аккаунт.');records.set(email,{name:name.trim(),password:digest(password),access:false});return result(email)},
  async resetPassword(_email:string){await Promise.resolve()},
  async purchase(email:string,outcome:'success'|'declined',signal?:AbortSignal){signal?.throwIfAborted();email=normalize(email);await Promise.resolve();signal?.throwIfAborted();const record=records.get(email);if(!record)throw new Error('Войдите в аккаунт взрослого.');if(outcome==='success')record.access=true;return outcome==='success'},
  async restore(email:string){await Promise.resolve();return records.get(normalize(email))?.access??false},
 };
}
export type DemoAccountService=ReturnType<typeof createDemoAccountService>;
