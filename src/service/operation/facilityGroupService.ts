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

const service = {
  // insert
  async reg(params: FacilityGroupInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    // 1. 설비 정보 입력
    try {
      result = await facilityGroupDao.insert(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (promise 2-1)설비당 작업자 입력
    // const promiseInsertFacilityGroupUserJoin = async (
    //   facilityGroupId: InsertedResult['insertedId'],
    //   userIds: FacilityGroupInsertParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   const paramList: Array<FacilityGroupUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         facilityGroupId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   try {
    //     insertedIds = await facilityGroupUserJoinDao.bulkInsert(paramList);
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
    // const [insertedFacilityGroupUserJoin] = await Promise.all([
    //   promiseInsertFacilityGroupUserJoin(result.insertedId, params.userIds),
    // ]);

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
  async info(params: FacilityGroupSelectInfoParams, logFormat: LogFormat<unknown>): Promise<FacilityGroupAttributes | null> {
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

    // 1. 설비 정보 수정
    try {
      result = await facilityGroupDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (Promise 2-1)설비당 작업자 정보 입력
    // const promiseInsertFacilityGroupUserJoin = async (
    //   facilityGroupId: number,
    //   userIds: FacilityGroupUpdateParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   // 설비당 작업정보 일괄 삭제
    //   const deleteFacilityGroupUserJoinParams = {
    //     facilityGroupId,
    //   };
    //   try {
    //     const deleteFacilityGroupUserJoin = await facilityGroupUserJoinDao.deleteForce(deleteFacilityGroupUserJoinParams);
    //     logging.METHOD_ACTION(logFormat, __filename, deleteFacilityGroupUserJoinParams, deleteFacilityGroupUserJoin);
    //   } catch (err) {
    //     logging.ERROR_METHOD(logFormat, __filename, deleteFacilityGroupUserJoinParams, err);

    //     return new Promise((resolve, reject) => {
    //       reject(err);
    //     });
    //   }

    //   const paramList: Array<FacilityGroupUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         facilityGroupId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   // 설비당 작업자 입력
    //   try {
    //     insertedIds = await facilityGroupUserJoinDao.bulkInsert(paramList);
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
    // const [insertedFacilityGroupUserJoin] = await Promise.all([
    //   promiseInsertFacilityGroupUserJoin(params.id ? params.id : 0, params.userIds ? params.userIds : []),
    // ]);

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
