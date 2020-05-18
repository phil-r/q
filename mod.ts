export function queue<T, R>(runner: (task: T) => R, concurrency: number) {
  if (concurrency <= 0) {
    throw new RangeError('concurrency can only be a positive integer');
  }
  if (!Number.isInteger(concurrency)) {
    throw new RangeError('concurrency can only be a positive integer');
  }
  const tasks: T[] = [];
  let running = 0;
  let drains: (() => any)[] = [];
  let onError: (task: T, error: Error) => any = () => {};
  let onDone: (task: T, result: R) => any = () => {};
  let drainAwaiters: any[] = [];

  function drained() {
    drains.forEach((d) => d());
    drains = [];
    drainAwaiters.forEach((s) => s());
    drainAwaiters = [];
  }

  async function runNext() {
    if (running < concurrency && tasks.length > 0) {
      running++;
      const task = tasks.shift();
      if (task) {
        try {
          const result = await runner(task);
          onDone(task, result);
        } catch (err) {
          onError(task, err);
        }
      }
      running--;

      if (tasks.length > 0) {
        queueMicrotask(runNext); // to prevent "Maximum call stack size exceeded"
      } else if (running === 0) {
        drained();
      }
    }
  }

  return {
    push: (task: T | T[]) => {
      let needed = 1;
      if (Array.isArray(task)) {
        tasks.push(...task);
        needed = task.length;
      } else {
        tasks.push(task);
      }
      const free = concurrency - running;
      for (let i = 0; i < Math.max(free, needed); i++) {
        runNext();
      }
    },
    drain: (fn?: any): void | Promise<any> => {
      if (fn) {
        drains.push(fn);
      } else if (tasks.length > 0 || running > 0) {
        return new Promise((resolve) => drainAwaiters.push(resolve));
      } else {
        return Promise.resolve();
      }
    },
    onError: (fn: (task: T, error: Error) => any) => (onError = fn),
    onDone: (fn: (task: T, result: R) => any) => (onDone = fn),
  };
}
