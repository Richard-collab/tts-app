import { describe, it, expect, vi } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should return results for a list of tasks', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];
    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual([1, 2, 3]);
  });

  it('should handle empty task list', async () => {
    const results = await runWithConcurrency([], 2);
    expect(results).toEqual([]);
  });

  it('should handle tasks fewer than limit', async () => {
    const tasks = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
    ];
    const results = await runWithConcurrency(tasks, 5);
    expect(results).toEqual(['a', 'b']);
  });

  it('should resolve in order even if completion times vary', async () => {
    const delay = (ms, val) => new Promise(resolve => setTimeout(() => resolve(val), ms));
    const tasks = [
      () => delay(50, 1), // slow
      () => delay(10, 2), // fast
      () => delay(30, 3), // medium
    ];

    // limit 1 ensures sequential execution for debugging, but we want to test concurrency
    // limit 3 allows all to start. 2 finishes first, then 3, then 1.
    // Promise.all(results) should sort them back to index order.

    const results = await runWithConcurrency(tasks, 3);
    expect(results).toEqual([1, 2, 3]);
  });

  it('should respect concurrency limit', async () => {
    let activeCount = 0;
    let maxActive = 0;

    const task = async () => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);
      await new Promise(resolve => setTimeout(resolve, 10));
      activeCount--;
      return 'done';
    };

    const tasks = Array(10).fill(() => task());

    await runWithConcurrency(tasks, 3);

    expect(maxActive).toBeLessThanOrEqual(3);
  });
});
