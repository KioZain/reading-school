import {useEffect,useReducer,useState} from 'react';
import {Icon,avatarIcon,avatars,type IconName} from './Icon';
import {exerciseInstruction} from './copy';
import {SpringArt} from './motion';
import {activeId,createSession,lessonOne,practiceItems,transition} from './core';
import {ReadingSurface} from './ReadingSurface';import {ExerciseScene} from './ExerciseScene';
const onboarding=[['Здравствуй, читатель!','Будем читать и играть.','book'],['Читаем по дорожке','Веди от точки и читай.','trail'],['Вместе интереснее','Читай вместе со взрослым.','people']];
const menuIcons:Record<string,IconName>={'Звук':'sound','Аккаунт':'profile','Доступ':'lock','Профили':'people','Методика':'trail','Документы':'info'};
const info:Record<string,string>={'Звук':'Занятие проходит без звука. Читайте вслух вместе.','Аккаунт':'Здесь находится информация об аккаунте взрослого.','Доступ':'Первый урок открыт. После него можно познакомиться со следующим.','Профили':'Имя и аватар можно изменить в профиле ребёнка.','Методика':'Читайте слоги по дорожке, затем соединяйте их в слова. Занимайтесь вместе и в удобном темпе.','Документы':'Информация об условиях занятий и обработке данных.'};
export default function App(){
 const [s,send]=useReducer(transition,undefined,createSession);const [error,setError]=useState('');const [gestureActive,setGestureActive]=useState(false);const [readingKey,setReadingKey]=useState(0);const [name,setName]=useState('');const [avatar,setAvatar]=useState('○');
 const emit=(type:string,extra={})=>send({type,...extra});
 useEffect(()=>{if(s.screen==='profileSetup'){setName(s.name);setAvatar(s.avatar)}},[s.screen]);const invalid=(v:string)=>setError(v);
 useEffect(()=>{if(s.screen==='splash'){const t=setTimeout(()=>emit('SHOW_ONBOARDING'),650);return()=>clearTimeout(t)}},[s.screen]);
 useEffect(()=>{setError('')},[s.screen,s.lesson.item,s.lesson.unit,s.practice.item,s.practice.unit]);
 useEffect(()=>{if(!error)return;const t=setTimeout(()=>setError(''),1600);return()=>clearTimeout(t)},[error]);
 const btn=(label:string,type:string,secondary=false,extra={})=><button className={secondary?'secondary':'primary'} onClick={()=>emit(type,extra)}>{label}</button>;
 const center=(eyebrow:string,title:string,body:string,children:React.ReactNode,symbol:IconName='book')=><section className={`center ${s.screen==='splash'?'splash':''}`}><div className={`hero-symbol ${s.screen==='lessonResult'?'reward':''}`}><SpringArt key={s.screen}><Icon name={symbol}/></SpringArt></div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{body&&<p>{body}</p>}<div className="actions">{children}</div></section>;
 let content:React.ReactNode;
 switch(s.screen){
 case 'splash':content=center('','Школа чтения','',null);break;
 case 'onboarding':{const o=onboarding[s.onboarding];content=<>{center(`ЗНАКОМСТВО · ${s.onboarding+1} / 3`,o[0],o[1],<>{btn('Далее','NEXT_ONBOARDING')}{btn('Пропустить','SKIP_ONBOARDING',true)}</>,o[2] as IconName)}<div className="dots">{onboarding.map((_,i)=><i key={i} className={i===s.onboarding?'selected':''}/>)}</div></>;break;}
 case 'map':content=<section className="map"><div className="map-heading"><h1>Давай читать!</h1></div><div className="map-path"><div className="dashed"/>{[0,1,2].map(i=><div className={`map-stop stop-${i}`} key={i}><button aria-label={`Урок ${i+1}`} disabled={i===2||i===1&&!s.completed} onClick={()=>emit(i?'OPEN_NEXT_LESSON':s.started?'RESUME_LESSON':'LESSON_INTRO')} className={`lesson-marker ${i===0?s.completed?'is-done':'is-current':i===1&&s.completed?'is-current':''}`}>{i===0?s.completed?<Icon name="star"/>:'1':i===1&&s.completed?'2':<Icon name="lock"/>}</button><strong>Урок {i+1}</strong><small>{i===0?'Первые слова':i===1&&s.completed?'Уже доступен':'Впереди'}</small></div>)}</div><div className="map-actions">{btn(s.started?'Продолжить':'Начать урок',s.started?'RESUME_LESSON':'LESSON_INTRO')}{s.completed&&btn('Тренировка','PRACTICE_INTRO',true)}{s.completed&&btn('Пройти заново','REPEAT_LESSON',true)}</div></section>;break;
 case 'lessonIntro':content=center('УРОК 1 · 6 ЗАДАНИЙ','Первые слова','Прочитаем слова и поможем друзьям.',btn('Начать','START_LESSON'),'sun');break;
 case 'exercise':case 'practice':{const practice=s.screen==='practice';const snap=practice?s.practice:s.lesson;const def=lessonOne[snap.exercise];const items=practice?practiceItems:def.items;const word=items[snap.item];content=<section className={`exercise ${practice?'practice':''}`}><div className="exercise-heading"><div><div className="eyebrow">{practice?'ТРЕНИРОВКА':`ЗАДАНИЕ ${snap.exercise+1} / 6`}</div><h2>{practice?'Читаем ещё раз':def.title}</h2></div><div className="step-progress">{items.map((_,i)=><i key={i} className={i<snap.item?'done':i===snap.item?'current':''}/>)}</div></div><p className="instruction">{exerciseInstruction(def.kind,snap.item,snap.ready,practice)||'\u00a0'}</p>{!practice&&<ExerciseScene key={snap.exercise} snap={snap} onAccept={choice=>emit('GAME_ACTION_ACCEPTED',{id:activeId(s),choice})} onInvalid={invalid}/>}<div className={`word-panel ${error?'shake':''}`}><ReadingSurface key={readingKey} onActive={setGestureActive} item={word} unit={snap.unit} disabled={snap.ready} onAccept={unit=>emit('READING_ACCEPTED',{id:activeId(s),unit})} onInvalid={invalid}/></div><div className="feedback" role="status">{error&&<span>{error}</span>}</div></section>;break;}
 case 'exerciseResult':content=center(`ЗАДАНИЕ ${s.lesson.exercise+1} / 6`,'Здорово получилось!','',<>{btn(s.lesson.exercise===5?'Завершить урок':'Следующее задание','NEXT_EXERCISE')}{btn('Пройти ещё раз','REPEAT_EXERCISE',true)}</>,'check');break;
 case 'lessonResult':content=center('УРОК 1 ПРОЙДЕН','Твоя первая звезда!','',<>{btn(s.profileOffered?'На карту':'Оформить профиль','AFTER_REWARD')}{btn('Домой','OPEN_MAP',true)}{btn('Пройти заново','REPEAT_LESSON',true)}{btn('Следующий урок','OPEN_NEXT_LESSON',true)}</>,'star');break;
 case 'practiceIntro':content=center('ТРЕНИРОВКА','Знакомые слова','Прочитай знакомые слова ещё раз.',btn('Потренироваться','START_PRACTICE'),'trail');break;
 case 'practiceResult':content=center('ТРЕНИРОВКА','Отлично почитали!','',<>{btn('Домой','OPEN_MAP')}{btn('Потренировать ещё раз','REPEAT_PRACTICE',true)}{btn('Следующий урок','OPEN_NEXT_LESSON',true)}</>,'check');break;
 case 'profileSetup':content=<section className="profile-form"><h1>Твой профиль</h1><label>Имя (необязательно)<input maxLength={24} value={name} onChange={e=>setName(e.target.value)}/></label><div className="avatars">{avatars.map(x=><button key={x} aria-label={`Аватар ${x}`} className={avatar===x?'chosen':''} onClick={()=>setAvatar(x)}><Icon name={avatarIcon(x)}/></button>)}</div><div className="actions">{btn('Сохранить','SAVE_PROFILE',false,{name,avatar})}{btn('Позже','SKIP_PROFILE',true)}</div></section>;break;
 case 'profile':content=center('ПРОФИЛЬ',s.name||'Юный читатель',s.completed?'★  Пройдено занятий: 1 · Время занятия: ≈ 5 мин':'Пройдено занятий: 0',btn('Изменить профиль','EDIT_PROFILE'),avatarIcon(s.avatar));break;
 case 'settings':content=<section className="settings"><div className="eyebrow">НАСТРОЙКИ</div><h1>Всё для занятий</h1><div className="menu">{Object.keys(info).map(x=><button key={x} onClick={()=>emit('OPEN_INFO',{info:x})}><span className="menu-chip"><Icon name={menuIcons[x]}/></span>{x}<Icon name="arrow"/></button>)}</div></section>;break;
 case 'info':content=center('НАСТРОЙКИ',s.info,info[s.info],btn('Назад','OPEN_SETTINGS',true),'info');break;
 case 'nextLesson':content=center('СЛЕДУЮЩЕЕ ОТКРЫТИЕ','Урок 2','Новая история ждёт впереди.',btn('Домой','OPEN_MAP'),'book');break;
 default:content=null;
 }
 const inExercise=s.screen==='exercise'||s.screen==='practice';
 const current=s.screen==='practice'?s.practice:s.lesson;
 const undo=()=>{if(gestureActive){setReadingKey(k=>k+1);setGestureActive(false)}else emit('UNDO_STEP')};
 return <div className="page"><div className="portrait">Поверни экран</div><main className={`device screen-${s.screen}`}>
 {!['splash','onboarding'].includes(s.screen)&&<header className="appbar">
  {s.screen==='map'?<span className="appbar-title">Мой путь</span>:<button className="icon-button" aria-label="Домой" onClick={()=>emit('OPEN_MAP')}><Icon name="home"/></button>}
  {inExercise?<><span className="appbar-context">{s.screen==='practice'?'Тренировка':'Урок 1'}</span><button className="icon-button" aria-label="Отменить шаг" disabled={!current.history.length&&!gestureActive} onClick={undo}><Icon name="undo"/></button></>:<nav aria-label="Разделы"><button className="icon-button" aria-label="Профиль" onClick={()=>emit('OPEN_PROFILE')}><Icon name={avatarIcon(s.avatar)}/></button><button className="icon-button" aria-label="Настройки" onClick={()=>emit('OPEN_SETTINGS')}><Icon name="settings"/></button></nav>}
 </header>}
 <div className="screen-content" key={s.screen}>{content}</div></main></div>;
}
