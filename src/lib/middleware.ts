import { Request, Response, NextFunction } from 'express';
import { logging, makeLogFormat } from './logging';
import { responseCode as resCode, makeResponseError as resError, ErrorClass } from './resUtil';
import { Payload, makeAccessToken, verifyAccessToken } from '../lib/tokenUtil';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = ((req.headers && req.headers['access-token']) as string) || null;

  // 토큰 정보가 없거나 검증 실패 시 에러 응답 처리
  function unauthorized() {
    const logFormat = makeLogFormat(req);
    logging.REQUEST_PARAM(logFormat);

    const err = new ErrorClass(resCode.UNAUTHORIZED_ACCESSTOKEN);

    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return resJson;
  }

  if (accessToken) {
    // 토큰 검증
    const decoded = verifyAccessToken(accessToken);

    if (decoded) {
      // 토큰 검증 성공
      const newAccessToken = makeAccessToken(decoded); // 토큰 갱신
      (req as { decoded?: Payload }).decoded = decoded;
      res.set('access-token', newAccessToken);

      next(); // 계속 진행
    } else {
      // 토큰 검증 실패
      const resJson = unauthorized();
      return res.status(resJson.status).json(resJson);
    }
  } else {
    // 토큰 정보가 없는 경우 에러 응답
    const resJson = unauthorized();

    return res.status(resJson.status).json(resJson);
  }
};

// 액션 권한 값
const actionKey = 'F5CF25CDEC52DED49981CE6849CB9';

// 액션 권한 확인
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isActionKey = (req: Request, res: Response, next: NextFunction) => {
  const actionKeyHeader = ((req.headers && req.headers['action-key']) as string) || null;

  if (actionKeyHeader === actionKey) {
    next();
  } else {
    // 액션키 정보가 맞지 않으면 에러 처리
    const logFormat = makeLogFormat(req);
    logging.REQUEST_PARAM(logFormat);

    const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (actionKey)');

    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
};
