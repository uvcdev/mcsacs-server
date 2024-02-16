/* eslint-disable @typescript-eslint/unbound-method */
import { logging } from './logging';
import redis, { RedisClient } from 'redis';
import * as dotenv from 'dotenv';
dotenv.config();
import { promisify } from 'util';

// redis 접속 환경
type RedisConfig = {
  host: string;
  port: number;
  header: string;
};

const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || '',
  port: Number(process.env.REDIS_PORT || 6379),
  header: process.env.REDIS_HEADER || 'ACS', // Redis의 헤더를 키값에 접두사로 붙여준다.
};

let redisClient: RedisClient;
if (redisConfig.host) {
  redisClient = redis.createClient(redisConfig.port, redisConfig.host);
  redisClient.on('error', (error) => {
    logging.SYSTEM_ERROR(
      {
        title: 'redis error',
        message: null,
      },
      error
    );
  });
}

// redis의 key값을 DB에 따라 만들어준다.
export const makeKey = (key: string): string => {
  return `${redisConfig.header}-${key}`;
};

/**
 * redis.flushall
 */
export const redisFlushall = (): void => {
  if (redisClient) redisClient.flushall();
};

/* setter */

/**
 * redis.set
 * @param key key
 * @param value value
 */
export const redisSet = (key: string, value: string): void => {
  if (redisClient) redisClient.set(makeKey(key), value);
};

/**
 * redis.setex
 * @param key key
 * @param seconds expire seconds
 * @param value value
 */
export const redisSetEx = (key: string, seconds: number, value: string): void => {
  if (redisClient) redisClient.setex(makeKey(key), seconds, value);
};

/**
 * redis.hset
 * @param key key
 * @param field field
 * @param value value
 */
export const redisHset = (key: string, field: string, value: string): void => {
  if (redisClient) redisClient.hset(makeKey(key), field, value);
};

/* getter - async 기능 */

/**
 * await redis.get
 * @param key key
 * @returns value
 */
export const redisGet = async (key: string): Promise<string | null> => {
  if (redisClient && redisClient.get(makeKey(key))) {
    const asyncGet = promisify(redisClient.get).bind(redisClient);
    return await asyncGet(makeKey(key));
  } else {
    return null;
  }
};

/**
 * await redis.hget
 * @param key key
 * @param field field
 * @returns value
 */
export const redisHget = async (key: string, field: string): Promise<string | null> => {
  if (redisClient && redisClient.hget(makeKey(key), field)) {
    const asyncHget = promisify(redisClient.hget).bind(redisClient);
    return await asyncHget(makeKey(key), field);
  } else {
    return null;
  }
};

/* delete */
/**
 * Redis 삭제 (del)
 * @param key redis key
 */
export const redisDel = (key: string): void => {
  if (redisClient) redisClient.del(makeKey(key));
};
/**
 * Redis 삭제 (hdel)
 * @param key hkey
 * @param field field
 */
export const redisHdel = (key: string, field: string): void => {
  if (redisClient) redisClient.hdel(makeKey(key), field);
};
