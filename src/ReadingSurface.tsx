import {useEffect,useRef,useState} from 'react';
import {Gesture,pathFor,type ReadingItem} from './core';
export function ReadingSurface({item,unit,disabled,onAccept,onInvalid,onActive}:{item:ReadingItem;unit:number;disabled:boolean;onAccept:(unit:number)=>void;onInvalid:(s:string)=>void;onActive:(active:boolean)=>void}){
 const live=useRef<{id:number;g:Gesture;u:number}|null>(null);const [trace,setTrace]=useState(0);
 const cancel=()=>{live.current=null;setTrace(0);onActive(false)};
 useEffect(()=>{cancel();window.addEventListener('blur',cancel);return()=>{window.removeEventListener('blur',cancel);cancel()}},[item.id,unit,disabled]);
 return <div className="reading" aria-label={`Прочитай ${item.text}`}>
 {item.units.map((u,i)=>{const path=pathFor(u.kind);const d=path.map((p,j)=>`${j?'L':'M'}${p.x},${p.y}`).join(' ');return <svg key={i} viewBox="0 0 140 125" data-unit={i} className={`reading-unit ${i<unit||disabled?'accepted':''} ${i===unit&&!disabled?'active':''}`}
 onPointerDown={e=>{if(disabled||i!==unit||live.current||!e.isPrimary)return;const r=e.currentTarget.getBoundingClientRect();const g=new Gesture(path);if(g.start({x:(e.clientX-r.left)*140/r.width,y:(e.clientY-r.top)*125/r.height})){live.current={id:e.pointerId,g,u:i};e.currentTarget.setPointerCapture(e.pointerId);setTrace(1);onActive(true)}}}
 onPointerMove={e=>{const v=live.current;if(!v||v.id!==e.pointerId)return;const r=e.currentTarget.getBoundingClientRect();v.g.move({x:(e.clientX-r.left)*140/r.width,y:(e.clientY-r.top)*125/r.height});setTrace(v.g.index);if(v.g.complete){live.current=null;onActive(false);onAccept(v.u)}else if(!v.g.valid){cancel();onInvalid('Попробуй ещё раз')}}}
 onPointerUp={e=>{if(live.current?.id===e.pointerId){cancel();onInvalid('Попробуй ещё раз')}}} onPointerCancel={cancel} onLostPointerCapture={cancel}>
 <text x="70" y="65" textAnchor="middle">{u.text}</text><path className="road" d={d}/><path className="ink" d={d} pathLength="40" strokeDasharray={`${i<unit||disabled?40:i===unit?trace:0} 40`}/><circle cx={path[0].x} cy={path[0].y} r="8" className="start"/><path d={`M${path.at(-1)!.x-5},${path.at(-1)!.y-5} l6,5 l-6,5`} className="arrow"/>
 </svg>})}</div>
}
