import { describe, it, expect, vi } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should return results in correct order', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];
    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual([1, 2, 3]);
  });

  it('should handle empty tasks', async () => {
    const results = await runWithConcurrency([], 2);
    expect(results).toEqual([]);
  });

  it('should handle concurrency limit', async () => {
    // We can't easily verify the exact concurrency without detailed timing or mocks,
    // but we can ensure it completes correctly with a limit smaller than task count.
    const tasks = Array.from({ length: 10 }, (_, i) => () => Promise.resolve(i));
    const results = await runWithConcurrency(tasks, 3);
    expect(results).toHaveLength(10);
    expect(results).toEqual(Array.from({ length: 10 }, (_, i) => i));
  });

  it('should handle delayed tasks', async () => {
    const delay = (ms, val) => new Promise(resolve => setTimeout(() => resolve(val), ms));
    const tasks = [
        () => delay(20, 'a'),
        () => delay(10, 'b'),
        () => delay(30, 'c')
    ];
    // even though 'b' finishes first, result should be ['a', 'b', 'c']
    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual(['a', 'b', 'c']);
  });
});
