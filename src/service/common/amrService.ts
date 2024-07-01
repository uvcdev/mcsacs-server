import {
  AmrAttributes,
  AmrDeleteParams,
  AmrInsertParams,
  AmrSelectInfoParams,
  AmrSelectListParams,
  AmrUpdateParams,
  AmrUpsertParams,
} from '../../models/common/amr';
import { dao as amrDao } from '../../dao/common/amrDao';
import { LogFormat, logging } from '../../lib/logging';
import {
  BulkInsertedOrUpdatedResult,
  DeletedResult,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  ErrorClass,
  responseCode,
} from '../../lib/resUtil';
import { RedisKeys, useRedisUtil } from '../../lib/redisUtil';

const redisUtil = useRedisUtil();

export const amrService = {
  // insert
  async reg(params: AmrInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    try {
      result = await amrDao.insert(params);

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
  // bulkInsert from websocket
  async bulkInsert(
    paramList: Array<AmrUpsertParams>,
    logFormat: LogFormat<unknown>
  ): Promise<BulkInsertedOrUpdatedResult> {
    let result: BulkInsertedOrUpdatedResult;
    try {
      result = await amrDao.bulkInsert(paramList);
      logging.METHOD_ACTION(logFormat, __filename, paramList, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, paramList, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(params: AmrSelectListParams, logFormat: LogFormat<unknown>): Promise<SelectedListResult<AmrAttributes>> {
    let result: SelectedListResult<AmrAttributes>;

    try {
      result = await amrDao.selectList(params);

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
  async info(params: AmrSelectInfoParams, logFormat: LogFormat<unknown>): Promise<AmrAttributes | null> {
    let result: AmrAttributes | null;

    try {
      result = await amrDao.selectInfo(params);

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
  async edit(params: AmrUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    // 1. amr 정보 수정
    try {
      result = await amrDao.update(params);

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
  async delete(params: AmrDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      result = await amrDao.delete(params);

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
