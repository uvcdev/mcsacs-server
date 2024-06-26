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
  SelectedListResult,
  DeletedResult,
} from '../../lib/resUtil';
import {
  DailyStatisticDeleteParams,
  DailyStatisticInsertParams,
  DailyStatisticSelectListParams,
  DailyStatisticUpdateParams,
} from '../../models/dashboard/dailyStatistic';
import { service as dailyStatisticService } from '../../service/dashboard/dailyStatisticService';
import { service as eventHistoryService } from '../../service/common/eventHistoryService';
import { Payload } from '../../lib/tokenUtil';

const router = express.Router();

const TABLE_NAME = 'dailyStatistics'; // 이벤트 히스토리를 위한 테이블 명

// DailyStatistic 등록
router.post(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, DailyStatisticInsertParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: DailyStatisticInsertParams = {
        data: req.body.data || null,
      };
      logging.REQUEST_PARAM(logFormat);
      // 입력값 체크
      // if (!params.userId) {
      //   throw new ErrorClass(resCode.UNAUTHORIZED_ACCESSTOKEN, 'userid is undefined');
      // }

      // 비즈니스 로직 호출
      const result = await dailyStatisticService.reg(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.REG);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'Create', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);
      return res.status(resJson.status).json(resJson);
    }
  }
);

// DailyStatistic 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, DailyStatisticSelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: DailyStatisticSelectListParams = {
        ids: req.query.ids ? (req.query.ids as unknown as string).split(',').map((i) => Number(i)) : null,
        limit: Number(req.query.limit),
        offset: Number(req.query.offset),
      };
      logging.REQUEST_PARAM(logFormat);
      // 비즈니스 로직 호출
      const result = await dailyStatisticService.list(params, logFormat);
      // 최종 응답값 세팅
      // front test 필요
      const resJson = resSuccess(result, resType.LIST);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'SelectList', TABLE_NAME);
      return res.status(resJson.status).json(resJson);
    } catch (err) {
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);
      return res.status(resJson.status).json(resJson);
    }
  }
);

// DailyStatistic 정보 수정
router.put(
  '/id/:id',
  isLoggedIn,
  async (req: Request<DailyStatisticUpdateParams, unknown, DailyStatisticUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: DailyStatisticUpdateParams = {
        id: Number(req.params.id),
        data: req.body.data,
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
      const result = await dailyStatisticService.edit(params, logFormat);

      // 최종 응답값 세팅
      const resJson = resSuccess(result, resType.EDIT);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'Update', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);
      return res.status(resJson.status).json(resJson);
    }
  }
);

// DailyStatistic 삭제
router.delete(
  '/id/:id',
  isLoggedIn,
  async (req: Request<DailyStatisticDeleteParams, unknown, DailyStatisticDeleteParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      // 요청 파라미터
      // token의 id로 하면 로그인 사용자의 id로 dashboard 테이블의 레코드 삭제하기 때문에
      // body로 직접 받아서 처리 (param or body??)
      const params: DailyStatisticDeleteParams = {
        id: Number(req.params.id),
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력값 체크
      if (!params.id || isNaN(params.id)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');
        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result: DeletedResult = await dailyStatisticService.delete(params, logFormat);

      // 최종 응답값 세팅
      const resJson = resSuccess(result, resType.DELETE);
      logging.RESPONSE_DATA(logFormat, resJson);
      // 이벤트 로그 기록(비동기)
      void eventHistoryService.reg(tokenUser as Payload, resJson, logFormat, 'Delete', TABLE_NAME);

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      const resJson = resError(err);
      return res.status(resJson.status).json(resJson);
    }
  }
);

export { router };
