import{useEffect,useRef,useState}from'react';import{Icon}from'./Icon';
export function NarrationButton(){
 const audio=useRef<HTMLAudioElement>(null);const[playing,setPlaying]=useState(false);const[error,setError]=useState(false);
 useEffect(()=>{const el=audio.current!;return()=>{el.pause();el.currentTime=0}},[]);
 const toggle=async()=>{const el=audio.current!;setError(false);if(!el.paused){el.pause();el.currentTime=0;return}try{el.currentTime=0;await el.play()}catch{setError(true)}};
 return <div className="narration"><audio ref={audio} src={`${import.meta.env.BASE_URL}audio/lesson-one-intro.m4a`} preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setPlaying(false);setError(true)}}/><button className="icon-button" aria-label={playing?'Остановить озвучку':'Озвучить инструкцию'} aria-pressed={playing} title="Озвучить инструкцию" onClick={toggle}><Icon name={playing?'stop':'megaphone'}/></button>{error&&<p role="status">Не удалось включить озвучку. Прочитайте инструкцию вслух.</p>}</div>
}
