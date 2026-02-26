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
    console.log("Redis connected");
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  return redis;
};

const redis = redisConnect();

export default redis;
