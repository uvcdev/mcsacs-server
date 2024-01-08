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
import { LogInsertParams, LogSelectInfoParams, LogSelectListParams } from '../../models/timescale/log';
import { logService } from '../../service/timescale/logService';
import { checkPasswordValidator } from '../../lib/hashUtil';
import { logDao } from '../../dao/timescale/logDao';

const logRouter = express.Router();

const TABLE_NAME = 'logs'; // 이벤트 히스토리를 위한 테이블 명

// log 리스트 조회
logRouter.get('/', isLoggedIn, async (req: Request<unknown, unknown, unknown, LogSelectListParams>, res: Response) => {
  const logFormat = makeLogFormat(req);
  const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: LogSelectListParams = {
      facilityCode: req.query.facilityCode,
      facilityName: req.query.facilityName,
      amrCode: req.query.amrCode,
      amrName: req.query.amrName,
      type: req.query.type,
      createdAtFrom: req.query.createdAtFrom,
      createdAtTo: req.query.createdAtTo,
      limit: Number(req.query.limit || 'NaN'),
      offset: Number(req.query.offset || 'NaN'),
      order: req.query.order,
    };
    logging.REQUEST_PARAM(logFormat);

    // 비즈니스 로직 호출
    const result = await logService.list(params, logFormat);

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
});

// log 상세정보 조회
logRouter.get(
  '/id/:id',
  isLoggedIn,
  async (req: Request<LogSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: LogSelectInfoParams = {
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
      const result = await logService.info(params, logFormat);

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

export { logRouter };
