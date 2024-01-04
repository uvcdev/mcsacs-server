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
import { PayloadExt, verifyAccessToken } from '../../lib/tokenUtil';
import { service as userService } from '../../service/common/userService';
import { service as tokenHistoryService } from '../../service/common/tokenHistoryService';
import {
  UserLoginParams,
  UserPinLoginParams,
  UserLogoutParams,
  UserLicenseLoginParams,
  UserLicensePinLoginParams,
} from '../../models/common/user';
import { makeAccessToken } from '../../lib/tokenUtil';

const router = express.Router();

// user 토큰 발행
router.post('/token', async (req: Request<unknown, unknown, UserLoginParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);

  try {
    // 요청 파라미터
    const params: UserLoginParams = {
      userid: req.body.userid,
      password: req.body.password,
    };
    logging.REQUEST_PARAM(logFormat);

    // 입력값 체크
    if (!params.userid || !params.password) {
      const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (userid, password)');

      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }

    // 1. 비즈니스 로직 호출
    const result = await userService.login(params, logFormat);

    // 2-1. 토큰 생성 및 header 세팅
    const accessToken = makeAccessToken(result);
    res.set('access-token', accessToken);

    // 3. 토큰 발행 히스토리 입력 (비동기)
    if (result && result.id && accessToken) {
      void tokenHistoryService.regCreated(
        {
          userId: result.id,
          action: 'Created',
          accessToken: accessToken,
          accessExpire: null,
          clientIp: logFormat.clientIp,
        },
        logFormat
      );
    }

    // 최종 응답값 세팅
    const resJson = resSuccess({ accessToken }, resType.LOGIN);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  } catch (err) {
    // 에러 응답값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// user 토큰 폐기
router.delete('/token', async (req: Request<unknown, unknown, unknown, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  const accessToken = ((req.headers && req.headers['access-token']) as string) || null;
  const decodedToken = accessToken ? (verifyAccessToken(accessToken) as PayloadExt) : null;

  try {
    // 요청 파라미터(는 필요 없음 - 토큰정보는 헤더에...)
    const params: UserLogoutParams = {
      id: decodedToken && decodedToken.id ? decodedToken.id : 0,
    };
    logging.REQUEST_PARAM(logFormat);

    // 1. 비즈니스 로직 호출
    const result = await userService.logOut(params, logFormat);

    // 사용자 로그인/아웃 이력 관리 입력
    if (result && result.updatedCount > 0 && accessToken) {
      void tokenHistoryService.regDestroyed(
        {
          userId: params.id,
          action: 'Destroyed',
          accessToken: accessToken,
          accessExpire: null,
          clientIp: logFormat.clientIp,
        },
        logFormat
      );
    }

    // 최종 응답값 세팅
    const resJson = resSuccess(result, resType.DELETE);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  } catch (err) {
    // 에러 응답값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

// user pin 토큰 발행
router.post('/pin', async (req: Request<unknown, unknown, UserPinLoginParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);

  try {
    // 요청 파라미터
    const params: UserPinLoginParams = {
      pin: req.body.pin,
    };
    logging.REQUEST_PARAM(logFormat);

    // 입력값 체크
    if (!params.pin) {
      const err = new ErrorClass(resCode.BAD_REQUEST_NOTNULL, 'Not allowed null (pin)');

      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }

    // 1. 비즈니스 로직 호출
    const result = await userService.pinLogin(params, logFormat);

    // 2. 토큰 생성 및 header 세팅
    const accessToken = makeAccessToken(result);
    res.set('access-token', accessToken);

    // 3. 토큰 발행 히스토리 입력 (비동기)
    if (result && result.id && accessToken) {
      void tokenHistoryService.regCreated(
        {
          userId: result.id,
          action: 'CreatedPin',
          accessToken: accessToken,
          accessExpire: null,
          clientIp: logFormat.clientIp,
        },
        logFormat
      );
    }

    // 최종 응답값 세팅
    const resJson = resSuccess({ accessToken }, resType.LOGIN);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  } catch (err) {
    // 에러 응답값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

export { router };
