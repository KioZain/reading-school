import{useEffect,useRef,type ReactNode}from'react';import{Icon}from'./Icon';
/** Native modal supplies focus containment, Escape and restoration to the trigger.
 With `anchor`, it becomes a context card pinned to that element, its arrow pointing at it. */
export function LearningDialog({title,onClose,children,anchor}:{title:string;onClose:()=>void;children:ReactNode;anchor?:string}){
 const ref=useRef<HTMLDialogElement>(null);
 const close=()=>{ref.current?.close();onClose()};
 useEffect(()=>{const el=ref.current!;const opener=document.activeElement as HTMLElement|null;el.showModal();
  // Every dialog stays inside the phone frame: centred in it, or pinned to the anchor and clamped to its edges.
  const place=()=>{const frame=(document.querySelector('.device')??document.documentElement).getBoundingClientRect(),gap=18,edge=12;
   el.style.maxWidth=`${Math.min(640,frame.width-edge*2)}px`;el.style.maxHeight=`${frame.height-edge*2}px`;
   const w=el.offsetWidth,h=el.offsetHeight,clampX=(x:number)=>Math.min(Math.max(frame.left+edge,x),frame.right-w-edge),target=anchor&&document.querySelector(anchor);
   if(!target){el.style.left=`${clampX(frame.left+(frame.width-w)/2)}px`;el.style.top=`${frame.top+(frame.height-h)/2}px`;return}
   const r=target.getBoundingClientRect(),center=r.left+r.width/2,left=clampX(center-w/2);const below=frame.bottom-r.bottom>=h+gap+edge,above=r.top-frame.top>=h+gap+edge;
   el.style.left=`${left}px`;el.style.top=`${below?r.bottom+gap:above?r.top-gap-h:Math.max(frame.top+edge,frame.bottom-h-edge)}px`;el.style.setProperty('--arrow-x',`${center-left}px`);el.dataset.placement=below?'below':above?'above':'overlap'};
  place();const resize=new ResizeObserver(place);resize.observe(el);addEventListener('resize',place);addEventListener('scroll',place,true);
  return()=>{resize.disconnect();removeEventListener('resize',place);removeEventListener('scroll',place,true);el.close();if(opener?.isConnected)opener.focus()}},[]);
 return <dialog ref={ref} className={`learning-dialog ${anchor?'popover':''}`} aria-labelledby="learning-dialog-title" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}}}>
 <div className="dialog-heading"><h2 id="learning-dialog-title">{title}</h2><button autoFocus className="icon-button" aria-label="Закрыть" onClick={close}><Icon name="close"/></button></div>{children}</dialog>
}
