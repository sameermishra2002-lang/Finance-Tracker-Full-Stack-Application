import redisClient from "../config/redis.js";

/**
 * Get cached data
 */
export const getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Set cache with expiry
 */
export const setCache = async (key, data, ttl) => {
  await redisClient.set(key, JSON.stringify(data), {
    EX: ttl
  });
};

/**
 * Delete cache
 */

export const clearCache = async (pattern) => {
  const keys = await redisClient.keys(`${pattern}*`);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};


// export const clearCache = async (key) => {
//   await redisClient.del(key);
// };