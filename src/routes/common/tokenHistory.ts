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
  TokenHistoryInsertParams,
  TokenHistorySelectListParams,
  TokenHistorySelectInfoParams,
  // TokenHistoryUpdateParams,
  // TokenHistoryDeleteParams,
  TokenHistorySelectAllUsersParams,
} from '../../models/common/tokenHistory';
import { service as tokenHistoryService } from '../../service/common/tokenHistoryService';

const router = express.Router();

const TABLE_NAME = 'token_histories'; // 이벤트 히스토리를 위한 테이블 명

// tokenHistory 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, TokenHistorySelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: TokenHistorySelectListParams = {
        companyIds: req.query.companyIds
          ? (req.query.companyIds as unknown as string).split(',').map((i) => Number(i))
          : null,
        userIds: req.query.userIds ? (req.query.userIds as unknown as string).split(',').map((i) => Number(i)) : null,
        action: req.query.action,
        createdAtFrom: req.query.createdAtFrom ? new Date(req.query.createdAtFrom) : null,
        createdAtTo: req.query.createdAtTo ? new Date(req.query.createdAtTo) : null,
        limit: Number(req.query.limit || 'NaN'),
        offset: Number(req.query.offset || 'NaN'),
        order: req.query.order,
      };
      logging.REQUEST_PARAM(logFormat);

      // 비즈니스 로직 호출
      const result = await tokenHistoryService.list(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.LIST);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

// tokenHistory 상세정보 조회
router.get(
  '/id/:id',
  isLoggedIn,
  async (req: Request<TokenHistorySelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: TokenHistorySelectInfoParams = {
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
      const result = await tokenHistoryService.info(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.INFO);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답 값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

// 사용자 로그인+활동 현황 조회
router.get(
  '/users',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, TokenHistorySelectAllUsersParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: TokenHistorySelectAllUsersParams = {
        companyIds: req.query.companyIds
          ? (req.query.companyIds as unknown as string).split(',').map((i) => Number(i))
          : null,
        createdAtFrom: req.query.createdAtFrom ? new Date(req.query.createdAtFrom) : null,
        createdAtTo: req.query.createdAtTo ? new Date(req.query.createdAtTo) : null,
      };
      logging.REQUEST_PARAM(logFormat);

      // 비즈니스 로직 호출
      const result = await tokenHistoryService.listTokenUsers(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.LIST);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)

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
