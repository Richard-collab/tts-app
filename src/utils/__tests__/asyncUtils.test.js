import { describe, it, expect } from 'vitest';
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

  it('should handle concurrency limit', async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const tasks = [
        async () => { await delay(10); return 'a'; },
        async () => { await delay(10); return 'b'; },
        async () => { await delay(10); return 'c'; }
    ];
    const start = Date.now();
    const results = await runWithConcurrency(tasks, 1);
    const end = Date.now();
    expect(results).toEqual(['a', 'b', 'c']);
    // If sequential (limit 1), it should take at least 30ms.
    expect(end - start).toBeGreaterThanOrEqual(25); // lenient check
  });

  it('should handle empty task list', async () => {
      const results = await runWithConcurrency([], 2);
      expect(results).toEqual([]);
  });
});
