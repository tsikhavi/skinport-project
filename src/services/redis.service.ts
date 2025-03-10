import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();


const redisUrl = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;
if (!redisUrl || !redisPort) {
  throw new Error("REDIS_URL/ REDIS_PORT is not defined");
}
const redis = new Redis(redisUrl);

export const getCache = async (key: string) => {
  return redis.get(key);
};

export const setCache = async (key: string, value: string, ttl: number) => {
  await redis.set(key, value, "EX", ttl);
};

export default redis;
