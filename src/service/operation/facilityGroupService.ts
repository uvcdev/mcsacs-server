import { Transaction } from 'sequelize';
import { LogFormat, logging } from '../../lib/logging';
import { firstFloorRestapiConfig, secondFloorRestapiConfig } from '../../config/restapiConfig';
import {
  BulkInsertedOrUpdatedResult,
  DeletedResult,
  InsertedResult,
  SelectedAllResult,
  SelectedListResult,
  UpdatedResult,
} from '../../lib/resUtil';
import {
  FacilityGroupAttributes,
  FacilityGroupDeleteParams,
  FacilityGroupInsertParams,
  FacilityGroupSelectInfoParams,
  FacilityGroupSelectListParams,
  FacilityGroupUpdateParams,
} from '../../models/operation/facilityGroup';
// import { FacilityGroupUserJoinInsertParams } from '../../models/operation/facilityGroupUserJoin';
import { dao as facilityGroupDao } from '../../dao/operation/facilityGroupDao';
// import { dao as facilityGroupUserJoinDao } from '../../dao/operation/facilityGroupUserJoinDao';
import { makeRegularCodeDao } from '../../lib/usefullToolUtil';
import * as process from 'process';
import superagent from 'superagent';
import { sequelize } from '../../models';

const firstFloorRestapiUrl = `${firstFloorRestapiConfig.host}:${firstFloorRestapiConfig.port}`;
const secondFloorRestapiUrl = `${secondFloorRestapiConfig.host}:${secondFloorRestapiConfig.port}`;
let accessToken = '';
let restapiUrl = '';
let restapiConfig = {};

const service = {
  // restapi login
  async restapiLogin(logFormat: LogFormat<unknown>, restapiConfig: { id?: string; pass?: string; }): Promise<Record<string, any>> {
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
  // insert
  async reg(params: FacilityGroupInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    const transaction: Transaction = await sequelize.transaction();

    // 1. 설비 정보 입력
    try {
      const codeHeader = 'FACG';
      params.code = await makeRegularCodeDao('code', codeHeader, facilityGroupDao);
      result = await facilityGroupDao.insert(params, transaction);
      logging.METHOD_ACTION(logFormat, __filename, params, result);

      // ACS 테이블 입력
      // if (params.floor === '1') {
      //   restapiUrl = firstFloorRestapiUrl
      //   restapiConfig = firstFloorRestapiConfig
      // } else {
      //   restapiUrl = secondFloorRestapiUrl
      //   restapiConfig = secondFloorRestapiConfig
      // }
      // const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
      // const response = await superagent
      //   .post(`${restapiUrl}/facility-groups`)
      //   .set('access-token', accessToken)
      //   .send(params);
      // const responseData: Record<string, any> = JSON.parse(response.text).Data;
      // logging.METHOD_ACTION(logFormat, __filename, params, responseData);

      await transaction.commit(); // 트랜잭션 커밋
    } catch (err) {
      await transaction.rollback(); // 트랜잭션 롤백
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // 2. ACS 테이블 입력
    // try {
    //   const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
    //   const response = await superagent.post(`${restapiUrl}/facility-groups`).set('access-token', accessToken).send(params);
    //   const responseData: Record<string, any> = JSON.parse(response.text).Data;

    //   logging.METHOD_ACTION(logFormat, __filename, null, responseData);
    // } catch (err) {
    //   logging.ERROR_METHOD(logFormat, __filename, null, err);

    //   return new Promise((resolve, reject) => {
    //     reject(err);
    //   });
    // }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(
    params: FacilityGroupSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<FacilityGroupAttributes>> {
    let result: SelectedListResult<FacilityGroupAttributes>;

    try {
      result = await facilityGroupDao.selectList(params);
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
  async info(
    params: FacilityGroupSelectInfoParams,
    logFormat: LogFormat<unknown>
  ): Promise<FacilityGroupAttributes | null> {
    let result: FacilityGroupAttributes | null;

    try {
      result = await facilityGroupDao.selectInfo(params);
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
  async edit(params: FacilityGroupUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;
    const transaction: Transaction = await sequelize.transaction();

    // 1. 설비 정보 수정
    try {
      result = await facilityGroupDao.update(params, transaction);
      logging.METHOD_ACTION(logFormat, __filename, params, result);

      // const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
      // const response = await superagent
      //   .put(`${restapiUrl}/facility-groups/code/:code`)
      //   .set('access-token', accessToken)
      //   .send(params);
      // const responseData: Record<string, any> = JSON.parse(response.text).Data;

      // logging.METHOD_ACTION(logFormat, __filename, null, responseData);

      await transaction.commit(); // 트랜잭션 커밋
    } catch (err) {
      await transaction.rollback(); // 트랜잭션 롤백
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
  // async editLiveState(params: FacilityGroupUpdateLiveStateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
  //   let result: UpdatedResult;

  //   try {
  //     result = await facilityGroupDao.updateLiveState(params);
  //     logging.METHOD_ACTION(logFormat, __filename, params, result);
  //   } catch (err) {
  //     logging.ERROR_METHOD(logFormat, __filename, params, err);

  //     return new Promise((resolve, reject) => {
  //       reject(err);
  //     });
  //   }

  //   return new Promise((resolve) => {
  //     resolve(result);
  //   });
  // },
  // delete
  async delete(params: FacilityGroupDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      result = await facilityGroupDao.delete(params);
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
