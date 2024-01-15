import { logging, LogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
} from '../../lib/resUtil';
import {
  AlarmEmailAttributes,
  AlarmEmailInsertParams,
  AlarmEmailSelectInfoParams,
  AlarmEmailSelectListParams,
  AlarmEmailUpdateParams,
  AlarmEmailDeleteParams,
} from '../../models/common/alarmEmail';
import { dao as alarmEmailDao } from '../../dao/common/alarmEmailDao';

const service = {
  // insert
  async reg(params: AlarmEmailInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      result = await alarmEmailDao.insert(params);
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
    params: AlarmEmailSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<AlarmEmailAttributes>> {
    let result: SelectedListResult<AlarmEmailAttributes>;

    try {
      result = await alarmEmailDao.selectList(params);
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
  async info(params: AlarmEmailSelectInfoParams, logFormat: LogFormat<unknown>): Promise<AlarmEmailAttributes | null> {
    let result: AlarmEmailAttributes | null;

    try {
      result = await alarmEmailDao.selectInfo(params);
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
  // update
  async edit(params: AlarmEmailUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    // 1. 사용자 정보 수정
    try {
      result = await alarmEmailDao.update(params);
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

  // delete
  async delete(params: AlarmEmailDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;
    try {
      result = await alarmEmailDao.delete(params);
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

export { service };
