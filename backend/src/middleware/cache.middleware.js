import redisClient from "../configs/redis.js";
import logger from "../configs/logger.js";

/**
 * Express Middleware for Redis Edge Caching.
 * Intercepts GET requests, checks Redis for a matching URL key,
 * returns exactly cached JSON if found. Otherwise, intercepts
 * res.json to save the Database output to Redis automatically.
 *
 * @param {number} ttlSeconds - Time-to-live for the cached data in seconds.
 */
export const cacheMiddleware =
  (ttlSeconds = 3600) =>
  async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create a unique cache key based on the full URL path and query parameters
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        logger.info({ cacheKey }, "Redis Edge Cache Hit. Serving from RAM.");
        return res.status(200).json(JSON.parse(cachedData));
      }

      logger.info(
        { cacheKey },
        "Redis Edge Cache Miss. Fetching from Database.",
      );

      // Intercept the original res.json function
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Restore standard Express behavior immediately
        originalJson(body);

        // Save successful responses (HTTP 200/201) to Redis asynchronously
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient
            .set(cacheKey, JSON.stringify(body), "EX", ttlSeconds)
            .catch((err) => {
              logger.error(
                { err, cacheKey },
                "Failed to persist Database response to Redis Edge Cache.",
              );
            });
        }
      };

      next();
    } catch (error) {
      logger.error(
        { error },
        "Fatal Error in Redis Edge Caching Middleware. Falling back to primary Database.",
      );
      next();
    }
  };
