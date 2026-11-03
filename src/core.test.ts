import {describe,it,expect} from 'vitest';
import {createSession,transition,lessonOne,practiceItems,pathFor,Gesture} from './core';
describe('session',()=>{
 it('waits for game action, rejects stale events and undoes both steps',()=>{let s=createSession();s=transition(s,{type:'START_LESSON'});s={...s,lesson:{exercise:2,item:0,unit:0,ready:false,history:[]}};const id='1.3:0';s=transition(s,{type:'READING_ACCEPTED',id,unit:0});s=transition(s,{type:'READING_ACCEPTED',id,unit:1});expect(s.lesson.ready).toBe(true);expect(s.lesson.item).toBe(0);expect(transition(s,{type:'READING_ACCEPTED',id,unit:1})).toBe(s);s=transition(s,{type:'GAME_ACTION_ACCEPTED',id});expect(s.lesson.item).toBe(1);s=transition(s,{type:'UNDO_STEP'});expect(s.lesson.ready).toBe(true);s=transition(s,{type:'UNDO_STEP'});expect(s.lesson.unit).toBe(1);});
 it('keeps lesson and practice independent and awards once',()=>{let s=createSession();s={...s,screen:'exerciseResult',lesson:{exercise:5,item:3,unit:0,ready:false,history:[]}};s=transition(s,{type:'NEXT_EXERCISE'});expect(s.completed).toBe(true);s=transition(s,{type:'REPEAT_LESSON'});expect(s.completed).toBe(true);s=transition(s,{type:'START_PRACTICE'});expect(s.lesson.item).toBe(0);s=transition(s,{type:'READING_ACCEPTED',id:'practice:0',unit:0});expect(s.practice.unit).toBe(1);expect(s.lesson.unit).toBe(0);expect(createSession().completed).toBe(false);});
 it('has exact lesson content',()=>{expect(lessonOne.map(x=>x.items.length)).toEqual([3,7,3,3,3,3]);expect(practiceItems.map(x=>x.text)).toEqual(['мама','папа','яма','ма','па','я']);});
});
describe('gesture',()=>{
 it('accepts sequential traversal but not a jump',()=>{const p=pathFor('syllable');let g=new Gesture(p);expect(g.start(p[0])).toBe(true);for(const q of p)g.move(q);expect(g.complete).toBe(true);g=new Gesture(p);g.start(p[0]);g.move(p.at(-1)!);expect(g.complete).toBe(false);});
 it('rejects wrong start and deviations',()=>{const p=pathFor('letter');const g=new Gesture(p);expect(g.start({x:999,y:999})).toBe(false);g.start(p[0]);g.move({x:999,y:999});expect(g.complete).toBe(false);});
});
describe('recovery',()=>{
 it('restores selected leaf on undo',()=>{let s=createSession();s={...s,screen:'exercise',lesson:{exercise:3,item:0,unit:0,ready:true,history:[]}};s=transition(s,{type:'GAME_ACTION_ACCEPTED',id:'1.4:0',choice:2});expect(s.lesson.choices).toEqual([2]);s=transition(s,{type:'UNDO_STEP'});expect(s.lesson.choices).toBeUndefined();expect(s.lesson.ready).toBe(true);});
 it('allows clearing a saved name and preserves unlocked marker on repeat',()=>{let s={...createSession(),name:'Миша',completed:true};s=transition(s,{type:'SAVE_PROFILE',name:'',avatar:'☀'});expect(s.name).toBe('');s=transition(s,{type:'REPEAT_LESSON'});expect(transition(s,{type:'OPEN_NEXT_LESSON'}).screen).toBe('nextLesson');});
});
