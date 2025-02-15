/**
 * Stores data in the local storage with a specified time-to-live (TTL).
 *
 * @param {string} key - The key under which the data will be stored.
 * @param {*} data - The data to be stored in the cache.
 * @param {number} ttl - The time-to-live for the cached data in milliseconds.
 */
function setCache (key, data, ttl) {
  const now = new Date();
  const item = {
    data: data,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves an item from localStorage by key and checks if it is expired.
 * If the item is expired, it is removed from localStorage and null is returned.
 * 
 * @param {string} key - The key of the item to retrieve from localStorage.
 * @returns {*} The data associated with the key, or null if the item is not found or expired.
 */
function getCache(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.data;
}

// Export the functions
export { setCache, getCache };