import { logging, LogFormat } from '../../lib/logging';
import { InsertedResult } from '../../lib/resUtil';
import { FileInsertParams, FileSelectInfoParams, FileAttributes } from '../../models/common/file';
import { dao as fileDao } from '../../dao/common/fileDao';
import * as dotenv from 'dotenv';

dotenv.config();

const service = {
  // reg
  async reg(params: Array<FileInsertParams>, logFormat: LogFormat<unknown>): Promise<Array<InsertedResult>> {
    const result: Array<InsertedResult> = [];
    try {
      for (let index = 0; index < params.length; index++) {
        result.push(await fileDao.insert(params[index]));
      }
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, {}, err);
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }
    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectInfo
  async info(params: FileSelectInfoParams, logFormat: LogFormat<unknown>): Promise<FileAttributes | null> {
    let result: FileAttributes | null;

    try {
      result = await fileDao.selectInfo(params);
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
