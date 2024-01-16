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
  ItemAttributes,
  ItemDeleteParams,
  ItemInsertParams,
  ItemSelectInfoParams,
  ItemSelectListParams,
  ItemUpdateParams,
} from '../../models/operation/item';
// import { ItemUserJoinInsertParams } from '../../models/operation/itemUserJoin';
import { dao as itemDao } from '../../dao/operation/itemDao';
// import { dao as itemUserJoinDao } from '../../dao/operation/itemUserJoinDao';
import { makeRegularCodeDao } from '../../lib/usefullToolUtil';
import * as process from 'process';

const service = {
  // insert
  async reg(params: ItemInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    // 1. 설비 정보 입력
    try {
      result = await itemDao.insert(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (promise 2-1)설비당 작업자 입력
    // const promiseInsertItemUserJoin = async (
    //   itemId: InsertedResult['insertedId'],
    //   userIds: ItemInsertParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   const paramList: Array<ItemUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         itemId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   try {
    //     insertedIds = await itemUserJoinDao.bulkInsert(paramList);
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
    // const [insertedItemUserJoin] = await Promise.all([
    //   promiseInsertItemUserJoin(result.insertedId, params.userIds),
    // ]);

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(
    params: ItemSelectListParams,
    logFormat: LogFormat<unknown>
  ): Promise<SelectedListResult<ItemAttributes>> {
    let result: SelectedListResult<ItemAttributes>;

    try {
      result = await itemDao.selectList(params);
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
  async info(params: ItemSelectInfoParams, logFormat: LogFormat<unknown>): Promise<ItemAttributes | null> {
    let result: ItemAttributes | null;

    try {
      result = await itemDao.selectInfo(params);
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
  async edit(params: ItemUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    // 1. 설비 정보 수정
    try {
      result = await itemDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // (Promise 2-1)설비당 작업자 정보 입력
    // const promiseInsertItemUserJoin = async (
    //   itemId: number,
    //   userIds: ItemUpdateParams['userIds']
    // ): Promise<BulkInsertedOrUpdatedResult> => {
    //   let insertedIds: BulkInsertedOrUpdatedResult;

    //   // 설비당 작업정보 일괄 삭제
    //   const deleteItemUserJoinParams = {
    //     itemId,
    //   };
    //   try {
    //     const deleteItemUserJoin = await itemUserJoinDao.deleteForce(deleteItemUserJoinParams);
    //     logging.METHOD_ACTION(logFormat, __filename, deleteItemUserJoinParams, deleteItemUserJoin);
    //   } catch (err) {
    //     logging.ERROR_METHOD(logFormat, __filename, deleteItemUserJoinParams, err);

    //     return new Promise((resolve, reject) => {
    //       reject(err);
    //     });
    //   }

    //   const paramList: Array<ItemUserJoinInsertParams> = [];
    //   if (userIds && userIds.length > 0) {
    //     for (let i = 0; i < userIds.length; i += 1) {
    //       paramList.push({
    //         itemId,
    //         userId: userIds[i],
    //       });
    //     }
    //   }

    //   // 설비당 작업자 입력
    //   try {
    //     insertedIds = await itemUserJoinDao.bulkInsert(paramList);
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
    // const [insertedItemUserJoin] = await Promise.all([
    //   promiseInsertItemUserJoin(params.id ? params.id : 0, params.userIds ? params.userIds : []),
    // ]);

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // update
  // async editLiveState(params: ItemUpdateLiveStateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
  //   let result: UpdatedResult;

  //   try {
  //     result = await itemDao.updateLiveState(params);
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
  async delete(params: ItemDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      result = await itemDao.delete(params);
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
