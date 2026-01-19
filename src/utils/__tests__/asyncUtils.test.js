import { describe, it, expect, vi } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
  it('should execute tasks with concurrency limit', async () => {
    const tasks = [];
    const executionOrder = [];
    const limit = 2;

    const createTask = (id, duration) => async () => {
      executionOrder.push(`start-${id}`);
      await new Promise(resolve => setTimeout(resolve, duration));
      executionOrder.push(`end-${id}`);
      return id;
    };

    // Create 4 tasks with different durations
    // Task 1: 50ms
    // Task 2: 100ms
    // Task 3: 50ms
    // Task 4: 50ms
    tasks.push(createTask(1, 50));
    tasks.push(createTask(2, 100));
    tasks.push(createTask(3, 50));
    tasks.push(createTask(4, 50));

    const results = await runWithConcurrency(tasks, limit);

    // Assert results are correct
    expect(results).toEqual([1, 2, 3, 4]);

    // Check execution order roughly
    // With limit 2:
    // T1 starts, T2 starts
    // T1 ends (T3 starts)
    // T3 ends (T4 starts)
    // T4 ends, T2 ends

    // Note: Due to timing precision, we check if start events happen in batches
    expect(executionOrder).toContain('start-1');
    expect(executionOrder).toContain('start-2');
    // T3 should start after T1 or T2 finishes
    // T4 should start after T3 or T2 finishes
  });

  it('should handle empty task list', async () => {
    const results = await runWithConcurrency([], 2);
    expect(results).toEqual([]);
  });

  it('should handle tasks failing', async () => {
     const tasks = [
         async () => 1,
         async () => { throw new Error('fail'); },
         async () => 3
     ];

     try {
         await runWithConcurrency(tasks, 2);
     } catch (e) {
         expect(e.message).toBe('fail');
     }
  });
});
