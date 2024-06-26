import { logging, LogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
} from '../../lib/resUtil';
import {
  SystemLogAttributes,
  SystemLogInsertParams,
  SystemLogSelectInfoParams,
  SystemLogSelectListParams,
} from '../../models/timescale/systemLog';
import { systemLogDao } from '../../dao/timescale/systemLogDao';

const systemLogService = {
  // insert
  async reg(params: SystemLogInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      result = await systemLogDao.insert(params);
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
  async list(
    params: SystemLogSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<SystemLogAttributes>> {
    let result: SelectedListResult<SystemLogAttributes>;

    try {
      result = await systemLogDao.selectList(params);
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
  async info(params: SystemLogSelectInfoParams, logFormat: LogFormat<unknown>): Promise<SystemLogAttributes | null> {
    let result: SystemLogAttributes | null;

    try {
      result = await systemLogDao.selectInfo(params);
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

export { systemLogService };
