import { describe, it, expect, vi } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should run all tasks and return results in order', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];
    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual([1, 2, 3]);
  });

  it('should respect concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;

    const createTask = (duration) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise(resolve => setTimeout(resolve, duration));
      running--;
      return 'done';
    };

    const tasks = [
      createTask(50),
      createTask(50),
      createTask(50),
      createTask(50),
      createTask(50),
    ];

    await runWithConcurrency(tasks, 2);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('should handle empty task list', async () => {
    const results = await runWithConcurrency([], 5);
    expect(results).toEqual([]);
  });

  it('should propagate errors', async () => {
    const tasks = [
      () => Promise.resolve('ok'),
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve('ok'),
    ];

    await expect(runWithConcurrency(tasks, 2)).rejects.toThrow('fail');
  });
});
