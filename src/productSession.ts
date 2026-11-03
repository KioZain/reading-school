import{createSession as initial,transition as reduce,type SessionState}from'./session';
import{lessonOne,practiceItems,type SessionEvent}from'./core';
export type AdultAccount={email:string;name:string};
export type Background='meadow'|'confetti'|'stars';
export const BACKGROUNDS:Record<Background,string>={meadow:'Лужайка',confetti:'Конфетти',stars:'Звёзды'};
export type ProductState=SessionState&{profileBackground:Background;readWords:string[];practiceRuns:number;account:AdultAccount|null;access:boolean;adultBackStack:string[];authOrigin:string;authTarget:'account'|'access'|'checkout';checkout:{status:'idle'|'processing'|'declined'|'success';attempt:number}};
export type ProductEvent=SessionEvent&{background?:Background;account?:AdultAccount;hasAccess?:boolean;attempt?:number;accountId?:string;outcome?:'success'|'declined'};
export const ADULT_SCREENS=new Set(['profileSettings','account','login','register','passwordReset','passwordResetSent','access','checkout','paymentSuccess','paymentFailed']);
const authScreens=new Set(['login','register','passwordReset','passwordResetSent']);
export const createSession=():ProductState=>({...initial(),profileBackground:'meadow',readWords:[],practiceRuns:0,account:null,access:false,adultBackStack:[],authOrigin:'account',authTarget:'account',checkout:{status:'idle',attempt:0}});
export function transition(s:ProductState,e:ProductEvent):ProductState{
 const go=(screen:string):ProductState=>({...s,screen,overlay:null,profilePromptPending:false,adultBackStack:[...s.adultBackStack,s.screen]});
 switch(e.type){
 case 'OPEN_PROFILE_SETTINGS':case 'EDIT_PROFILE':return{...go('profileSettings'),profileReturn:'profile'};
 case 'OPEN_ACCOUNT':return go('account');
 case 'OPEN_ACCESS':return ['checkout','paymentSuccess','paymentFailed'].includes(s.screen)?{...s,screen:'access',adultBackStack:s.adultBackStack.at(-1)==='access'?s.adultBackStack.slice(0,-1):s.adultBackStack}:go('access');
 case 'OPEN_LOGIN':case 'OPEN_REGISTER':return{...s,screen:e.type==='OPEN_LOGIN'?'login':'register',overlay:null,profilePromptPending:false,authOrigin:authScreens.has(s.screen)?s.authOrigin:s.screen,authTarget:authScreens.has(s.screen)?s.authTarget:s.screen==='access'?'access':'account'};
 case 'OPEN_PASSWORD_RESET':return{...s,screen:'passwordReset'};
 case 'PASSWORD_RESET_SENT':return{...s,screen:'passwordResetSent'};
 case 'EXIT_AUTH':return{...s,screen:s.authOrigin};
 case 'ADULT_BACK':{
  if(s.screen==='passwordReset'||s.screen==='passwordResetSent')return{...s,screen:'login'};
  if(authScreens.has(s.screen))return{...s,screen:s.authOrigin};
  return{...s,screen:s.adultBackStack.at(-1)||'profile',adultBackStack:s.adultBackStack.slice(0,-1),checkout:{status:'idle',attempt:s.checkout.attempt+1}};
 }
 case 'AUTHENTICATED':if(!e.account||!['login','register'].includes(s.screen))return s;return{...s,account:e.account,access:!!e.hasAccess,screen:s.authTarget==='checkout'?(e.hasAccess?'access':'checkout'):s.authTarget,adultBackStack:s.authTarget==='checkout'&&!e.hasAccess?[...s.adultBackStack,s.authOrigin]:s.adultBackStack,checkout:{...s.checkout,status:'idle'}};
 case 'SIGN_OUT':return{...s,account:null,access:false,screen:'account',checkout:{status:'idle',attempt:s.checkout.attempt+1}};
 case 'OPEN_CHECKOUT':{
  if(s.access)return{...s,screen:'access'};
  if(!s.account)return{...s,screen:'login',overlay:null,profilePromptPending:false,authOrigin:s.screen,authTarget:'checkout'};
  return{...(s.screen==='paymentFailed'?{...s,screen:'checkout'}:go('checkout')),checkout:{...s.checkout,status:'idle'}};
 }
 case 'PAYMENT_BEGIN':return s.screen==='checkout'&&s.account&&!s.access&&s.checkout.status!=='processing'?{...s,checkout:{status:'processing',attempt:s.checkout.attempt+1}}:s;
 case 'PAYMENT_RESULT':if(s.screen!=='checkout'||!s.account||e.accountId!==s.account.email||s.checkout.status!=='processing'||e.attempt!==s.checkout.attempt)return s;return{...s,access:e.outcome==='success',screen:e.outcome==='success'?'paymentSuccess':'paymentFailed',checkout:{...s.checkout,status:e.outcome==='success'?'success':'declined'}};
 case 'PAYMENT_CANCEL':return{...s,screen:'access',adultBackStack:s.adultBackStack.at(-1)==='access'?s.adultBackStack.slice(0,-1):s.adultBackStack,checkout:{status:'idle',attempt:s.checkout.attempt+1}};
 case 'RESTORE_ACCESS':return s.account&&s.account.email===e.accountId?{...s,access:!!e.hasAccess}:s;
 case 'SAVE_PROFILE':{
  const next={...s,...reduce(s,e)};return{...next,profileBackground:e.background&&e.background in BACKGROUNDS?e.background:s.profileBackground,adultBackStack:s.screen==='profileSettings'?s.adultBackStack.slice(0,-1):s.adultBackStack};
 }
 }
 const next:ProductState={...s,...reduce(s,e)};
 if(e.type==='READING_ACCEPTED'&&!s.overlay){
  const practice=s.screen==='practice',before=practice?s.practice:s.lesson,after=practice?next.practice:next.lesson;
  const definition=lessonOne[before.exercise],item=(practice?practiceItems:definition.items)[before.item];
  if(item&&after!==before&&before.unit===item.units.length-1&&(after.item>before.item||after.ready)&&
   (practice||['intro-reading','basket','clouds'].includes(definition.kind))&&['мама','папа','яма','я'].includes(item.text)){
   next.readWords=s.readWords.includes(item.text)?s.readWords:[...s.readWords,item.text];
  }
  if(practice&&next.screen==='practiceResult')next.practiceRuns=s.practiceRuns+1;
 }
 if(e.type==='OPEN_MAP')next.adultBackStack=[];
 return next;
}
export const profileStats=(s:ProductState)=>({words:s.readWords.length,lessons:s.completed?1:0,practices:s.practiceRuns});
export const profileAwards=(s:ProductState)=>[
 {id:'first-word',title:'Первое слово',description:'Прочитай первое слово по дорожкам.',earned:s.readWords.length>0,icon:'book' as const,progress:Math.min(1,s.readWords.length),goal:1},
 {id:'first-lesson',title:'Первая звезда',description:'Пройди первый урок.',earned:s.completed,icon:'star' as const,progress:s.completed?1:0,goal:1},
 {id:'first-words',title:'Первые четыре слова',description:'Прочитай «мама», «папа», «я» и «яма».',earned:s.readWords.length>=4,icon:'book' as const,progress:s.readWords.length,goal:4},
 {id:'first-practice',title:'Первая тренировка',description:'Закончи тренировку первого урока.',earned:s.practiceRuns>0,icon:'trail' as const,progress:Math.min(1,s.practiceRuns),goal:1},
];
