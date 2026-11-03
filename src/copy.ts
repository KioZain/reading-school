/** Show the instruction that belongs to the current step, once per new reading mode. */
export function exerciseInstruction(kind:string,item:number,ready:boolean,practice=false):string {
 if(practice)return item===0?'Веди от точки и читай':'';
 if(ready){
  switch(kind){
   case 'basket':return 'Положи предмет в кузовок';
   case 'leaves':return 'Выбери лист';
   case 'clouds':return 'Коснись тучки';
   case 'garages':return 'Перетащи машину к такому же слогу';
  }
 }
 if(kind==='intro-reading'&&item===0)return 'Веди от точки и читай';
 if(kind==='ladder'&&item===0)return 'Читай — кузнечик поднимется';
 return '';
}
