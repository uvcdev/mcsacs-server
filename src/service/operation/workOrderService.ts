import { LogFormat, logging } from '../../lib/logging';
import { restapiConfig } from '../../config/restapiConfig';
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
import { dao as itemDao } from '../../dao/operation/itemDao';
// import { dao as workOrderUserJoinDao } from '../../dao/operation/workOrderUserJoinDao';
import { makeRegularCode, makeRegularCodeDao } from '../../lib/usefullToolUtil';
import * as process from 'process';
import { ItemInsertParams } from '../../models/operation/item';
import superagent from 'superagent';
import { Transaction } from 'sequelize';
import { sequelize } from '../../models';

const restapiUrl = `${restapiConfig.host}:${restapiConfig.port}`;
let accessToken = '';

const service = {
  // restapi login
  async restapiLogin(): Promise<Record<string, any>> {
    let result: Record<string, any>;

    try {
      result = await superagent.post(`${restapiUrl}/auths/token`).send({
        userid: restapiConfig.id,
        password: restapiConfig.pass,
      });
      accessToken = JSON.parse(result.text).data.accessToken;
      result = { accessToken };
    } catch (err) {
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
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
  // imcs 로부터 메시지 수신하여 작업등록
  async regWorkOrder(params: WorkOrderInsertParams): Promise<InsertedResult> {
    let workOrderResult: InsertedResult;
    const transaction: Transaction = await sequelize.transaction();

    try {
      let result: InsertedResult;
      const spreadParams = { ...Object.values(params) };
      // 품목 조회해서 없을 경우 insert
      const existItem = await itemDao.selectInfo({ id: spreadParams[4] });
      let existItemCode = null

      if (existItem) {
        existItemCode = await itemDao.selectOneCode({ code: existItem?.code });
      }
      if (!existItem || !existItemCode) {
        const codeHeader = 'ITM';
        const highestRow = await itemDao.selectList({
          order: '-id',
          limit: 1,
        });
        params.itemCode = makeRegularCode(highestRow, 'code', codeHeader);

        const itemInsertParam: ItemInsertParams = {
          code: params.itemCode,
          type: null
        };
        result = await itemDao.insert(itemInsertParam);
        params.id = result.insertedId
        console.log("🚀 ~ regWorkOrder ~ result.insertedId:", result.insertedId)
      }

      let chkZone = 0
      let chkEqp = 0

      // EQP 가 WCS에 배터리를 반출 요청
      if (spreadParams[2] === 'OUT') {
        chkZone = spreadParams[1] === '' ? null : spreadParams[1]
        chkEqp = spreadParams[3] === '' ? null : spreadParams[3]
      } else {
        // EQP 에서 WCS에 비어있는 스키드 반입 요청
        chkZone = spreadParams[3] === '' ? null : spreadParams[3]
        chkEqp = spreadParams[1] === '' ? null : spreadParams[1]
      }

      // 작업지시 생성
      const transParams: WorkOrderInsertParams = {
        code: spreadParams[0] === '' ? null : spreadParams[0],
        fromFacilityId: chkZone,
        type: spreadParams[2] === '' ? null : spreadParams[2],
        toFacilityId: chkEqp,
        itemId: params.id || spreadParams[4],
        itemCode: params.itemCode,
        level: spreadParams[5] === '' ? null : spreadParams[5],

        fromAmrId: spreadParams[6] === '' ? null : spreadParams[6],
        state: spreadParams[7] === '' ? null : spreadParams[7],
        cancelUserId: spreadParams[8] === '' ? null : spreadParams[8],
        cancelDate: spreadParams[9] === '' ? null : spreadParams[9],
        description: spreadParams[10] === '' ? null : spreadParams[10],
      };
      workOrderResult = await workOrderDao.insertTransac(transParams, transaction);

      // ACS 테이블 입력
      const accessToken = (await this.restapiLogin())?.accessToken || '';
      await superagent.post(`${restapiUrl}/work-orders/fromMcs`).set('access-token', accessToken).send(transParams);
      await transaction.commit(); // 트랜잭션 커밋
    } catch (err) {
      await transaction.rollback(); // 트랜잭션 롤백
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(workOrderResult);
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
