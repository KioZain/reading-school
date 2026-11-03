import {useEffect,useLayoutEffect,useRef,useState} from 'react';import {animate} from 'motion';
import {lessonOne,type Snapshot} from './core';
import {Icon,type IconName} from './Icon';
import {SpringArt,returnToOrigin,gentleMotion,motionSeconds} from './motion';
export function ExerciseScene({snap,onAccept,onInvalid}:{snap:Snapshot;onAccept:(choice?:number)=>void;onInvalid:(s:string)=>void}){
 const [drag,setDrag]=useState<{id:number;x:number;y:number}|null>(null);const returning=useRef<ReturnType<typeof returnToOrigin>>(undefined);const def=lessonOne[snap.exercise];
 useEffect(()=>()=>{returning.current?.stop()},[]);
 const act=(choice:number)=>snap.ready?onAccept(choice):onInvalid('Сначала прочитай');
 const draggable=(art:IconName)=><div role="button" aria-label={def.kind==='basket'?'Предмет':'Машина'} tabIndex={0} className={`drag-object ${snap.ready?'unlocked':''} ${drag?'dragging':''}`} style={{transform:drag?`translate(${drag.x}px,${drag.y}px)`:undefined}}
 onKeyDown={e=>{if(e.key==='Enter')onInvalid(snap.ready?'Перетащи предмет к цели':'Сначала прочитай')}}
 onPointerDown={e=>{if(!snap.ready){onInvalid('Сначала прочитай');return}if(drag||!e.isPrimary)return;const matrix=new DOMMatrixReadOnly(getComputedStyle(e.currentTarget).transform);returning.current?.stop();e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.x=String(e.clientX-matrix.m41);e.currentTarget.dataset.y=String(e.clientY-matrix.m42);setDrag({id:e.pointerId,x:matrix.m41,y:matrix.m42})}}
 onPointerMove={e=>{if(drag?.id===e.pointerId)setDrag({id:e.pointerId,x:e.clientX-Number(e.currentTarget.dataset.x),y:e.clientY-Number(e.currentTarget.dataset.y)})}}
 onPointerUp={e=>{if(drag?.id!==e.pointerId)return;const targets=Array.from(document.querySelectorAll<HTMLElement>('[data-target]'));const target=targets.find(t=>{const r=t.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});const accepted=target&&target.dataset.target===(def.kind==='basket'?'basket':def.items[snap.item].text);if(!accepted)returning.current=returnToOrigin(e.currentTarget,drag.x,drag.y);setDrag(null);if(accepted)onAccept();else onInvalid(target?'Найди такой же слог':def.kind==='basket'?'Положи в кузовок':'Перетащи в гараж')}}
 onPointerCancel={e=>{if(drag){returning.current=returnToOrigin(e.currentTarget,drag.x,drag.y);setDrag(null)}}}>
 <SpringArt trigger={snap.ready}><Icon name={art}/></SpringArt></div>;
 if(def.kind==='intro-reading')return <div className="scene first-scene"><div className="scene-sun"><Icon name="sun"/></div><div className="reading-book"><Icon name="book"/></div></div>;
 if(def.kind==='ladder'){const at=Math.min(snap.item,6);return <div className="scene ladder"><div className="ladder-track">{def.items.map((x,i)=><div key={i} className="rung" style={{bottom:`${i*100/6}%`,left:`${8+i*12}%`}}><span>{i<snap.item&&i!==at?<Icon name="check" className="rung-check"/>:null}</span><small className="exercise-word">{x.text}</small></div>)}<Hopper step={at}/></div></div>}
 if(def.kind==='basket')return <div className="scene basket-scene"><span className="bear"><Icon name="bear"/></span>{draggable((['book','pencil','notebook'] as IconName[])[snap.item])}<div className="basket target" data-target="basket"><span>Кузовок</span><small>{Array.from({length:snap.item},(_,i)=><Icon key={i} name="check"/>)}</small></div></div>;
 if(def.kind==='leaves')return <div className="scene tree"><div className="trunk"/>{[0,1,2].map(i=><button aria-label={`Лист ${i+1}`} key={i} className={`leaf leaf-${i} ${snap.choices?.includes(i)?'colored':''}`} disabled={snap.choices?.includes(i)} onClick={()=>act(i)}><SpringArt trigger={snap.choices?.includes(i)}><Icon name="leaf"/></SpringArt></button>)}</div>;
 if(def.kind==='clouds')return <div className="scene cloud-scene">{[0,1,2].map(i=><button aria-label={`Тучка ${i+1}`} key={i} disabled={snap.choices?.includes(i)} onClick={()=>act(i)} className={`cloud ${snap.choices?.includes(i)?'is-cake':''}`}><SpringArt trigger={snap.choices?.includes(i)}><Icon name={snap.choices?.includes(i)?'cake':'cloud'}/></SpringArt></button>)}</div>;
 return <div className="scene garages">{draggable('car')}<div className="garage-row">{['ма','я','па'].map((x,i)=><div key={x} className={`garage target ${i<snap.item?'filled':''}`} data-target={x}><span className="exercise-word">{x}</span><small>{i<snap.item?<SpringArt><Icon name="car"/></SpringArt>:null}</small></div>)}</div></div>;
}

/** The grasshopper stands on its rung and hops along an arc to the next one: push off, stretch in the air, squash on landing. */
function Hopper({step}:{step:number}){
 const ref=useRef<HTMLSpanElement>(null),last=useRef<DOMRect|null>(null),hop=useRef<ReturnType<typeof animate>>(undefined);
 useLayoutEffect(()=>{const el=ref.current!;hop.current?.stop();const now=el.getBoundingClientRect(),from=last.current;last.current=now;if(!from||gentleMotion())return;
  const dx=from.left-now.left,dy=from.top-now.top;if(!dx&&!dy)return;const lift=Math.abs(dy)/2+Math.max(24,now.height*.6);
  hop.current=animate(el,{transform:[`translate(${dx}px, ${dy}px) scale(1.08, .9)`,`translate(${dx/2}px, ${dy/2-lift}px) scale(.94, 1.08) rotate(-8deg)`,'translate(0px, 0px) scale(1.1, .88)','translate(0px, 0px) scale(1, 1)'],},{duration:motionSeconds('--motion-hop'),times:[0,.45,.82,1],ease:['easeOut','easeIn','easeOut']});
 },[step]);
 useEffect(()=>()=>hop.current?.stop(),[]);
 return <span ref={ref} className="hopper" style={{left:`calc(${8+step*12}% + var(--rung-w) / 2)`,bottom:`calc(${step*100/6}% + var(--rung-h))`}}><Icon name="bug"/></span>;
}
