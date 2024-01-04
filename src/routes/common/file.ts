/* eslint-disable @typescript-eslint/no-misused-promises */
import * as express from 'express';
import { Request, Response } from 'express';
import { isLoggedIn } from '../../lib/middleware';
import path from 'path';
import { logging, makeLogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  makeResponseSuccess as resSuccess,
  responseType as resType,
  makeResponseError as resError,
  ErrorClass,
} from '../../lib/resUtil';
import { FileSelectInfoParams } from '../../models/common/file';
import { Payload } from '../../lib/tokenUtil';
import { service as fileService } from '../../service/common/fileService';
import { uploadFiles, format as fileFormat, dir as uploadDir } from '../../lib/uploadUtil';

const router = express.Router();

const TABLENAME = 'files'; // 이벤트 히스토리를 위한 테이블 명

//파일 업로드
router.post(
  '/',
  isLoggedIn,
  uploadFiles('files', uploadDir.file, fileFormat.file),
  async (req: Request<unknown, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);
    try {
      logging.REQUEST_PARAM(logFormat);

      //파일업로드 실패
      if (req && req.files && req.files.length === 0) {
        const err = new ErrorClass(resCode.BAD_REQUEST_FILEXT, `Invalid file extension or file size over error`);
        const resJson = resError(err);
        return res.status(resJson.status).json(resJson);
      }
      const params = (req.files as Array<never>).map((v: { originalname: string; path: string; size: number }) => {
        const originalnameSplit = v.originalname.split('.');
        const type = originalnameSplit[originalnameSplit.length - 1];
        return { title: v.originalname, path: v.path, type: type, size: v.size };
      });
      // 비즈니스 로직 호출
      const result = await fileService.reg(params, logFormat);
      const newResult = result.map((v) => {
        return v.insertedId;
      });
      const resJson = resSuccess(
        {
          count: newResult.length,
          fileIds: newResult,
        },
        resType.UPLOAD
      );
      logging.RESPONSE_DATA(logFormat, resJson);
      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답값 세팅
      const resJson = resError(err);
      return res.status(resJson.status).json(resJson);
    }
  }
);

//파일 다운로드
router.get('/id/:id', async (req: Request<FileSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
  const logFormat = makeLogFormat(req);

  try {
    // 요청 파라미터
    const params: FileSelectInfoParams = {
      id: Number(req.params.id || 'NaN'),
    };
    logging.REQUEST_PARAM(logFormat);

    // 입력값 체크
    if (params.id !== undefined && params.id !== null && !(params.id > 0)) {
      const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }

    // 비즈니스 로직 호출
    const result = await fileService.info(params, logFormat);
    // 최종 응답값 세팅 ***how to send
    const resJson = resSuccess(result, resType.DOWNLOAD);
    logging.RESPONSE_DATA(logFormat, resJson);

    // 이벤트 로그 기록(비동기)
    const decodedUser = (req as { decoded?: Payload }).decoded;

    //파일 다운로드
    return res.download(path.join(result?.path as string), result?.title as string, function (err) {
      if (err) {
        // 에러 응답값 세팅
        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);
        return res.status(resJson.status).json(resJson);
      } else {
        res.end();
      }
    });
  } catch (err) {
    // 에러 응답값 세팅
    const resJson = resError(err);
    logging.RESPONSE_DATA(logFormat, resJson);

    return res.status(resJson.status).json(resJson);
  }
});

//파일 저장정보 조회
router.get(
  '/info/id/:id',
  isLoggedIn,
  async (req: Request<FileSelectInfoParams, unknown, unknown, unknown>, res: Response) => {
    const logFormat = makeLogFormat(req);

    try {
      // 요청 파라미터
      const params: FileSelectInfoParams = {
        id: Number(req.params.id || 'NaN'),
      };
      logging.REQUEST_PARAM(logFormat);

      // 입력값 체크
      if (params.id !== undefined && params.id !== null && !(params.id > 0)) {
        const err = new ErrorClass(resCode.BAD_REQUEST_INVALID, 'Invalid value (id: number)');

        const resJson = resError(err);
        logging.RESPONSE_DATA(logFormat, resJson);

        return res.status(resJson.status).json(resJson);
      }

      // 비즈니스 로직 호출
      const result = await fileService.info(params, logFormat);
      // 최종 응답값 세팅 ***how to send
      const resJson = resSuccess(result, resType.DOWNLOAD);
      logging.RESPONSE_DATA(logFormat, resJson);

      // 이벤트 로그 기록(비동기)
      const decodedUser = (req as { decoded?: Payload }).decoded;

      return res.status(resJson.status).json(resJson);
    } catch (err) {
      // 에러 응답값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);

      return res.status(resJson.status).json(resJson);
    }
  }
);

export { router };
