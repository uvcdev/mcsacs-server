import { Op } from 'sequelize';
import {
  InsertedResult,
  BulkInsertedOrUpdatedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
  SelectedAllResult,
  getOrderby,
} from '../../lib/resUtil';
import CommonCode, {
  CommonCodeAttributes,
  CommonCodeInsertParams,
  CommonCodeSelectListParams,
  CommonCodeSelectListQuery,
  CommonCodeSelectInfoParams,
  CommonCodeSelectOneParams,
  CommonCodeSelectAllCodeParams,
  CommonCodeUpdateParams,
  CommonCodeDeleteParams,
} from '../../models/common/commonCode';

const dao = {
  insert(params: CommonCodeInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      CommonCode.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  bulkInsert(paramList: Array<CommonCodeInsertParams>): Promise<BulkInsertedOrUpdatedResult> {
    return new Promise((resolve, reject) => {
      CommonCode.bulkCreate(paramList, {
        updateOnDuplicate: ['code', 'name', 'masterCode', 'level', 'type', 'orderby', 'description'],
      })
        .then((insertedOrUpdatedList) => {
          const insertedOrUpdatedIds = insertedOrUpdatedList.map((row: unknown) => Number((row as { id?: number }).id));
          resolve({ insertedOrUpdatedIds });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: CommonCodeSelectListParams): Promise<SelectedListResult<CommonCodeAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: CommonCodeSelectListQuery = {};
    // 1. where 조건 세팅
    if (params.code) {
      setQuery.where = {
        ...setQuery.where,
        code: params.code, // '='검색
      };
    }
    if (params.name) {
      setQuery.where = {
        ...setQuery.where,
        name: { [Op.like]: `%${params.name}%` }, // 'like' 검색
      };
    }
    if (params.masterCode) {
      setQuery.where = {
        ...setQuery.where,
        masterCode: { [Op.like]: `%${params.masterCode}%` }, // 'like' 검색
      };
    }
    if (params.level) {
      setQuery.where = {
        ...setQuery.where,
        level: params.level, // '='검색
      };
    }
    if (params.type) {
      setQuery.where = {
        ...setQuery.where,
        type: params.type, // '='검색
      };
    }
    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    // setQuery.order = getOrderby(params.order);
    setQuery.order = [
      ['master_code', 'ASC'],
      ['orderby', 'ASC'],
    ];

    return new Promise((resolve, reject) => {
      CommonCode.findAndCountAll({
        ...setQuery,
        distinct: true,
      })
        .then((selectedList) => {
          resolve(selectedList);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectInfo(params: CommonCodeSelectInfoParams): Promise<CommonCodeAttributes | null> {
    return new Promise((resolve, reject) => {
      CommonCode.findByPk(params.id)
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectOne(params: CommonCodeSelectOneParams): Promise<CommonCodeAttributes | null> {
    return new Promise((resolve, reject) => {
      CommonCode.findOne({
        where: { code: params.code },
      })
        .then((selectedOne) => {
          resolve(selectedOne);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectAllCode(params: CommonCodeSelectAllCodeParams): Promise<SelectedAllResult<CommonCodeAttributes>> {
    return new Promise((resolve, reject) => {
      CommonCode.findAll({
        where: {
          code: params.codes,
        },
      })
        .then((selectedAll) => {
          resolve(selectedAll);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  update(params: CommonCodeUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      CommonCode.update(params, {
        where: { id: params.id },
      })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  bulkUpdateOrderby(paramList: Array<CommonCodeUpdateParams>): Promise<BulkInsertedOrUpdatedResult> {
    return new Promise((resolve, reject) => {
      CommonCode.bulkCreate(paramList, {
        updateOnDuplicate: ['name', 'orderby', 'level', 'masterCode'],
      })
        .then((insertedOrUpdatedList) => {
          const insertedOrUpdatedIds = insertedOrUpdatedList.map((row: unknown) => Number((row as { id?: number }).id));
          resolve({ insertedOrUpdatedIds });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: CommonCodeDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      CommonCode.destroy({
        // 다음의 조건으로만 삭제 가능
        where: {
          id: params.id,
          level: { [Op.not]: 0 },
        },
      })
        .then((deleted) => {
          resolve({ deletedCount: deleted });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  deleteForce(params: CommonCodeDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      CommonCode.destroy({
        // 다음의 조건으로만 삭제 가능
        where: {
          id: params.id,
          level: { [Op.not]: 0 },
          type: 'company',
        },
        force: true,
      })
        .then((deleted) => {
          resolve({ deletedCount: deleted });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export { dao };
