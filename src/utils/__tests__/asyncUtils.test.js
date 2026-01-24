import { describe, it, expect } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should run tasks with concurrency limit', async () => {
    // Helper to create a task that resolves after a delay
    const createTask = (id, delay) => async () => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return id;
    };

    const tasks = [
      createTask(1, 100),
      createTask(2, 50),
      createTask(3, 100),
      createTask(4, 50),
    ];

    // Limit to 2 concurrent tasks
    // Time 0: Start 1 (100ms) and 2 (50ms). Running: [1, 2]
    // Time 50: 2 finishes. Start 3 (100ms). Running: [1, 3]
    // Time 100: 1 finishes. Start 4 (50ms). Running: [3, 4]
    // Time 150: 3 and 4 finish.

    const start = Date.now();
    const results = await runWithConcurrency(tasks, 2);
    const end = Date.now();
    const duration = end - start;

    expect(results).toEqual([1, 2, 3, 4]);
    // The total time should be roughly 150ms.
    // If sequential: 300ms.
    // If fully parallel: 100ms.
    expect(duration).toBeGreaterThanOrEqual(140);
    // Allow some buffer for execution overhead
  });

  it('should handle empty task list', async () => {
    const results = await runWithConcurrency([], 5);
    expect(results).toEqual([]);
  });

  it('should preserve order of results regardless of completion time', async () => {
     const tasks = [
      async () => { await new Promise(r => setTimeout(r, 100)); return 'A'; },
      async () => { await new Promise(r => setTimeout(r, 10)); return 'B'; },
    ];
    const results = await runWithConcurrency(tasks, 2);
    expect(results).toEqual(['A', 'B']);
  });
});
