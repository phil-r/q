import { queue } from 'https://deno.land/x/q/mod.ts';
// import { queue } from 'https://raw.githubusercontent.com/phil-r/q/v0.0.1/mod.ts';
// import { queue } from '../mod.ts';

let result = 0;
const task = (a: number) => {
  if (a === 4) throw Error('ow no');
  return (result += a);
};
const q = queue(task, 2); // 2 is concurrency

q.push([1, 2, 3, 4]);

q.onDone((task, result) =>
  console.log(`For task: ${task}, result is ${result}`)
);

/* 
Will log:
For task: 1, result is 1
For task: 2, result is 3
For task: 3, result is 6
*/

q.onError((task, error) => console.error(`Task: ${task} failed with ${error}`));
// Will log: Task: 4 failed with Error: ow no

await q.drain();
console.log(`Result: ${result}`); // will log `Result: 6`
