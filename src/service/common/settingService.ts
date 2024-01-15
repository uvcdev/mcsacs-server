import { logging, LogFormat } from '../../lib/logging';
import { InsertedResult, SelectedListResult, UpdatedResult, DeletedResult } from '../../lib/resUtil';
import {
  SettingInsertParams,
  SettingSelectListParams,
  SettingSelectInfoParams,
  SettingUpdateParams,
  SettingDeleteParams,
  SettingAttributes,
} from '../../models/common/setting';
import { dao as settingDao } from '../../dao/common/settingDao';

const service = {
  async reg(params: SettingInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      result = await settingDao.insert(params);
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
  async list(
    params: SettingSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<SettingAttributes>> {
    let result: SelectedListResult<SettingAttributes>;
    try {
      result = await settingDao.selectList(params);

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
  async info(params: SettingSelectInfoParams, logFormat: LogFormat<unknown>): Promise<SettingAttributes | null> {
    let result: SettingAttributes | null;

    try {
      result = await settingDao.selectInfo(params);
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
  async edit(params: SettingUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;
    try {
      result = await settingDao.update(params);
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
  async delete(params: SettingDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;
    try {
      result = await settingDao.delete(params);
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
