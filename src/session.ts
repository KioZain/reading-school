import{createSession as initial,transition as reduce,lessonOne,practiceItems,type SessionState as Base,type SessionEvent}from'./core';
export type SessionState=Base&{overlay:'help'|'lessonActions'|'profileOffer'|null;profilePromptPending:boolean;profileReturn:'profile'|'map'};
export const PROFILE_OFFER_DELAY=450;
export const createSession=():SessionState=>({...initial(),overlay:null,profilePromptPending:false,profileReturn:'map'});
export const lessonInProgress=(s:SessionState)=>s.started&&!(s.lesson.exercise===5&&s.lesson.item>=lessonOne[5].items.length);
export const practiceInProgress=(s:SessionState)=>s.practice.history.length>0&&s.practice.item<practiceItems.length;
export function transition(s:SessionState,e:SessionEvent):SessionState{
 const base=(event:SessionEvent)=>({...s,...reduce(s,event)});
 const navigation=(event:SessionEvent)=>({...base(event),overlay:null,profilePromptPending:false});
 if(s.overlay&&['READING_ACCEPTED','GAME_ACTION_ACCEPTED','UNDO_STEP'].includes(e.type))return s;
 switch(e.type){
 case 'OPEN_LESSON_ONE':return s.completed?{...s,overlay:'lessonActions',profilePromptPending:false}:navigation({type:s.started?'RESUME_LESSON':'LESSON_INTRO'});
 case 'OPEN_HELP':return{...s,overlay:'help',profilePromptPending:false};
 case 'DISMISS_OVERLAY':return{...s,overlay:null};
 case 'OPEN_MAP':return{...base(e),overlay:null,profilePromptPending:s.screen==='lessonResult'&&s.completed&&!s.profileOffered};
 case 'SHOW_PROFILE_OFFER':return s.screen==='map'&&s.profilePromptPending&&!s.overlay&&!s.profileOffered?{...s,overlay:'profileOffer',profileOffered:true,profilePromptPending:false}:s;
 case 'CONFIGURE_PROFILE':return{...s,screen:'profileSetup',overlay:null,profilePromptPending:false,profileReturn:'map'};
 case 'EDIT_PROFILE':return{...navigation(e),profileReturn:'profile'};
 case 'SAVE_PROFILE':return{...navigation(e),screen:s.profileReturn,profileOffered:true};
 case 'SKIP_PROFILE':return{...navigation(e),screen:s.profileReturn};
 case 'OPEN_PRACTICE_OPTION':if(!s.completed)return s;return navigation({type:s.practice.item>=practiceItems.length?'REPEAT_PRACTICE':practiceInProgress(s)?'START_PRACTICE':'PRACTICE_INTRO'});
 case 'RESUME_LESSON':return s.completed&&!lessonInProgress(s)?{...s,overlay:'lessonActions',profilePromptPending:false}:navigation(e);
 default:return /^(OPEN_|START_|REPEAT_|NEXT_|LESSON_INTRO|PRACTICE_INTRO)/.test(e.type)?navigation(e):base(e);
 }
}
