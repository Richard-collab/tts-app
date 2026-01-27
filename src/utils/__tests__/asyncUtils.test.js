import { describe, it, expect } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('runWithConcurrency', () => {
  it('should run all tasks and return results in order', async () => {
    const tasks = [
      () => delay(10).then(() => 1),
      () => delay(5).then(() => 2),
      () => delay(10).then(() => 3),
    ];

    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual([1, 2, 3]);
  });

  it('should respect concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;

    const task = async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await delay(20);
      running--;
      return 'done';
    };

    const tasks = Array(10).fill(task);
    await runWithConcurrency(tasks, 3);

    expect(maxRunning).toBeLessThanOrEqual(3);
  });
});
