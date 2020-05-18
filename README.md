# Q

![CI](https://github.com/phil-r/q/workflows/CI/badge.svg)

> Simple queue task runner written in typescript

## Usage

```ts
import { queue } from '../mod.ts'; // TODO: update with public link

let result = 0;
const task = (a: number) => (result += a);
const q = queue(task, 2); // 2 is concurrency

q.drain(()=>{console.log(`Result: ${result}`)}); // will log `Result: 6`

q.push(1);
q.push([2, 3]);
```

or using async/await

```ts
import { queue } from '../mod.ts';

(async () => {
  let result = 0;
  const task = (a: number) => (result += a);
  const q = queue(task, 2); // 2 is concurrency

  q.push(1);
  q.push([2, 3]);

  await q.drain();
  console.log(`Result: ${result}`);
})();
```


## Run tests

```
deno test
```
