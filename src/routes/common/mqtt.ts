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
import { sendMqtt } from '../../lib/mqttUtil';

const router = express.Router();

interface MqttSendParams {
  subTopic: string;
  message: string;
}

// mqtt 메세지 등록(전송) 테스트
router.post('/', isLoggedIn, (req: Request<unknown, unknown, MqttSendParams, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);
  // const tokenUser = (req as { decoded?: Payload }).decoded;

  try {
    // 요청 파라미터
    const params: MqttSendParams = {
      subTopic: req.body.subTopic,
      message: req.body.message,
    };
    logging.REQUEST_PARAM(logFormat);

    // 메세지 발송
    void sendMqtt(params.subTopic, params.message);

    return res.status(200).json(params);
  } catch (err) {
    // 에러 응답 값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

export { router };
