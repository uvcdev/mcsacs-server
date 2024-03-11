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
  AlarmEmailInsertParams,
  AlarmEmailSelectInfoParams,
  AlarmEmailSelectListParams,
  AlarmEmailUpdateParams,
  AlarmEmailDeleteParams,
} from '../../models/common/alarmEmail';
import { service as alarmEmailService } from '../../service/common/alarmEmailService';
import { checkPasswordValidator } from '../../lib/hashUtil';
import { logDao } from '../../dao/timescale/logDao';

const router = express.Router();

const TABLE_NAME = 'alarmEmails'; // 이벤트 히스토리를 위한 테이블 명

// alarmEmail 등록
router.post('/', isLoggedIn, async (req: Request<unknown, unknown, AlarmEmailInsertParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: AlarmEmailInsertParams = {
      email: req.body.email,
      name: req.body.name,
      userId: req.body.userId ?? tokenUser?.id ?? null,
      description: req.body.description,
      active: req.body.active,
    };
    logging.REQUEST_PARAM(logFormat);

    // 입력값 체크
    if (!params.email || !params.name) {
      const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (email, name)');

      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }

    // 비즈니스 로직 호출
    const result = await alarmEmailService.reg(params, logFormat);

    // 최종 응답 값 세팅
    const resJson = resSuccess(result, resType.REG);
    logging.RESPONSE_DATA(logFormat, resJson);

    // 이벤트 로그 기록(비동기)

    return res.status(resJson.status).json(resJson);
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// alarmEmail 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, AlarmEmailSelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      // 요청 파라미터
      const params: AlarmEmailSelectListParams = {
        ids: req.query.ids ? ((req.query.ids as unknown) as string).split(',').map((i) => Number(i)) : null,
        email: req.query.email,
        name: req.query.name,
        userIds: req.query.userIds ? ((req.query.userIds as unknown) as string).split(',').map((i) => Number(i)) : null,
        active: req.query.active,
        createdAtFrom: req.query.createdAtFrom,
        createdAtTo: req.query.createdAtTo,
        limit: Number(req.query.limit || 'NaN'),
        offset: Number(req.query.offset || 'NaN'),
        order: req.query.order,
      };
      logging.REQUEST_PARAM(logFormat);

      // 비즈니스 로직 호출
      const result = await alarmEmailService.list(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.LIST);

      logging.RESPONSE_DATA(logFormat, resJson);
      void logDao.insert({
        facilityCode: null,
        facilityName: null,
        amrCode: null,
        amrName: null,
        system: 'mcs',
        type: 'debug',
        data: logFormat,
      });
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

// alarmEmail 상세정보 조회
router.get(
  '/id/:id',
  isLoggedIn,
  async (req: Request<AlarmEmailSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;
    try {
      // 요청 파라미터
      const params: AlarmEmailSelectInfoParams = {
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
      const result = await alarmEmailService.info(params, logFormat);

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

// alarmEmail 정보 수정
router.put(
  '/id/:id',
  isLoggedIn,
  async (req: Request<AlarmEmailUpdateParams, unknown, AlarmEmailUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: AlarmEmailUpdateParams = {
        id: Number(req.params.id),
        email: req.body.email,
        name: req.body.name,
        userId: req.body.userId ?? tokenUser?.id ?? null,
        description: req.body.description,
        active: req.body.active,
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력 값 체크
      if (!params.id || isNaN(params.id)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }
      if (!params.name) {
        const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (name)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result = await alarmEmailService.edit(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.EDIT);
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

// alarmEmail 삭제
router.delete(
  '/id/:id',
  isLoggedIn,
  async (req: Request<AlarmEmailDeleteParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: AlarmEmailDeleteParams = {
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
      const result = await alarmEmailService.delete(params, logFormat);

      // 최종 응답 값 세팅
      const resJson = resSuccess(result, resType.DELETE);
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
