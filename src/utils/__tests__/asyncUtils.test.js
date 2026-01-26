import { describe, it, expect, vi } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should execute all tasks and return results in order', async () => {
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

    const task = (id, duration) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise(resolve => setTimeout(resolve, duration));
      running--;
      return id;
    };

    const tasks = [
      task(1, 50),
      task(2, 50),
      task(3, 50),
      task(4, 50),
    ];

    const results = await runWithConcurrency(tasks, 2);

    expect(results).toEqual([1, 2, 3, 4]);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('should handle empty task list', async () => {
    const results = await runWithConcurrency([], 2);
    expect(results).toEqual([]);
  });

  it('should handle tasks that reject', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve(3),
    ];

    await expect(runWithConcurrency(tasks, 2)).rejects.toThrow('fail');
  });
});
