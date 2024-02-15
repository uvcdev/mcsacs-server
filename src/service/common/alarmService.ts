import { logging, LogFormat } from '../../lib/logging';
import { InsertedResult, SelectedListResult, UpdatedResult, DeletedResult } from '../../lib/resUtil';
import {
  AlarmInsertParams,
  AlarmSelectListParams,
  AlarmSelectInfoParams,
  AlarmUpdateParams,
  AlarmDeleteParams,
  AlarmAttributes,
} from '../../models/common/alarm';
import { dao as alarmDao } from '../../dao/common/alarmDao';
import { dao as alarmEmailDao } from '../../dao/common/alarmEmailDao';
import { sendMail } from '../../lib/mailUtil';
import { UserAttributes } from '../../models/common/user';

const service = {
  async reg(params: AlarmInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      result = await alarmDao.insert(params);
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
    params: AlarmSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<AlarmAttributes>> {
    let result: SelectedListResult<AlarmAttributes>;
    try {
      result = await alarmDao.selectList(params);

      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // email 전송
    try {

      // todo: 알람발생시 전송하는 로직 추가

      const Receivers = await alarmEmailDao.selectList({});
      const userids: Array<string> = [];
      for (let i = 0; i < Receivers.rows.length; i++) {
        const userid = ((Receivers.rows[i] as unknown) as { User: UserAttributes }).User.userid
        userids.push(userid)
      }
      const message = `000 에서 000 사유로 알람 발생하였습니다.`;
      const alarmInsertParams = {
        userId: userids,
        message: message,
      };
      sendMail(userids, [alarmInsertParams]);

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
  async info(params: AlarmSelectInfoParams, logFormat: LogFormat<unknown>): Promise<AlarmAttributes | null> {
    let result: AlarmAttributes | null;

    try {
      result = await alarmDao.selectInfo(params);
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
  async edit(params: AlarmUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;
    try {
      result = await alarmDao.update(params);
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
  async delete(params: AlarmDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;
    try {
      result = await alarmDao.delete(params);
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
