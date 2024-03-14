import { logging, LogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
} from '../../lib/resUtil';
import { LogAttributes, LogInsertParams, LogSelectInfoParams, LogSelectListParams } from '../../models/timescale/log';
import { logDao } from '../../dao/timescale/logDao';

const logService = {
  // insert
  async reg(params: LogInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      const tempResult = await logDao.insert(params);
      if (!tempResult) {
        result = {} as InsertedResult;
      } else {
        result = tempResult;
      }
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(params: LogSelectListParams, logFormat: LogFormat<unknown>): Promise<SelectedListResult<LogAttributes>> {
    let result: SelectedListResult<LogAttributes>;

    try {
      result = await logDao.selectList(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectInfo
  async info(params: LogSelectInfoParams, logFormat: LogFormat<unknown>): Promise<LogAttributes | null> {
    let result: LogAttributes | null;

    try {
      result = await logDao.selectInfo(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
};

export { logService };
