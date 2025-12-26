/**
 * Fetches a resource with retry logic.
 *
 * @param {string} url - The URL to fetch.
 * @param {object} options - Fetch options.
 * @param {number} [maxRetries=3] - Maximum number of retries.
 * @param {number} [retryDelay=1000] - Delay between retries in milliseconds.
 * @returns {Promise<Response>} - The fetch response.
 */
export const fetchWithRetry = async (url, options, maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;
      }
    }
  }
  throw lastError;
};
