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
  AlarmDeleteParams,
  AlarmInsertParams,
  AlarmSelectListParams,
  AlarmSelectInfoParams,
  AlarmUpdateParams,
} from '../../models/common/alarm';
import { service as alarmService } from '../../service/common/alarmService';
import { service as eventHistoryService } from '../../service/common/eventHistoryService';
import { Payload } from '../../lib/tokenUtil';

const router = express.Router();

const TABLE_NAME = 'alarms'; // 이벤트 히스토리를 위한 테이블 명

// Alarm 등록
router.post('/', isLoggedIn, async (req: Request<unknown, unknown, AlarmInsertParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  const tokenUser = (req as { decoded?: Payload }).decoded;
  try {
    const params: AlarmInsertParams = {
      facilityId: req.body.facilityId,
      state: req.body.state,
      data: req.body.data || null,
    };
    logging.REQUEST_PARAM(logFormat);
    // 입력값 체크
    if (!params.facilityId) {
      throw new ErrorClass(resCode.UNAUTHORIZED_ACCESSTOKEN, 'Not allowed null (facilityId)');
    }

    // 비즈니스 로직 호출
    const result = await alarmService.reg(params, logFormat);

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
});

// Alarm 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, AlarmSelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: AlarmSelectListParams = {
        ids: req.query.ids ? ((req.query.ids as unknown) as string).split(',').map((i) => Number(i)) : null,
        facilityId: req.query.facilityId,
        state: req.query.state,
        limit: Number(req.query.limit),
        offset: Number(req.query.offset),
      };
      logging.REQUEST_PARAM(logFormat);
      // 비즈니스 로직 호출
      const result = await alarmService.list(params, logFormat);
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

// alarm 상세정보 조회
router.get(
  '/id/:id',
  isLoggedIn,
  async (req: Request<AlarmSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: AlarmSelectInfoParams = {
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
      const result = await alarmService.info(params, logFormat);

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

// Alarm 정보 수정
router.put(
  '/id/:id',
  isLoggedIn,
  async (req: Request<AlarmUpdateParams, unknown, AlarmUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      const params: AlarmUpdateParams = {
        id: Number(req.params.id),
        facilityId: req.body.facilityId,
        state: req.body.state,
        data: req.body.data,
      };
      logging.REQUEST_PARAM(logFormat);
      // 입력 값 체크
      if (!params.facilityId) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Not allowed null (facilityId)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result = await alarmService.edit(params, logFormat);

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

// Alarm 삭제
router.delete(
  '/id/:id',
  isLoggedIn,
  async (req: Request<AlarmDeleteParams, unknown, AlarmDeleteParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      // 요청 파라미터
      const params: AlarmDeleteParams = {
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
      const result: DeletedResult = await alarmService.delete(params, logFormat);

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
