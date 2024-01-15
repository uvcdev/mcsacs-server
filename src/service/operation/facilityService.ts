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

const service = {
  // insert
  async reg(params: FacilityInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    // 1. 설비 정보 입력
    try {
      // code 칼럼 정량화
      const codeHeader = 'FAC';

      params.code = await makeRegularCodeDao('code', codeHeader, facilityDao);

      result = await facilityDao.insert(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (promise 2-1)설비당 작업자 입력
    // const promiseInsertFacilityUserJoin = async (
    //   facilityId: InsertedResult['insertedId'],
    //   userIds: FacilityInsertParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   const paramList: Array<FacilityUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         facilityId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   try {
    //     insertedIds = await facilityUserJoinDao.bulkInsert(paramList);
    //     logging.METHOD_ACTION(logFormat, __filename, paramList, insertedIds);
    //   } catch (err) {
    //     logging.ERROR_METHOD(logFormat, __filename, params, err);

    //     return new Promise((resolve, reject) => {
    //       reject(err);
    //     });
    //   }

    //   return new Promise((resolve) => {
    //     resolve(insertedIds);
    //   });
    // };

    // 3. (Promise.all)설비당 작업자 입력 처리
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [insertedFacilityUserJoin] = await Promise.all([
    //   promiseInsertFacilityUserJoin(result.insertedId, params.userIds),
    // ]);

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

    // 1. 설비 정보 수정
    try {
      result = await facilityDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (Promise 2-1)설비당 작업자 정보 입력
    // const promiseInsertFacilityUserJoin = async (
    //   facilityId: number,
    //   userIds: FacilityUpdateParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   // 설비당 작업정보 일괄 삭제
    //   const deleteFacilityUserJoinParams = {
    //     facilityId,
    //   };
    //   try {
    //     const deleteFacilityUserJoin = await facilityUserJoinDao.deleteForce(deleteFacilityUserJoinParams);
    //     logging.METHOD_ACTION(logFormat, __filename, deleteFacilityUserJoinParams, deleteFacilityUserJoin);
    //   } catch (err) {
    //     logging.ERROR_METHOD(logFormat, __filename, deleteFacilityUserJoinParams, err);

    //     return new Promise((resolve, reject) => {
    //       reject(err);
    //     });
    //   }

    //   const paramList: Array<FacilityUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         facilityId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   // 설비당 작업자 입력
    //   try {
    //     insertedIds = await facilityUserJoinDao.bulkInsert(paramList);
    //     logging.METHOD_ACTION(logFormat, __filename, paramList, insertedIds);
    //   } catch (err) {
    //     logging.ERROR_METHOD(logFormat, __filename, params, err);

    //     return new Promise((resolve, reject) => {
    //       reject(err);
    //     });
    //   }

    //   return new Promise((resolve) => {
    //     resolve(insertedIds);
    //   });
    // };

    // (Promise.all)설비당 작업자 입력 처리
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [insertedFacilityUserJoin] = await Promise.all([
    //   promiseInsertFacilityUserJoin(params.id ? params.id : 0, params.userIds ? params.userIds : []),
    // ]);

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
