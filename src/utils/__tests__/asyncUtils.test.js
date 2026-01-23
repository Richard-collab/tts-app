import { describe, it, expect } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should execute tasks and return results in order', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3)
    ];
    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual([1, 2, 3]);
  });

  it('should handle concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const createTask = (id) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await delay(50);
      running--;
      return id;
    };

    const tasks = Array.from({ length: 10 }, (_, i) => createTask(i));
    const results = await runWithConcurrency(tasks, 3);

    expect(results).toHaveLength(10);
    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(maxRunning).toBeLessThanOrEqual(3);
  });
});
