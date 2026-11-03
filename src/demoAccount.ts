import type{AdultAccount}from'./productSession';
export const DEMO_LOGIN={email:'adult@example.test',password:'Reading123!'};
export const DEMO_PRODUCT={id:'full-course',title:'Полный доступ',price:990,currency:'₽',period:'Разовая покупка'};
export type AuthResult={account:AdultAccount;hasAccess:boolean};
export type AuthValues={email:string;password:string;confirm?:string;name?:string};
const normalize=(email:string)=>email.trim().toLowerCase();
const nameFrom=(email:string)=>email.split('@')[0]||'Взрослый';
/** The prototype accepts any input: sign-in and registration never block on form errors. */
export function validateAuth(_mode:string,_values:AuthValues):Record<string,string>{return {}}
const digest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');
/** In-memory prototype provider. It sends no requests and grants no real account or purchase. */
export function createDemoAccountService(){
 const records=new Map<string,{name:string;password:Promise<string>;access:boolean}>([[DEMO_LOGIN.email,{name:'Взрослый',password:digest(DEMO_LOGIN.password),access:false}]]);
 const result=(email:string)=>({account:{email,name:records.get(email)!.name},hasAccess:records.get(email)!.access});
 return{
  // Any e-mail and password sign in; an unknown e-mail simply becomes a new account.
  async login(email:string,password:string):Promise<AuthResult>{email=normalize(email);if(!records.has(email))records.set(email,{name:nameFrom(email),password:digest(password),access:false});return result(email)},
  // Registering an existing e-mail updates its name and keeps any purchase made with it.
  async register(name:string,email:string,password:string):Promise<AuthResult>{email=normalize(email);const previous=records.get(email);records.set(email,{name:name.trim()||previous?.name||nameFrom(email),password:digest(password),access:previous?.access??false});return result(email)},
  async resetPassword(_email:string){await Promise.resolve()},
  async purchase(email:string,outcome:'success'|'declined',signal?:AbortSignal){signal?.throwIfAborted();email=normalize(email);await Promise.resolve();signal?.throwIfAborted();const record=records.get(email);if(!record)throw new Error('Войдите в аккаунт взрослого.');if(outcome==='success')record.access=true;return outcome==='success'},
  async restore(email:string){await Promise.resolve();return records.get(normalize(email))?.access??false},
 };
}
export type DemoAccountService=ReturnType<typeof createDemoAccountService>;
