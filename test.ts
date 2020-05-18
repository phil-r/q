import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std/testing/asserts.ts';
import { spy, Spy } from 'https://deno.land/x/mock/spy.ts';
import { queue } from './mod.ts';

Deno.test('drain as callback', async function (): Promise<void> {
  let result = 0;
  const task: Spy<void> = spy((a: number) => (result += a));
  const q = queue(task, 2);
  return new Promise((resolve) => {
    q.drain(() => {
      assertEquals(result, 6);
      assertEquals(task.calls.length, 3);
      assertEquals(task.calls[2].args, [3]);
      resolve();
    });
    q.push(1);
    q.push([2, 3]);
  });
});

Deno.test('async drain', async function (): Promise<void> {
  let result = 0;
  const task: Spy<void> = spy((a: number) => (result += a));
  const q = queue(task, 2);
  q.push(1);
  q.push([2, 3]);
  await q.drain();
  assertEquals(result, 6);
  assertEquals(task.calls.length, 3);
  q.push(1);
  await q.drain();
  assertEquals(result, 7);
  assertEquals(task.calls.length, 4);
  assertEquals(task.calls[3].args, [1]);
});

Deno.test('multiple drains as callback', async function (): Promise<any> {
  let result = 0;
  const task: Spy<void> = spy((a: number) => (result += a));
  const q = queue(task, 2);
  return Promise.all([
    new Promise((resolve) => {
      q.drain(() => {
        assertEquals(result, 6);
        resolve();
      });
    }),
    new Promise((resolve) => {
      q.drain(() => {
        assertEquals(result, 6);
        resolve();
      });
      q.push(1);
      q.push([2, 3]);
    }),
  ]);
});

Deno.test('onDone works', async function (): Promise<any> {
  let result = 0;
  const task: Spy<void> = spy((a: number) => (result += a));
  const done: Spy<void> = spy(() => {});
  const q = queue(task, 2);
  q.onDone(done);
  q.push(1);
  q.push([2, 3]);
  await q.drain();
  assertEquals(done.calls.length, 3);
  assertEquals(done.calls[0].args, [1, 1]);
  assertEquals(done.calls[1].args, [2, 3]);
  assertEquals(done.calls[2].args, [3, 6]);
});

Deno.test('onError works', async function (): Promise<any> {
  const task: Spy<void> = spy((a: number) => {
    throw new Error('ow no!');
  });
  const error: Spy<void> = spy(() => {
    // console.log('error!!11');
  });
  const q = queue(task, 2);
  q.onError(error);
  q.push(1);
  q.push([2, 3]);
  await q.drain();

  assertEquals(error.calls.length, 3);
  assertEquals(error.calls[0].args[0], 1);
  assertEquals(error.calls[1].args[0], 2);
  assertEquals(error.calls[2].args[0], 3);
});

Deno.test('throws with wrong concurrency', async function (): Promise<any> {
  assertThrows(() => {
    queue(() => {}, -2);
  });
  assertThrows(() => {
    queue(() => {}, 0);
  });
  assertThrows(() => {
    queue(() => {}, -99999999999999999999999999);
  });
  assertThrows(() => {
    queue(() => {}, 2.5);
  });
});

Deno.test(
  'works with high amount of tasks and low concurrency',
  async function (): Promise<any> {
    let result = 0;
    const N = 100000;
    const task: Spy<void> = spy((a: number) => (result += a));
    const q = queue(task, 1);
    const jobs = new Array(N + 1)
      .join(',')
      .split('')
      .map((_) => 1);
    q.push(jobs);
    await q.drain();
    assertEquals(result, N);
    assertEquals(task.calls.length, N);
  }
);
Deno.test(
  'works with high amount of async tasks and high concurrency',
  async function (): Promise<any> {
    let result = 0;
    const N = 100000;
    const task: Spy<void> = spy((a: number) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          result += a;
          resolve();
        }, 5);
      });
    });
    const q = queue(task, 1000);
    const jobs = new Array(N + 1)
      .join(',')
      .split('')
      .map((_) => 1);
    q.push(jobs);
    await q.drain();
    assertEquals(result, N);
    assertEquals(task.calls.length, N);
  }
);
