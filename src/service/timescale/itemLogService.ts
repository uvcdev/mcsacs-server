import { logging, LogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
} from '../../lib/resUtil';
import {
  ItemLogAttributes,
  ItemLogInsertParams,
  ItemLogSelectInfoParams,
  ItemLogSelectListParams,
} from '../../models/timescale/itemLog';
import { itemLogDao } from '../../dao/timescale/itemLogDao';

const itemLogService = {
  // insert
  async reg(params: ItemLogInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      const tempResult = await itemLogDao.insert(params);
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
  async list(
    params: ItemLogSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<ItemLogAttributes>> {
    let result: SelectedListResult<ItemLogAttributes>;

    try {
      result = await itemLogDao.selectList(params);
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
  async info(params: ItemLogSelectInfoParams, logFormat: LogFormat<unknown>): Promise<ItemLogAttributes | null> {
    let result: ItemLogAttributes | null;

    try {
      result = await itemLogDao.selectInfo(params);
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

export { itemLogService };
