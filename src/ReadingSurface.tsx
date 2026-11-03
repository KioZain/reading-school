import {useEffect,useRef,useState} from 'react';
import{useWordDemo}from'./useWordDemo';
import {Gesture,pathFor,type ReadingItem} from './core';
export function ReadingSurface({item,unit,disabled,onAccept,onInvalid,onActive,onDemoChange,demoRequest=0,demoEnabled=true,loopDemo=false,readOnly=false}:{item:ReadingItem;unit:number;disabled:boolean;onAccept:(unit:number)=>void;onInvalid:(s:string)=>void;onActive:(active:boolean)=>void;onDemoChange?:(playing:boolean)=>void;demoRequest?:number;demoEnabled?:boolean;loopDemo?:boolean;readOnly?:boolean}){
 const demo=useWordDemo(item.id,item.units.length,demoRequest,demoEnabled,loopDemo);
 const playing=!!demo;useEffect(()=>{onDemoChange?.(playing)},[playing]);useEffect(()=>()=>onDemoChange?.(false),[]);
 const live=useRef<{id:number;g:Gesture;u:number}|null>(null);const [trace,setTrace]=useState(0);
 const cancel=()=>{live.current=null;setTrace(0);onActive(false)};
 useEffect(()=>{cancel();window.addEventListener('blur',cancel);return()=>{window.removeEventListener('blur',cancel);cancel()}},[item.id,unit,disabled,!!demo,readOnly]);
 return <div className="reading" data-demonstrating={!!demo} data-demo-unit={demo?.unit} aria-label={`Прочитай ${item.text}`}>
 {item.units.map((u,i)=>{const path=pathFor(u.kind);const d=path.map((p,j)=>`${j?'L':'M'}${p.x},${p.y}`).join(' ');const filled=demo?(i<demo.unit?40:i===demo.unit?demo.progress*40:0):(i<unit||disabled?40:i===unit?trace:0);return <svg key={i} viewBox="0 0 140 125" data-unit={i} className={`reading-unit ${i<unit||disabled?'accepted':''} ${(demo?i===demo.unit:i===unit&&!disabled)?'active':''}`}
 onPointerDown={e=>{if(readOnly||demo||disabled||i!==unit||live.current||!e.isPrimary)return;const r=e.currentTarget.getBoundingClientRect();const g=new Gesture(path);if(g.start({x:(e.clientX-r.left)*140/r.width,y:(e.clientY-r.top)*125/r.height})){live.current={id:e.pointerId,g,u:i};e.currentTarget.setPointerCapture(e.pointerId);setTrace(1);onActive(true)}}}
 onPointerMove={e=>{const v=live.current;if(!v||v.id!==e.pointerId)return;const r=e.currentTarget.getBoundingClientRect();v.g.move({x:(e.clientX-r.left)*140/r.width,y:(e.clientY-r.top)*125/r.height});setTrace(v.g.index);if(v.g.complete){live.current=null;onActive(false);onAccept(v.u)}else if(!v.g.valid){cancel();onInvalid('Попробуй ещё раз')}}}
 onPointerUp={e=>{if(live.current?.id===e.pointerId){cancel();onInvalid('Попробуй ещё раз')}}} onPointerCancel={cancel} onLostPointerCapture={cancel}>
 <text style={demo?{fill:i<=demo.unit?'var(--color-accent)':'var(--color-ink)'}:undefined} x="70" y="65" textAnchor="middle">{u.text}</text><path className="road" d={d}/><path className="ink" d={d} pathLength="40" strokeDasharray={`${filled} 40`} opacity={filled>0?1:0}/>
 </svg>})}</div>
}
