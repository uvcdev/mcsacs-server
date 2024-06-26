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
  MonthlyStatisticDeleteParams,
  MonthlyStatisticInsertParams,
  MonthlyStatisticSelectListParams,
  MonthlyStatisticUpdateParams,
} from '../../models/dashboard/monthlyStatistic';
import { service as monthlyStatisticService } from '../../service/dashboard/dailyStatisticService';
import { service as eventHistoryService } from '../../service/common/eventHistoryService';
import { Payload } from '../../lib/tokenUtil';

const router = express.Router();

const TABLE_NAME = 'monthlyStatistics'; // 이벤트 히스토리를 위한 테이블 명

// MonthlyStatistic 등록
router.post(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, MonthlyStatisticInsertParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    // console.log('data', req.body.dataJson);
    try {
      const params: MonthlyStatisticInsertParams = {
        // userId: req.body.userId ? req.body.userId : tokenUser?.id || null, // 파라미터에 있는 userId를 우선시 한다
        data: req.body.data || null,
      };
      logging.REQUEST_PARAM(logFormat);
      // 입력값 체크
      // if (!params.userId) {
      //   throw new ErrorClass(resCode.UNAUTHORIZED_ACCESSTOKEN, 'userid is undefined');
      // }

      // 비즈니스 로직 호출
      const result = await monthlyStatisticService.reg(params, logFormat);

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

// MonthlyStatistic 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, MonthlyStatisticSelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: MonthlyStatisticSelectListParams = {
        ids: req.query.ids ? (req.query.ids as unknown as string).split(',').map((i) => Number(i)) : null,
        limit: Number(req.query.limit),
        offset: Number(req.query.offset),
      };
      logging.REQUEST_PARAM(logFormat);
      // 비즈니스 로직 호출
      const result = await monthlyStatisticService.list(params, logFormat);
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

// MonthlyStatistic 정보 수정
router.put(
  '/id/:id',
  isLoggedIn,
  async (req: Request<MonthlyStatisticUpdateParams, unknown, MonthlyStatisticUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: MonthlyStatisticUpdateParams = {
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
      const result = await monthlyStatisticService.edit(params, logFormat);

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

// MonthlyStatistic 삭제
router.delete(
  '/id/:id',
  isLoggedIn,
  async (req: Request<MonthlyStatisticDeleteParams, unknown, MonthlyStatisticDeleteParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      // 요청 파라미터
      // token의 id로 하면 로그인 사용자의 id로 monthlyStatistic 테이블의 레코드 삭제하기 때문에
      // body로 직접 받아서 처리 (param or body??)
      const params: MonthlyStatisticDeleteParams = {
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
      const result: DeletedResult = await monthlyStatisticService.delete(params, logFormat);

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
