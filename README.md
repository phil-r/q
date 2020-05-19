# Q

[![CI](https://github.com/phil-r/q/workflows/CI/badge.svg)](https://github.com/phil-r/q/actions?query=workflow%3ACI)

> Simple queue task runner written in typescript

## Usage

```ts
import { queue } from 'https://deno.land/x/q/mod.ts';

let result = 0;
const task = (a: number) => (result += a);
const q = queue(task, 2); // 2 is concurrency

q.drain(() => {
  console.log(`Result: ${result}`);
}); // will log `Result: 6`

q.push(1);
q.push([2, 3]);
```

or using async/await

```ts
import { queue } from 'https://deno.land/x/q/mod.ts';

let result = 0;
const task = (a: number) => (result += a);
const q = queue(task, 2); // 2 is concurrency

q.push(1);
q.push([2, 3]);

await q.drain();
console.log(`Result: ${result}`); // will log `Result: 6`
```

it's also possible to use `onDone` and `onError` callbacks

```ts
import { queue } from 'https://deno.land/x/q/mod.ts';

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
```

## Run tests

```
deno test
```
