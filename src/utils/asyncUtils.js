/**
 * Executes a list of async tasks with a concurrency limit.
 * @param {Array<() => Promise<any>>} tasks - Array of functions that return a promise.
 * @param {number} limit - The maximum number of concurrent tasks.
 * @returns {Promise<any[]>} - A promise that resolves with the array of results.
 */
export async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = task().then(result => {
      executing.splice(executing.indexOf(p), 1);
      return result;
    });
    results.push(p);
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}
