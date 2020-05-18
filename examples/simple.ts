import { queue } from '../mod.ts';

let result = 0;
const task = (a: number) => (result += a);
const q = queue(task, 2); // 2 is concurrency

q.drain(()=>{console.log(`Result: ${result}`)});

q.push(1);
q.push([2, 3]);