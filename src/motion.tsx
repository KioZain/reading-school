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
const confettiColors=['--c-berry','--c-sky','--c-sun','--c-grass','--c-lav','--c-orange'];
/** Two launchers at the bottom corners throw pieces up and inward; they slow down, then fall and fade. */
export function Confetti({count=60}:{count?:number}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const box=ref.current;if(!box||gentleMotion())return;
  const {width,height}=box.getBoundingClientRect();const delay=parseFloat(token('--motion-reward-confetti-delay'))/1000;const duration=parseFloat(token('--motion-reward-confetti'))/1000;
  const animations=(Array.from(box.children) as HTMLElement[]).map((el,i)=>{const side=i%2?-1:1;el.style.left=`${(side>0?.1:.9)*width+(Math.random()-.5)*width*.12}px`;
   const dx=side*width*(.06+Math.random()*.4),rise=height*(.45+Math.random()*.5),spin=(Math.random()-.5)*900;
   return animate(el,{transform:['translate(0px, 0px) rotate(0deg)',`translate(${dx}px, ${-rise}px) rotate(${spin/2}deg)`,`translate(${dx*1.3}px, ${-rise*.5}px) rotate(${spin}deg)`],opacity:[1,1,0]},{duration:duration*(.8+Math.random()*.4),delay:delay+Math.random()*.18,times:[0,.42,1],ease:['easeOut','easeIn']})});
  return()=>animations.forEach(a=>a.stop())},[]);
 return <div ref={ref} className="confetti" aria-hidden="true">{Array.from({length:count},(_,i)=><i key={i} className={i%3?'':'round'} style={{background:`var(${confettiColors[i%confettiColors.length]})`}}/>)}</div>
}
