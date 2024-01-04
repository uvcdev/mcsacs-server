/* eslint-disable @typescript-eslint/no-misused-promises */
import * as express from 'express';
import { Request, Response } from 'express';
import { isLoggedIn } from '../../lib/middleware';
import { logging, makeLogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  makeResponseSuccess as resSuccess,
  responseType as resType,
  makeResponseError as resError,
  ErrorClass,
} from '../../lib/resUtil';
import { redisFlushall, redisSet, redisHset, redisGet, redisHget } from '../../lib/redisUtil';

const router = express.Router();

interface RedisSetParams {
  key: string;
  value: string;
}

interface RedisGetParams {
  key?: string;
}

interface RedisHsetParams {
  key: string;
  field: string;
  value: string;
}

interface RedisHgetParams {
  key?: string;
  field?: string;
}

// redis reset 전체 초기화
//  등록
router.post('/flushall', isLoggedIn, (req: Request<unknown, unknown, unknown, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  // const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // redis 저장
    void redisFlushall();

    return res.status(200).json(true);
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// redis set 등록 테스트
router.post('/set', isLoggedIn, (req: Request<unknown, unknown, RedisSetParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  // const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: RedisSetParams = {
      key: req.body.key,
      value: req.body.value,
    };
    logging.REQUEST_PARAM(logFormat);

    // redis 저장
    void redisSet(params.key, params.value);

    return res.status(200).json(params);
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// redis get 조회 테스트
router.get('/get/:key', isLoggedIn, async (req: Request<RedisGetParams, unknown, unknown, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  // const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: RedisGetParams = {
      key: req.params.key,
    };
    logging.REQUEST_PARAM(logFormat);

    // redis 조회
    const resJson = await redisGet(params.key ? params.key : 'key');

    return res.status(200).json({
      resJson,
    });
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// redis hset 등록 테스트
router.post('/hset', isLoggedIn, (req: Request<unknown, unknown, RedisHsetParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  // const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: RedisHsetParams = {
      key: req.body.key,
      field: req.body.field,
      value: req.body.value,
    };
    logging.REQUEST_PARAM(logFormat);

    // redis 저장
    void redisHset(params.key, params.field, params.value);

    return res.status(200).json(params);
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// redis hget 조회 테스트
router.get(
  '/hget/:key/:field',
  isLoggedIn,
  async (req: Request<RedisHgetParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    // const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: RedisHgetParams = {
        key: req.params.key,
        field: req.params.field,
      };
      logging.REQUEST_PARAM(logFormat);

      // redis 조회
      const resJson = await redisHget(params.key ? params.key : 'key', params.field ? params.field : 'field');

      return res.status(200).json({
        resJson,
      });
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

export { router };
