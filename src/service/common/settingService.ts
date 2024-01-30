import { Transaction } from 'sequelize';
import { logging, LogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  makeResponseSuccess as resSuccess,
  responseType as resType,
  makeResponseError as resError,
  ErrorClass,
  InsertedResult,
  UpdatedResult,
  DeletedResult,
  SelectedListResult,
} from '../../lib/resUtil';
import {
  SettingInsertParams,
  SettingSelectListParams,
  SettingSelectInfoParams,
  SettingUpdateParams,
  SettingDeleteParams,
  SettingAttributes,
} from '../../models/common/setting';
import { dao as settingDao } from '../../dao/common/settingDao';
import { restapiConfig } from '../../config/restapiConfig';
import superagent from 'superagent';
import { logSequelize, sequelize } from '../../models';

const restapiUrl = `${restapiConfig.host}:${restapiConfig.port}`;
let accessToken = '';
const service = {
  // restapi login
  async restapiLogin(logFormat: LogFormat<unknown>): Promise<Record<string, any>> {
    let result: Record<string, any>;

    try {
      result = await superagent.post(`${restapiUrl}/auths/token`).send({
        userid: restapiConfig.id,
        password: restapiConfig.pass,
      });
      accessToken = JSON.parse(result.text).data.accessToken;
      result = { accessToken };
      logging.METHOD_ACTION(logFormat, __filename, null, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, null, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  async reg(params: SettingInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    const transaction: Transaction = await sequelize.transaction();

    try {
      result = await settingDao.insert(params, transaction);
      logging.METHOD_ACTION(logFormat, __filename, params, result);

      // ACS 테이블 입력
      const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
      const response = await superagent.post(`${restapiUrl}/settings`).set('access-token', accessToken).send(params);
      const responseData: Record<string, any> = JSON.parse(response.text).Data;
      logging.METHOD_ACTION(logFormat, __filename, params, responseData);

      await transaction.commit(); // 트랜잭션 커밋
    } catch (err) {
      await transaction.rollback(); // 트랜잭션 롤백
      logging.ERROR_METHOD(logFormat, __filename, params, err);
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    try {
      logging.REQUEST_PARAM(logFormat);

      const logPeriod = JSON.parse(JSON.stringify(params["data"]))
      logSequelize
        .sync({
          force: false,
        })
        .then(async () => {
          await logSequelize.query(`SELECT remove_retention_policy('logs');
                                    SELECT add_retention_policy('logs', INTERVAL '${logPeriod.mcsLog} ');`);
          // 최종 응답 값 세팅
          const resJson = resSuccess(
            {
              result: {
                action: 'adjustment data',
                DB: {
                  LOG_DB_HOST: process.env.LOG_DB_HOST,
                  LOG_DB_PORT: process.env.LOG_DB_PORT,
                  LOG_DB_DATABASE: process.env.LOG_DB_DATABASE,
                  LOG_DB_ID: process.env.LOG_DB_ID,
                  LOG_DB_DIALECT: process.env.LOG_DB_DIALECT,
                },
              },
            },
            resType.FREESTYLE
          );
          logging.RESPONSE_DATA(logFormat, resJson);
        })
        .catch((err) => {
          const resJson = resError(err);
          logging.RESPONSE_DATA(logFormat, resJson);
        });
    } catch (err) {
      // 에러 응답값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);
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
    const transaction: Transaction = await sequelize.transaction();

    try {
      result = await settingDao.update(params, transaction);
      logging.METHOD_ACTION(logFormat, __filename, params, result);

      const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
      console.log("🚀 ~ edit ~ params:", params)
      const response = await superagent.put(`${restapiUrl}/settings/type/:type`).set('access-token', accessToken).send(params);
      const responseData: Record<string, any> = JSON.parse(response.text).Data;

      logging.METHOD_ACTION(logFormat, __filename, null, responseData);

      await transaction.commit(); // 트랜잭션 커밋
    } catch (err) {
      await transaction.rollback(); // 트랜잭션 롤백
      logging.ERROR_METHOD(logFormat, __filename, params, err);
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    try {
      logging.REQUEST_PARAM(logFormat);

      const logPeriod = JSON.parse(JSON.stringify(params["data"]))
      logSequelize
        .sync({
          force: false,
        })
        .then(async () => {
          await logSequelize.query(`SELECT remove_retention_policy('logs');
                                    SELECT add_retention_policy('logs', INTERVAL '${logPeriod.mcsLog} months');`);
          // 최종 응답 값 세팅
          const resJson = resSuccess(
            {
              result: {
                action: 'adjustment data',
                DB: {
                  LOG_DB_HOST: process.env.LOG_DB_HOST,
                  LOG_DB_PORT: process.env.LOG_DB_PORT,
                  LOG_DB_DATABASE: process.env.LOG_DB_DATABASE,
                  LOG_DB_ID: process.env.LOG_DB_ID,
                  LOG_DB_DIALECT: process.env.LOG_DB_DIALECT,
                },
              },
            },
            resType.FREESTYLE
          );
          logging.RESPONSE_DATA(logFormat, resJson);
        })
        .catch((err) => {
          const resJson = resError(err);
          logging.RESPONSE_DATA(logFormat, resJson);
        });
    } catch (err) {
      // 에러 응답값 세팅
      const resJson = resError(err);
      logging.RESPONSE_DATA(logFormat, resJson);
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
