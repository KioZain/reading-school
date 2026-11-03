import{useEffect,useState}from'react';import{demoFrame,DEMO_UNIT_MS,DEMO_GAP_MS,type DemoFrame}from'./demo';
export function useWordDemo(id:string,count:number,request:number,enabled=true,loop=false){
 const[frame,setFrame]=useState<DemoFrame|null>(null);
 useEffect(()=>{setFrame(null);if(!enabled||request===0)return;
 const style=getComputedStyle(document.documentElement);const unit=parseFloat(style.getPropertyValue('--motion-reading-unit'))||DEMO_UNIT_MS;const gap=parseFloat(style.getPropertyValue('--motion-reading-gap'))||DEMO_GAP_MS;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;const start=performance.now();let raf=0;
 const tick=(now:number)=>{const next=demoFrame(now-start,count,loop,unit,gap);setFrame(next?{...next,progress:reduced?1:next.progress}:null);if(next)raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[id,count,request,enabled,loop]);return frame;
}
