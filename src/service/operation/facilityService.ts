import { Transaction } from 'sequelize';
import { LogFormat, logging } from '../../lib/logging';
import {
  BulkInsertedOrUpdatedResult,
  DeletedResult,
  InsertedResult,
  SelectedAllResult,
  SelectedListResult,
  UpdatedResult,
} from '../../lib/resUtil';
import {
  FacilityAttributes,
  FacilityAttributesDeep,
  FacilityDeleteParams,
  FacilityInsertParams,
  FacilitySelectInfoParams,
  FacilitySelectListParams,
  FacilityUpdateParams,
} from '../../models/operation/facility';
// import { FacilityUserJoinInsertParams } from '../../models/operation/facilityUserJoin';
import { dao as facilityDao } from '../../dao/operation/facilityDao';
// import { dao as facilityUserJoinDao } from '../../dao/operation/facilityUserJoinDao';
import { makeRegularCodeDao } from '../../lib/usefullToolUtil';
import * as process from 'process';
import superagent from 'superagent';
import { restapiConfig } from '../../config/restapiConfig';
import { sequelize } from '../../models';
import { FacilityStatusType } from '../../lib/facilityUtil';
import { RedisKeys, useRedisUtil } from '../../lib/redisUtil';

const redisUtil = useRedisUtil();
const restapiUrl = `${restapiConfig.host}:${restapiConfig.port}`;
let accessToken = '';

// export const redisFacilityInfoUpdate = async (facilityStatus: FacilityStatusType) => {
//   const facilityInfo = await redisUtil.hgetObject<FacilityAttributesDeep>(RedisKeys.InfoFacility, facilityStatus.id || '');
//   if (!facilityInfo) {
//     logging.ACTION_ERROR({
//       filename: 'facilityService.ts.redisFacilityInfoUpdate',
//       error: `redis에 ${RedisKeys.InfoFacility}, ${facilityStatus.id} 데이터가 없습니다.`,
//       params: null,
//       result: false,
//     });
//     return;
//   }
//   const newFacilityInfo = await addRealTimeFacilityData(facilityInfo);
//   const newFacilityInfoString = JSON.stringify(newFacilityInfo);
//   redisUtil.hset(RedisKeys.InfoFacility, facilityInfo.code || '', newFacilityInfoString);
//   redisUtil.hset(RedisKeys.InfoFacilityById, facilityInfo.id.toString(), newFacilityInfoString);
// };
// const addRealTimeFacilityData = async (facilityData: FacilityAttributesDeep) => {
//   const realTimeFacilityDataString = await redisUtil.hget(RedisKeys.WorkerStatus, facilityData.code) || '';
//   if (!realTimeFacilityDataString) {
//     return (facilityData.RealTime = null);
//   // }
//   const realTimeFacilityData = JSON.parse(realTimeFacilityDataString) as FacilityStatusType;
//   facilityData.RealTime = realTimeFacilityData;
//   return facilityData;
// };

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
  // insert
  async reg(params: FacilityInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;
    const transaction: Transaction = await sequelize.transaction();

    // 1. 설비 정보 입력
    try {
      // code 칼럼 정량화
      const codeHeader = 'FAC';
      params.code = await makeRegularCodeDao('code', codeHeader, facilityDao);
      result = await facilityDao.insert(params, transaction);
      logging.METHOD_ACTION(logFormat, __filename, params, result);

      // ACS 테이블 입력
      const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
      const response = await superagent.post(`${restapiUrl}/facilities`).set('access-token', accessToken).send(params);
      console.log('🚀 ~ reg ~ response:', response);
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

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(
    params: FacilitySelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<FacilityAttributes>> {
    let result: SelectedListResult<FacilityAttributes>;

    try {
      console.log('??');
      result = await facilityDao.selectList(params);
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
  async info(params: FacilitySelectInfoParams, logFormat: LogFormat<unknown>): Promise<FacilityAttributes | null> {
    let result: FacilityAttributes | null;

    try {
      result = await facilityDao.selectInfo(params);
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
  async edit(params: FacilityUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;
    // const transaction: Transaction = await sequelize.transaction();

    // 1. 설비 정보 수정
    try {
      result = await facilityDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);

      // ACS 테이블 입력
      const accessToken = (await this.restapiLogin(logFormat))?.accessToken || '';
      const response = await superagent
        .put(`${restapiUrl}/facilities/code/:code`)
        .set('access-token', accessToken)
        .send(params);
      const responseData: Record<string, any> = JSON.parse(response.text).Data;

      logging.METHOD_ACTION(logFormat, __filename, null, responseData);
      // await transaction.commit(); // 트랜잭션 커밋
    } catch (err) {
      // await transaction.rollback(); // 트랜잭션 롤백
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
  // async editLiveState(params: FacilityUpdateLiveStateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
  //   let result: UpdatedResult;

  //   try {
  //     result = await facilityDao.updateLiveState(params);
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
  async delete(params: FacilityDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      result = await facilityDao.delete(params);
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
