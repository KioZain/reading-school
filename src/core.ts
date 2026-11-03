export type Unit={text:string;kind:'syllable'|'letter'};
export type ReadingItem={id:string;text:string;units:Unit[]};
const item=(text:string,id:string):ReadingItem=>({id,text,units:(text==='мама'?['ма','ма']:text==='папа'?['па','па']:text==='яма'?['я','ма']:[text]).map(text=>({text,kind:text.length===1?'letter':'syllable'}))});
export const lessonOne=[
 ['Первые слова','Прочитай по дорожке','intro-reading',['мама','папа','я']],
 ['Кузнечик','Помоги кузнечику подняться','ladder',['ма','па','я','па','ма','па','я']],
 ['Кузовок','Прочитай и положи предмет в кузовок','basket',['мама','папа','яма']],
 ['Листья','Прочитай и выбери лист','leaves',['ма','я','па']],
 ['Тучки','Прочитай и коснись тучки','clouds',['мама','папа','яма']],
 ['Гаражи','Прочитай и найди такой же слог','garages',['ма','я','па']],
].map(([title,instruction,kind,words],i)=>({id:`1.${i+1}`,title:title as string,instruction:instruction as string,kind:kind as string,items:(words as string[]).map((s,j)=>item(s,`${i+1}:${j}`))}));
export const practiceItems=['мама','папа','яма','ма','па','я'].map((s,i)=>item(s,`p:${i}`));
export type Step={item:number;unit:number;ready:boolean;choices?:number[]};
export type Snapshot=Step&{exercise:number;history:Step[]};
export type SessionState={screen:string;onboarding:number;lesson:Snapshot;practice:Snapshot;started:boolean;completed:boolean;profileOffered:boolean;name:string;avatar:string;info:string};
export type SessionEvent={type:string;id?:string;unit?:number;name?:string;avatar?:string;info?:string;choice?:number};
const fresh=():Snapshot=>({exercise:0,item:0,unit:0,ready:false,history:[]});
export const createSession=():SessionState=>({screen:'splash',onboarding:0,lesson:fresh(),practice:fresh(),started:false,completed:false,profileOffered:false,name:'',avatar:'○',info:''});
export const activeId=(s:SessionState)=>s.screen==='practice'?`practice:${s.practice.item}`:`1.${s.lesson.exercise+1}:${s.lesson.item}`;
export function transition(s:SessionState,e:SessionEvent):SessionState{
 const p=s.screen==='practice',key=p?'practice':'lesson',snap=s[key];
 const go=(screen:string)=>({...s,screen});
 switch(e.type){
 case 'NEXT_ONBOARDING':return s.onboarding<2?{...s,screen:'onboarding',onboarding:s.onboarding+1}:go('map');
 case 'SHOW_ONBOARDING':return go('onboarding');
 case 'SKIP_ONBOARDING':case 'OPEN_MAP':return go('map');
 case 'LESSON_INTRO':return go('lessonIntro');
 case 'START_LESSON':return {...s,screen:'exercise',started:true};
 case 'RESUME_LESSON':return go(snap.item>=lessonOne[s.lesson.exercise].items.length?'exerciseResult':'exercise');
 case 'REPEAT_LESSON':return {...s,screen:'lessonIntro',lesson:fresh(),started:false};
 case 'PRACTICE_INTRO':return s.completed?go('practiceIntro'):s;
 case 'START_PRACTICE':return s.completed?go(s.practice.item>=practiceItems.length?'practiceResult':'practice'):s;
 case 'REPEAT_PRACTICE':return {...s,screen:'practice',practice:fresh()};
 case 'READING_ACCEPTED':case 'GAME_ACTION_ACCEPTED':{
 if(!['exercise','practice'].includes(s.screen)||e.id!==activeId(s))return s;
 const def=p?null:lessonOne[snap.exercise],items=p?practiceItems:def!.items,word=items[snap.item];if(!word)return s;
 if(e.type==='READING_ACCEPTED'&&(snap.ready||e.unit!==snap.unit))return s;
 if(e.type==='GAME_ACTION_ACCEPTED'&&!snap.ready)return s;
 const history=[...snap.history,{item:snap.item,unit:snap.unit,ready:snap.ready,choices:snap.choices}];let next={...snap,history};
 if(e.type==='READING_ACCEPTED'&&snap.unit<word.units.length-1)next.unit++;
 else if(e.type==='READING_ACCEPTED'&&def&&['basket','leaves','clouds','garages'].includes(def.kind))next.ready=true;
 else next={...next,item:snap.item+1,unit:0,ready:false,choices:e.choice===undefined?snap.choices:[...(snap.choices||[]),e.choice]};
 return {...s,[key]:next,screen:next.item>=items.length?(p?'practiceResult':'exerciseResult'):s.screen};}
 case 'UNDO_STEP':{const prev=snap.history.at(-1);return prev?{...s,[key]:{...snap,...prev,history:snap.history.slice(0,-1)}}:s;}
 case 'REPEAT_EXERCISE':return {...s,screen:'exercise',lesson:{...fresh(),exercise:s.lesson.exercise}};
 case 'NEXT_EXERCISE':return s.lesson.exercise<5?{...s,screen:'exercise',lesson:{...fresh(),exercise:s.lesson.exercise+1}}:{...s,screen:'lessonResult',completed:true};
 case 'AFTER_REWARD':return s.profileOffered?go('map'):{...s,screen:'profileSetup',profileOffered:true};
 case 'SAVE_PROFILE':return {...s,screen:'map',name:e.name?.trim()||'',avatar:e.avatar||'○'};
 case 'SKIP_PROFILE':return go('map');
 case 'OPEN_PROFILE':return go('profile');case 'EDIT_PROFILE':return go('profileSetup');case 'OPEN_SETTINGS':return go('settings');
 case 'OPEN_INFO':return {...s,screen:'info',info:e.info||''};
 case 'OPEN_NEXT_LESSON':return s.completed?go('nextLesson'):s;
 default:return s;
 }
}
export type Point={x:number;y:number};
export function pathFor(kind:Unit['kind']):Point[]{return Array.from({length:41},(_,i)=>{const t=i/40;return {x:kind==='letter'?45+t*50:15+t*110,y:kind==='letter'?82:82+23*Math.sin(Math.PI*t)}});}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export class Gesture{
 index=0;valid=false;complete=false;
 constructor(public path:Point[]){}
 start(p:Point){this.valid=distance(p,this.path[0])<=24;return this.valid;}
 move(p:Point){if(!this.valid)return;let best=this.index;let d=Infinity;for(let i=this.index;i<Math.min(this.path.length,this.index+7);i++){const v=distance(p,this.path[i]);if(v<d){d=v;best=i;}}if(d>24){this.valid=false;return;}this.index=best;this.complete=this.index>=36&&distance(p,this.path.at(-1)!)<=24;}
}
