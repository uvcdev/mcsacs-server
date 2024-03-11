import { logging, LogFormat } from '../../lib/logging';
import { InsertedResult, SelectedListResult, UpdatedResult, DeletedResult } from '../../lib/resUtil';
import {
  McsAlarmInsertParams,
  McsAlarmSelectListParams,
  McsAlarmSelectInfoParams,
  McsAlarmUpdateParams,
  McsAlarmDeleteParams,
  McsAlarmAttributes,
} from '../../models/common/mcsAlarm';
import { dao as mcsAlarmDao } from '../../dao/common/mcsAlarmDao';
import { dao as alarmEmailDao } from '../../dao/common/alarmEmailDao';
import { sendMail } from '../../lib/mailUtil';
import { UserAttributes } from '../../models/common/user';
import { MqttTopics, sendMqtt } from '../../lib/mqttUtil';
import { RedisKeys, useRedisUtil } from '../../lib/redisUtil';
import { FacilityAttributesDeep } from '../../models/operation/facility';

const redisUtil = useRedisUtil();

const service = {
  async reg(params: McsAlarmInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    try {
      result = await mcsAlarmDao.insert(params);
      sendMqtt(`${MqttTopics.AlarmRegist}/${result.insertedId}`, JSON.stringify(params));
      const facility = await redisUtil.hgetObject<FacilityAttributesDeep>(
        RedisKeys.InfoFacilityById,
        params.facilityId.toString()
      );
      console.log('🚀 ~ reg ~ facility:', facility);
      if (!facility) {
        const error = `redis에 ${RedisKeys.InfoAmrById}, ${params.facilityId} 데이터가 없습니다.`;
        logging.ACTION_ERROR({
          filename: 'mcsAlarmService.ts.reg',
          error: error,
          params: null,
          result: false,
        });
        return new Promise((resolve, reject) => {
          reject(new Error(error));
        });
      }
      // const alarmStatusToggle = (await redisUtil.hgetObject<string[]>(RedisKeys.AlarmStatusToggle, facility.code)) || [];
      console.log('🚀 ~ reg ~ facility.code:', facility.code);
      const alarmStatusToggle =
        (await redisUtil.hgetObject<string[]>(RedisKeys.AlarmStatusToggle, facility.code)) || [];
      console.log('🚀 ~ reg ~ alarmStatusToggle:', alarmStatusToggle);
      const alarmStatusToggleSet = new Set(alarmStatusToggle);
      alarmStatusToggleSet.add(params.state || '');
      redisUtil.hset(RedisKeys.AlarmStatusToggle, facility.code, JSON.stringify([...alarmStatusToggleSet]));
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
    params: McsAlarmSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<McsAlarmAttributes>> {
    let result: SelectedListResult<McsAlarmAttributes>;
    try {
      console.log('111');
      result = await mcsAlarmDao.selectList(params);

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
        const userid = ((Receivers.rows[i] as unknown) as { User: UserAttributes }).User.userid;
        userids.push(userid);
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
  async info(params: McsAlarmSelectInfoParams, logFormat: LogFormat<unknown>): Promise<McsAlarmAttributes | null> {
    let result: McsAlarmAttributes | null;

    try {
      result = await mcsAlarmDao.selectInfo(params);
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
  async edit(params: McsAlarmUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;
    try {
      result = await mcsAlarmDao.update(params);
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
  async delete(params: McsAlarmDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;
    try {
      result = await mcsAlarmDao.delete(params);
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
