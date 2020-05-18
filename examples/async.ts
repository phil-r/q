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
