import {useEffect,useRef,type ReactNode} from 'react';
import {animate} from 'motion';
// All timings and spring values are sourced from src/tokens.css.
const token=(name:string)=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const gentleMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.input==='keyboard';
export const springOptions=()=>({type:'spring' as const,duration:parseFloat(token('--motion-spring-duration'))/1000,bounce:Number(token('--motion-bounce'))});
export function SpringArt({children,trigger=true,className=''}:{children:ReactNode;trigger?:unknown;className?:string}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{if(!ref.current||!trigger||gentleMotion())return;const animation=animate(ref.current,{transform:['translateY(4%) scale(0.94)','translateY(0%) scale(1)']},springOptions());return()=>animation.stop()},[trigger]);
 return <span ref={ref} className={`spring-art ${className}`}>{children}</span>
}
export function returnToOrigin(element:HTMLElement,x:number,y:number){
 if(gentleMotion())return;
 return animate(element,{transform:[`translate(${x}px, ${y}px)`,'translate(0px, 0px)']},springOptions());
}
