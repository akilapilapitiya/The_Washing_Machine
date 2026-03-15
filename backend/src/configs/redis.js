import logger from './logger.js';
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnect = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
  });

  redis.on("connect", () => {
    logger.info("Redis connected");
  });

  redis.on("error", (err) => {
    logger.error("Redis connection error:", err);
  });

  return redis;
};

const redis = redisConnect();

export const clearCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info({ keysCleared: keys.length, pattern }, "Cache invalidated successfully.");
    }
  } catch (err) {
    logger.error("Error clearing Redis cache by pattern:", err);
  }
};

export default redis;
