import { logging, LogFormat, ActionLog } from '../../lib/logging';
import { redisSet, redisSetEx, redisHset, redisGet, redisHget, redisDel, redisHdel } from '../../lib/redisUtil';
import {
  responseCode as resCode,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
  ErrorClass,
  BulkInsertedOrUpdatedResult,
} from '../../lib/resUtil';
import {
  CommonCodeAttributes,
  CommonCodeInsertParams,
  CommonCodeSelectListParams,
  CommonCodeSelectInfoParams,
  CommonCodeSelectOneParams,
  CommonCodeUpdateParams,
  CommonCodeDeleteParams,
} from '../../models/common/commonCode';
import { dao as commonCodeDao } from '../../dao/common/commonCodeDao';

const service = {
  // insert
  async reg(params: CommonCodeInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    try {
      result = await commonCodeDao.insert(params);
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
  /**
   * [벌크 입력]
   * 특징: 한번에 입력(중복되면 업데이트, 중복 안되면 입력)
   * @param paramList
   * @param logFormat
   */
  async bulkReg(
    paramList: Array<CommonCodeInsertParams>,
    logFormat: LogFormat<unknown>
  ): Promise<BulkInsertedOrUpdatedResult> {
    let result: BulkInsertedOrUpdatedResult;

    try {
      result = await commonCodeDao.bulkInsert(paramList);
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
  async list(
    params: CommonCodeSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<CommonCodeAttributes>> {
    let result: SelectedListResult<CommonCodeAttributes>;

    try {
      result = await commonCodeDao.selectList(params);
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
  async info(params: CommonCodeSelectInfoParams, logFormat: LogFormat<unknown>): Promise<CommonCodeAttributes | null> {
    let result: CommonCodeAttributes | null;

    try {
      result = await commonCodeDao.selectInfo(params);
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
  // selectOne
  async infoOne(
    params: CommonCodeSelectOneParams,
    logFormat: LogFormat<unknown>
  ): Promise<CommonCodeAttributes | null> {
    let result: CommonCodeAttributes | null;

    try {
      result = await commonCodeDao.selectOne(params);
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
  // select id by code
  async getId(params: CommonCodeSelectOneParams, logFormat?: LogFormat<unknown>): Promise<number> {
    let result: number;

    const actionLog: ActionLog = {
      filename: __filename,
      params: null,
      result: null,
      error: null,
    };

    // Redis에서 찾기
    const commonCodeIdStr = await redisHget('COMMONCODE', params.code);

    if (commonCodeIdStr) {
      result = Number(commonCodeIdStr);
    } else {
      // Redis에 없으면 만들어준다.
      try {
        const commonCode = await commonCodeDao.selectOne(params);
        if (logFormat) {
          logging.METHOD_ACTION(logFormat, __filename, params, commonCode);
        } else {
          logging.ACTION_DEBUG({ ...actionLog, params: params, result: commonCode });
        }

        if (commonCode) {
          result = commonCode.id;
          void redisHset('COMMONCODE', params.code, commonCode.id.toString());
        }
      } catch (err) {
        if (logFormat) {
          logging.ERROR_METHOD(logFormat, __filename, params, err);
        } else {
          logging.ACTION_ERROR({ ...actionLog, params: params, error: err });
        }

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // update
  async edit(params: CommonCodeUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    try {
      result = await commonCodeDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // Redis 관계 없음(code는 업뎃 안됨)

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // update by Tree
  async editByTree(params: CommonCodeUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    const result: UpdatedResult = { updatedCount: 0 };

    try {
      if (params.orderbyList && params.orderbyList.length > 0) {
        const bulkUpdateResult = await commonCodeDao.bulkUpdateOrderby(params.orderbyList);
        // bulkUpdate 시 기존 UpdateResult를 쓰기 위한 처리
        result.updatedCount = bulkUpdateResult.insertedOrUpdatedIds.length;
      }
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // Redis 관계 없음(code는 업뎃 안됨)

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // delete
  async delete(params: CommonCodeDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      result = await commonCodeDao.deleteForce(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // Redis의 공통 코드 삭제(뭔지 모르니 일단 삭제)
    void redisDel('COMMONCODE');

    return new Promise((resolve) => {
      resolve(result);
    });
  },
};

export { service };
