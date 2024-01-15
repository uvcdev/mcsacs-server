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
import { Payload } from '../../lib/tokenUtil';
import {
  MaterialInsertParams,
  MaterialSelectListParams,
  MaterialSelectInfoParams,
  MaterialUpdateParams,
  MaterialDeleteParams,
} from '../../models/operation/material';
import { service as eventHistoryService } from '../../service/common/eventHistoryService';
import { service as materialService } from '../../service/operation/materialService';

const router = express.Router();

const TABLE_NAME = 'materials'; // 이벤트 히스토리를 위한 테이블 명

// material 등록
router.post('/', isLoggedIn, async (req: Request<unknown, unknown, MaterialInsertParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: MaterialInsertParams = {
      code: req.body.code,
      type: req.body.type,
    };
    logging.REQUEST_PARAM(logFormat);

    // 입력값 체크
    if (!params.code) {
      const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (code)');

      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }

    // 비즈니스 로직 호출
    const result = await materialService.reg(params, logFormat);

    // 최종 응답 값 세팅
    const resJson = resSuccess(result, resType.REG);
    logging.RESPONSE_DATA(logFormat, resJson);

    // 이벤트 로그 기록(비동기)
    void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'Create', TABLE_NAME);

    return res.status(resJson.status).json(resJson);
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// material 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, MaterialSelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: MaterialSelectListParams = {
        ids: req.query.ids ? ((req.query.ids as unknown) as string).split(',').map((i) => Number(i)) : null,
        code: req.query.code,
        type: req.query.type,
        limit: Number(req.query.limit || 'NaN'),
        offset: Number(req.query.offset || 'NaN'),
        order: req.query.order,
      };
      logging.REQUEST_PARAM(logFormat);

      // 비즈니스 로직 호출
      const result = await materialService.list(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.LIST);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'SelectList', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

// material 상세정보 조회
router.get(
  '/id/:id',
  isLoggedIn,
  async (req: Request<MaterialSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: MaterialSelectInfoParams = {
        id: Number(req.params.id),
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력 값 체크
      if (!params.id || isNaN(params.id)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result = await materialService.info(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.INFO);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'SelectInfo', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

// material 정보 수정
router.put(
  '/id/:id',
  isLoggedIn,
  async (req: Request<MaterialUpdateParams, unknown, MaterialUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: MaterialUpdateParams = {
        id: Number(req.params.id),
        code: req.body.code,
        type: req.body.type,
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력값 체크
      if (!params.code) {
        const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (code)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출

      const result = await materialService.edit(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.EDIT);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'Update', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

// material 삭제
router.delete(
  '/id/:id',
  isLoggedIn,
  async (req: Request<MaterialDeleteParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: MaterialDeleteParams = {
        id: Number(req.params.id),
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력 값 체크
      if (!params.id || isNaN(params.id)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result = await materialService.delete(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.DELETE);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'Delete', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

export { router };
