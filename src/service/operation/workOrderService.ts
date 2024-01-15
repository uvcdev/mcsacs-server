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
  WorkOrderAttributes,
  WorkOrderDeleteParams,
  WorkOrderInsertParams,
  WorkOrderSelectInfoParams,
  WorkOrderSelectListParams,
  WorkOrderUpdateParams,
} from '../../models/operation/workOrder';
// import { WorkOrderUserJoinInsertParams } from '../../models/operation/workOrderUserJoin';
import { dao as workOrderDao } from '../../dao/operation/workOrderDao';
// import { dao as workOrderUserJoinDao } from '../../dao/operation/workOrderUserJoinDao';
import { makeRegularCodeDao } from '../../lib/usefullToolUtil';
import * as process from 'process';

const service = {
  // insert
  async reg(params: WorkOrderInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    // 1. 설비 정보 입력
    try {
      result = await workOrderDao.insert(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (promise 2-1)설비당 작업자 입력
    // const promiseInsertWorkOrderUserJoin = async (
    //   workOrderId: InsertedResult['insertedId'],
    //   userIds: WorkOrderInsertParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   const paramList: Array<WorkOrderUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         workOrderId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   try {
    //     insertedIds = await workOrderUserJoinDao.bulkInsert(paramList);
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
    // const [insertedWorkOrderUserJoin] = await Promise.all([
    //   promiseInsertWorkOrderUserJoin(result.insertedId, params.userIds),
    // ]);

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(
    params: WorkOrderSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<WorkOrderAttributes>> {
    let result: SelectedListResult<WorkOrderAttributes>;

    try {
      result = await workOrderDao.selectList(params);
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
  async info(params: WorkOrderSelectInfoParams, logFormat: LogFormat<unknown>): Promise<WorkOrderAttributes | null> {
    let result: WorkOrderAttributes | null;

    try {
      result = await workOrderDao.selectInfo(params);
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
  async edit(params: WorkOrderUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    // 1. 설비 정보 수정
    try {
      result = await workOrderDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (Promise 2-1)설비당 작업자 정보 입력
    // const promiseInsertWorkOrderUserJoin = async (
    //   workOrderId: number,
    //   userIds: WorkOrderUpdateParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   // 설비당 작업정보 일괄 삭제
    //   const deleteWorkOrderUserJoinParams = {
    //     workOrderId,
    //   };
    //   try {
    //     const deleteWorkOrderUserJoin = await workOrderUserJoinDao.deleteForce(deleteWorkOrderUserJoinParams);
    //     logging.METHOD_ACTION(logFormat, __filename, deleteWorkOrderUserJoinParams, deleteWorkOrderUserJoin);
    //   } catch (err) {
    //     logging.ERROR_METHOD(logFormat, __filename, deleteWorkOrderUserJoinParams, err);

    //     return new Promise((resolve, reject) => {
    //       reject(err);
    //     });
    //   }

    //   const paramList: Array<WorkOrderUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         workOrderId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   // 설비당 작업자 입력
    //   try {
    //     insertedIds = await workOrderUserJoinDao.bulkInsert(paramList);
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
    // const [insertedWorkOrderUserJoin] = await Promise.all([
    //   promiseInsertWorkOrderUserJoin(params.id ? params.id : 0, params.userIds ? params.userIds : []),
    // ]);

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // update
  // async editLiveState(params: WorkOrderUpdateLiveStateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
  //   let result: UpdatedResult;

  //   try {
  //     result = await workOrderDao.updateLiveState(params);
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
  async delete(params: WorkOrderDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      result = await workOrderDao.delete(params);
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
