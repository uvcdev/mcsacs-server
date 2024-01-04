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
import { service as commonCodeService } from '../../service/common/commonCodeService';
import CommonCode, {
  CommonCodeDefaults,
  CommonCodeInsertParams,
  CommonCodeSelectListParams,
  CommonCodeSelectInfoParams,
  CommonCodeUpdateParams,
  CommonCodeDeleteParams,
} from '../../models/common/commonCode';

const router = express.Router();

const TABLE_NAME = 'common_codes'; // 이벤트 히스토리를 위한 테이블 명

// commonCode 등록
router.post('/', isLoggedIn, async (req: Request<unknown, unknown, CommonCodeInsertParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: CommonCodeInsertParams = {
      code: req.body.code,
      name: req.body.name,
      masterCode: req.body.masterCode,
      level: typeof req.body.level === 'number' ? req.body.level : CommonCodeDefaults.level,
      type: req.body.type || CommonCodeDefaults.type,
      orderby: typeof req.body.orderby === 'number' ? req.body.orderby : CommonCodeDefaults.orderby,
      description: req.body.description,
    };
    logging.REQUEST_PARAM(logFormat);

    // 입력값 체크
    if (!params.code || !params.name || !params.masterCode) {
      const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (code, name, masterCode)');

      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }

    // 입력값 체크 - 'level = 0'인 경우에는 masterCode를 code로 맞춰준다. (혹시 다르면 안됨..)
    if (params.level === 0) {
      params.masterCode = params.code;
    }

    // 비즈니스 로직 호출
    const result = await commonCodeService.reg(params, logFormat);

    // 최종 응답값 세팅
    const resJson = resSuccess(result, resType.REG);
    logging.RESPONSE_DATA(logFormat, resJson);

    // 이벤트 로그 기록(비동기)

    return res.status(resJson.status).json(resJson);
  } catch (err) {
    // 에러 응답값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// commonCode 리스트 조회
router.get(
  '/',
  isLoggedIn,
  async (req: Request<unknown, unknown, unknown, CommonCodeSelectListParams>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: CommonCodeSelectListParams = {
        code: req.query.code,
        name: req.query.name,
        masterCode: req.query.masterCode,
        level: req.query.level,
        type: req.query.type,
        limit: Number(req.query.limit || 'NaN'),
        offset: Number(req.query.offset || 'NaN'),
      };
      logging.REQUEST_PARAM(logFormat);

      // 비즈니스 로직 호출
      const result = await commonCodeService.list(params, logFormat);

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

// commonCode 상세 정보 조회
router.get(
  '/id/:id',
  isLoggedIn,
  async (req: Request<CommonCodeSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: CommonCodeSelectInfoParams = {
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
      const result = await commonCodeService.info(params, logFormat);

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

// commonCode 정보 수정
router.put(
  '/id/:id',
  isLoggedIn,
  async (req: Request<CommonCodeUpdateParams, unknown, CommonCodeUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: CommonCodeUpdateParams = {
        id: Number(req.params.id),
        name: req.body.name,
        orderby: Number(req.body.orderby),
        masterCode: req.body.masterCode,
        description: req.body.description,
        orderbyList: req.body.orderbyList,
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력 값 체크
      if (!params.id || isNaN(params.id)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }
      if (!params.name || (params.orderby !== undefined && isNaN(params.orderby))) {
        const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (name, orderby)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result = await commonCodeService.edit(params, logFormat);

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

// commonCode 정보 수정(트리)
router.put(
  '/tree/id/:id',
  isLoggedIn,
  async (req: Request<CommonCodeUpdateParams, unknown, CommonCodeUpdateParams, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: CommonCodeUpdateParams = {
        id: Number(req.params.id),
        name: req.body.name,
        orderby: Number(req.body.orderby),
        masterCode: req.body.masterCode,
        description: req.body.description,
        orderbyList: req.body.orderbyList,
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력 값 체크
      if (!params.id || isNaN(params.id)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }
      // if (!params.name || (params.orderby !== undefined && isNaN(params.orderby))) {
      //   const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (name, orderby)');
      //
      //   const resJson = resError(err);
      //   logging.RESPONSE_DATA(logFormat, resJson);
      //
      //   return res.status(resJson.status).json(resJson);
      // }

      // 비즈니스 로직 호출
      const result = await commonCodeService.editByTree(params, logFormat);

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

// commonCode 삭제
router.delete(
  '/id/:id',
  isLoggedIn,
  async (req: Request<CommonCodeDeleteParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    const tokenUser = (req as { decoded?: Payload }).decoded;

    try {
      // 요청 파라미터
      const params: CommonCodeDeleteParams = {
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
      const result = await commonCodeService.delete(params, logFormat);

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
