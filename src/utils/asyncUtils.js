/**
 * Executes a list of async tasks with a specified concurrency limit.
 *
 * @param {Array<() => Promise<any>>} tasks - An array of functions that return a promise.
 * @param {number} limit - The maximum number of concurrent tasks.
 * @returns {Promise<Array<any>>} - A promise that resolves to an array of results in the same order as the input tasks.
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
