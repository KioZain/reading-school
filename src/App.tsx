import {useEffect,useReducer,useState} from 'react';
import {Icon,avatarIcon,avatars,type IconName} from './Icon';
import{lessonInProgress,practiceInProgress,PROFILE_OFFER_DELAY}from'./session';
import{createSession,transition,ADULT_SCREENS}from'./productSession';
import{ProfileView,ProfileSettings}from'./ProfileScreens';
import{AdultScreens}from'./AdultScreens';
import{createDemoAccountService}from'./demoAccount';
import{LearningDialog}from'./LearningDialog';
import{NarrationButton}from'./NarrationButton';
import{LESSON_INTRO_TEXT,READING_EXPLANATION,TASK_EXPLANATIONS}from'./learningContent';
import {exerciseInstruction} from './copy';
import {SpringArt,Confetti} from './motion';
import {activeId,lessonOne,practiceItems} from './core';
import {ReadingSurface} from './ReadingSurface';import {ExerciseScene} from './ExerciseScene';
const onboarding=[['Здравствуй, читатель!','Будем читать и играть.','book'],['Читаем по дорожке','Веди от точки и читай.','trail'],['Вместе интереснее','Читай вместе со взрослым.','people']];
const menuIcons:Record<string,IconName>={'Звук':'sound','Аккаунт':'profile','Доступ':'lock','Профили':'people','Методика':'trail','Документы':'info'};
const info:Record<string,string>={'Звук':'Инструкцию к первому уроку можно прослушать. Читайте слова вслух вместе с ребёнком.','Аккаунт':'Здесь находится информация об аккаунте взрослого.','Доступ':'Первый урок открыт. После него можно познакомиться со следующим.','Профили':'Имя и аватар можно изменить в профиле ребёнка.','Методика':'Читайте слоги по дорожке, затем соединяйте их в слова. Занимайтесь вместе и в удобном темпе.','Документы':'Информация об условиях занятий и обработке данных.'};
export default function App(){
 const [s,send]=useReducer(transition,undefined,createSession);const[accountService]=useState(createDemoAccountService);const [error,setError]=useState('');const[demoRequest,setDemoRequest]=useState(0);const[demoItem,setDemoItem]=useState<string|null>(null);const [gestureActive,setGestureActive]=useState(false);const[demoPlaying,setDemoPlaying]=useState(false);const [readingKey,setReadingKey]=useState(0);const [name,setName]=useState('');const [avatar,setAvatar]=useState('○');
 const emit=(type:string,extra={})=>send({type,...extra});
 useEffect(()=>{if(s.screen==='profileSetup'){setName(s.name);setAvatar(s.avatar)}},[s.screen]);const invalid=(v:string)=>setError(v);
 useEffect(()=>{if(s.screen==='splash'){const t=setTimeout(()=>emit('SHOW_ONBOARDING'),650);return()=>clearTimeout(t)}},[s.screen]);
 useEffect(()=>{setError('')},[s.screen,s.lesson.item,s.lesson.unit,s.practice.item,s.practice.unit]);
 useEffect(()=>{if(!error)return;const t=setTimeout(()=>setError(''),1600);return()=>clearTimeout(t)},[error]);
 useEffect(()=>{if(s.screen!=='map'||!s.profilePromptPending||s.overlay)return;const timer=setTimeout(()=>emit('SHOW_PROFILE_OFFER'),PROFILE_OFFER_DELAY);return()=>clearTimeout(timer)},[s.screen,s.profilePromptPending,s.overlay]);
 useEffect(()=>{setDemoRequest(0);setDemoItem(null)},[s.screen,s.overlay]);
 const btn=(label:string,type:string,secondary=false,extra={})=><button className={secondary?'secondary':'primary'} onClick={()=>emit(type,extra)}>{label}</button>;
 const center=(title:string,body:string,children:React.ReactNode,symbol:IconName='book')=><section className={`center ${s.screen==='splash'?'splash':''}`}><div className={`hero-symbol ${s.screen==='lessonResult'?'reward':''}`}><SpringArt key={s.screen}><Icon name={symbol}/></SpringArt></div><h1>{title}</h1>{body&&<p>{body}</p>}<div className="actions">{children}</div></section>;
 let content:React.ReactNode;
 switch(s.screen){
 case 'splash':content=center('Школа чтения','',null);break;
 case 'onboarding':{const o=onboarding[s.onboarding];content=<>{center(o[0],o[1],<>{btn('Далее','NEXT_ONBOARDING')}{btn('Пропустить','SKIP_ONBOARDING',true)}</>,o[2] as IconName)}<div className="dots">{onboarding.map((_,i)=><i key={i} className={i===s.onboarding?'selected':''}/>)}</div></>;break;}
 case 'map':content=<section className="map"><div className="map-heading"><h1>Давай читать!</h1></div><div className="map-path"><div className="dashed"/>{[0,1,2].map(i=><div className={`map-stop stop-${i}`} key={i}><button aria-label={`Урок ${i+1}`} disabled={i===2||i===1&&!s.completed} onClick={()=>emit(i?'OPEN_NEXT_LESSON':'OPEN_LESSON_ONE')} className={`lesson-marker ${i===0?s.completed?'is-done':'is-current':i===1&&s.completed?'is-current':''}`}>{i===0?s.completed?<Icon name="star"/>:'1':i===1&&s.completed?'2':<Icon name="lock"/>}</button><strong>Урок {i+1}</strong><small>{i===0?'Первые слова':i===1&&s.completed?'Уже доступен':'Впереди'}</small></div>)}</div><div className="map-actions">{btn(s.completed?'Выбрать занятие':s.started?'Продолжить':'Начать урок','OPEN_LESSON_ONE')}</div></section>;break;
 case 'lessonIntro':content=center('Первые слова',LESSON_INTRO_TEXT,<><NarrationButton/>{btn('Начать урок','START_LESSON')}</>,'sun');break;
 case 'exercise':case 'practice':{const practice=s.screen==='practice';const snap=practice?s.practice:s.lesson;const def=lessonOne[snap.exercise];const items=practice?practiceItems:def.items;const word=items[snap.item];content=<section className={`exercise ${practice?'practice':''}`}><div className="step-progress" aria-label={practice?'Тренировка':`Задание ${snap.exercise+1} из 6`}>{items.map((_,i)=><i key={i} className={i<snap.item?'done':i===snap.item?'current':''}/>)}</div>{(()=>{const hint=exerciseInstruction(def.kind,snap.item,snap.ready,practice);return <p className={`instruction ${hint?'':'is-empty'}`}>{hint||'\u00a0'}</p>})()}{!practice&&<ExerciseScene key={snap.exercise} snap={snap} onAccept={choice=>emit('GAME_ACTION_ACCEPTED',{id:activeId(s),choice})} onInvalid={invalid}/>}<div className={`word-panel ${error?'shake':''}`}><ReadingSurface onDemoChange={setDemoPlaying} demoRequest={demoRequest} demoEnabled={!s.overlay&&demoItem===word.id} key={readingKey} onActive={active=>{setGestureActive(active);if(active)setDemoRequest(0)}} item={word} unit={snap.unit} disabled={snap.ready} onAccept={unit=>emit('READING_ACCEPTED',{id:activeId(s),unit})} onInvalid={invalid}/></div><div className="feedback" role="status">{error&&<span>{error}</span>}</div></section>;break;}
 case 'exerciseResult':content=center('Здорово получилось!','',<>{btn(s.lesson.exercise===5?'Завершить урок':'Следующее задание','NEXT_EXERCISE')}{btn('Пройти ещё раз','REPEAT_EXERCISE',true)}</>,'check');break;
 case 'lessonResult':content=<>{center('Твоя первая звезда!','',<>{btn('Следующий урок','OPEN_NEXT_LESSON')}{btn('Пройти заново','REPEAT_LESSON',true)}</>,'star')}<Confetti/></>;break;
 case 'practiceIntro':content=center('Знакомые слова','Прочитай знакомые слова ещё раз.',btn('Потренироваться','START_PRACTICE'),'trail');break;
 case 'practiceResult':content=center('Отлично почитали!','',<>{btn('Потренировать ещё раз','REPEAT_PRACTICE',true)}{btn('Следующий урок','OPEN_NEXT_LESSON',true)}</>,'check');break;
 case 'profileSetup':content=<section className="profile-form"><h1>Твой профиль</h1><label>Имя (необязательно)<input maxLength={24} value={name} onChange={e=>setName(e.target.value)}/></label><div className="avatars">{avatars.map(x=><button key={x} aria-label={`Аватар ${x}`} className={avatar===x?'chosen':''} onClick={()=>setAvatar(x)}><Icon name={avatarIcon(x)}/></button>)}</div><div className="actions">{btn('Сохранить','SAVE_PROFILE',false,{name,avatar})}{btn(s.profileReturn==='profile'?'Отмена':'Позже','SKIP_PROFILE',true)}</div></section>;break;
 case 'profile':content=<ProfileView state={s} dispatch={send}/>;break;
 case 'profileSettings':content=<ProfileSettings state={s} dispatch={send}/>;break;
 case 'account':case 'login':case 'register':case 'passwordReset':case 'passwordResetSent':case 'access':case 'checkout':case 'paymentSuccess':case 'paymentFailed':content=<AdultScreens key={s.screen} state={s} dispatch={send} service={accountService}/>;break;
 case 'settings':content=<section className="settings"><h1>Всё для занятий</h1><div className="menu">{Object.keys(info).map(x=><button key={x} onClick={()=>emit(x==='Аккаунт'?'OPEN_ACCOUNT':x==='Доступ'?'OPEN_ACCESS':x==='Профили'?'OPEN_PROFILE_SETTINGS':'OPEN_INFO',{info:x})}><span className="menu-chip"><Icon name={menuIcons[x]}/></span>{x}<Icon name="arrow"/></button>)}</div></section>;break;
 case 'info':content=center(s.info,info[s.info],btn('Назад','OPEN_SETTINGS',true),'info');break;
 case 'nextLesson':content=center('Урок 2','Новая история ждёт впереди.',null,'book');break;
 default:content=null;
 }
 const adultArea=ADULT_SCREENS.has(s.screen);
 const inExercise=s.screen==='exercise'||s.screen==='practice';
 const learningScreens=['lessonIntro','exercise','exerciseResult','lessonResult','practiceIntro','practice','practiceResult','nextLesson'];
 const learning=learningScreens.includes(s.screen);
 const current=s.screen==='practice'?s.practice:s.lesson;
 const helpPractice=s.screen.startsWith('practice');
 const helpSnapshot=helpPractice?s.practice:s.lesson;
 const helpDefinition=lessonOne[helpSnapshot.exercise];
 const helpItems=helpPractice?practiceItems:helpDefinition.items;
 const helpWord=helpItems[Math.min(helpSnapshot.item,helpItems.length-1)];
 const undo=()=>{setDemoRequest(0);setDemoItem(null);if(gestureActive){setReadingKey(k=>k+1);setGestureActive(false)}else emit('UNDO_STEP')};
 const openHelp=()=>{setReadingKey(k=>k+1);emit('OPEN_HELP')};
 return <div className="page"><div className="portrait">Поверни экран</div><main className={`device screen-${s.screen}`} data-overlay={s.overlay||undefined}>
 {!['splash','onboarding'].includes(s.screen)&&<header className="appbar">
  {s.screen==='map'?<span className="appbar-title">Мой путь</span>:adultArea?<nav aria-label="Навигация взрослого"><button className="icon-button" aria-label="Назад" onClick={()=>emit('ADULT_BACK')}><Icon name="back"/></button><button className="icon-button" aria-label="Домой" onClick={()=>emit('OPEN_MAP')}><Icon name="home"/></button></nav>:<button className="icon-button" aria-label="Домой" onClick={()=>emit('OPEN_MAP')}><Icon name="home"/></button>}
  {learning?<nav aria-label="Действия занятия">
   {inExercise&&<><button className="icon-button" aria-label="Отменить шаг" disabled={!current.history.length&&!gestureActive} onClick={undo}><Icon name="undo"/></button><button className={`icon-button ${demoPlaying?'is-playing':''}`} data-playing={demoPlaying} aria-label="Проиграть заново" title="Проиграть заново" onClick={()=>{setReadingKey(k=>k+1);setDemoItem(helpWord.id);setDemoRequest(n=>n+1)}}>{demoPlaying?<span className="playing-bars" aria-hidden="true"><i/><i/><i/></span>:<Icon name="play"/>}</button></>}
   {['exercise','practice','exerciseResult'].includes(s.screen)&&<button className="icon-button" aria-label="Подсказка для взрослого" title="Подсказка для взрослого" onClick={openHelp}><Icon name="help"/></button>}
  </nav>:adultArea||s.screen==='profile'?null:<nav aria-label="Разделы"><button className="icon-button" aria-label="Профиль" onClick={()=>emit('OPEN_PROFILE')}><Icon name={avatarIcon(s.avatar)}/></button><button className="icon-button" aria-label="Настройки" onClick={()=>emit('OPEN_SETTINGS')}><Icon name="settings"/></button></nav>}
 </header>}
 <div className="screen-content" key={s.screen}>{content}</div>
 {s.overlay==='help'&&<LearningDialog title="Подсказка для взрослого" onClose={()=>emit('DISMISS_OVERLAY')}><p>{READING_EXPLANATION}</p><p>{helpPractice?'Слова сменяются автоматически после прохождения всех частей.':TASK_EXPLANATIONS[helpDefinition.kind]}</p><ReadingSurface item={helpWord} unit={0} disabled={false} readOnly demoRequest={1} loopDemo onAccept={()=>{}} onInvalid={()=>{}} onActive={()=>{}}/><button className="secondary" onClick={()=>emit('DISMISS_OVERLAY')}>Вернуться к заданию</button></LearningDialog>}
 {s.overlay==='lessonActions'&&<LearningDialog anchor='[aria-label="Урок 1"]' title="Урок 1 · Первые слова" onClose={()=>emit('DISMISS_OVERLAY')}><div className="dialog-actions">{lessonInProgress(s)&&btn('Продолжить урок','RESUME_LESSON')}{btn(practiceInProgress(s)?'Продолжить тренировку':s.practice.item>=practiceItems.length?'Тренироваться ещё раз':'Тренироваться','OPEN_PRACTICE_OPTION')}{btn('Пройти урок заново','REPEAT_LESSON',true)}</div></LearningDialog>}
 {s.overlay==='profileOffer'&&<LearningDialog title="Оформим профиль?" onClose={()=>emit('DISMISS_OVERLAY')}><div className="dialog-art"><Icon name={avatarIcon(s.avatar)}/></div><p>Можно выбрать имя и аватар ребёнка.</p><div className="dialog-actions">{btn('Оформить профиль','CONFIGURE_PROFILE')}{btn('Позже','DISMISS_OVERLAY',true)}</div></LearningDialog>}
 </main></div>;
}
