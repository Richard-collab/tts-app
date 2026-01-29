import { describe, it, expect } from 'vitest';
import { runWithConcurrency } from '../asyncUtils';

describe('runWithConcurrency', () => {
    it('should execute all tasks and return results in order', async () => {
        const tasks = [
            async () => 1,
            async () => 2,
            async () => 3
        ];
        const results = await runWithConcurrency(tasks, 2);
        expect(results).toEqual([1, 2, 3]);
    });

    it('should respect concurrency limit', async () => {
        let activeCount = 0;
        let maxActive = 0;

        const createTask = (duration) => async () => {
            activeCount++;
            maxActive = Math.max(maxActive, activeCount);
            await new Promise(resolve => setTimeout(resolve, duration));
            activeCount--;
            return 'done';
        };

        const tasks = [
            createTask(20),
            createTask(20),
            createTask(20),
            createTask(20),
            createTask(20)
        ];

        // Limit 2
        await runWithConcurrency(tasks, 2);

        expect(maxActive).toBeLessThanOrEqual(2);
    });

    it('should handle empty task list', async () => {
        const results = await runWithConcurrency([], 5);
        expect(results).toEqual([]);
    });

    it('should handle errors correctly', async () => {
        const tasks = [
            async () => 1,
            async () => { throw new Error('fail'); },
            async () => 3
        ];

        await expect(runWithConcurrency(tasks, 2)).rejects.toThrow('fail');
    });
});
