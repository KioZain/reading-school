export type DemoFrame={unit:number;progress:number};
export const DEMO_UNIT_MS=900,DEMO_GAP_MS=180;
export function demoFrame(elapsed:number,count:number,loop=false,unitMs=DEMO_UNIT_MS,gapMs=DEMO_GAP_MS):DemoFrame|null{
 if(count<1||elapsed<0)return null;const total=count*(unitMs+gapMs);
 if(!loop&&elapsed>=total)return null;
 const t=elapsed%total;return{unit:Math.floor(t/(unitMs+gapMs)),progress:Math.min(1,(t%(unitMs+gapMs))/unitMs)};
}
