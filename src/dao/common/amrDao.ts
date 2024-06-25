import { Op, Transaction } from 'sequelize';
import Amr, {
  AmrAttributes,
  AmrDeleteParams,
  AmrInsertParams,
  AmrSelectInfoParams,
  AmrSelectListParams,
  AmrSelectListQuery,
  AmrUpsertParams,
  AmrUpdateParams,
  AmrSelectOneByCodeParams,
} from '../../models/common/amr';
import {
  BulkInsertedOrUpdatedResult,
  DeletedResult,
  getOrderby,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
} from '../../lib/resUtil';
import User, { UserAttributesInclude } from '../../models/common/user';

const dao = {
  insert(params: AmrInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      Amr.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  insertTransac(params: unknown, transaction: Transaction): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      Amr.create(params, {
        transaction,
      })
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  bulkInsert(paramList: Array<AmrUpsertParams>): Promise<BulkInsertedOrUpdatedResult> {
    return new Promise((resolve, reject) => {
      Amr.bulkCreate(paramList, {
        updateOnDuplicate: ['code', 'name', 'serial', 'state', 'description', 'mapId'],
      })
        .then((insertedOrUpdatedList) => {
          const insertedOrUpdatedIds = insertedOrUpdatedList.map((row: unknown) => Number((row as { id?: number }).id));
          console.log('🚀 ~ .then ~ insertedOrUpdatedIds:', insertedOrUpdatedIds);
          resolve({ insertedOrUpdatedIds });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: AmrSelectListParams): Promise<SelectedListResult<AmrAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: AmrSelectListQuery = {};
    if (params.name) {
      setQuery.where = {
        ...setQuery.where,
        name: { [Op.like]: `%${params.name}%` }, // 'like' 검색
      };
    }
    if (params.code) {
      setQuery.where = {
        ...setQuery.where,
        code: params.code, // '=' 검색
      };
    }
    if (params.serial) {
      setQuery.where = {
        ...setQuery.where,
        serial: params.serial, // '=' 검색
      };
    }
    if (params.state) {
      setQuery.where = {
        ...setQuery.where,
        state: params.state, // '=' 검색
      };
    }
    if (params.active) {
      setQuery.where = {
        ...setQuery.where,
        active: params.active, // '=' 검색
      };
    }

    // 기간 검색
    if (params.createdAtFrom || params.createdAtTo) {
      if (params.createdAtFrom && params.createdAtTo) {
        setQuery.where = {
          ...setQuery.where,
          createdAt: { [Op.between]: [params.createdAtFrom, params.createdAtTo] }, // 'between '검색
        };
      } else {
        if (params.createdAtFrom) {
          setQuery.where = {
            ...setQuery.where,
            createdAt: { [Op.gte]: params.createdAtFrom }, // '>=' 검색
          };
        }
        if (params.createdAtTo) {
          setQuery.where = {
            ...setQuery.where,
            createdAt: { [Op.lte]: params.createdAtTo }, // '<=' 검색
          };
        }
      }
    }

    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    setQuery.order = getOrderby(params.order);

    return new Promise((resolve, reject) => {
      Amr.findAndCountAll({
        ...setQuery,
        attributes: { exclude: ['description'] }, // 해당 필드 제외
        distinct: true,
        include: [
        ],
      })
        .then((selectedList) => {
          resolve(selectedList);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectListRunningWorkOrder(params: AmrSelectListParams): Promise<SelectedListResult<AmrAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: AmrSelectListQuery = {};
    // 1. where조건 세팅
    if (params.name) {
      setQuery.where = {
        ...setQuery.where,
        name: { [Op.like]: `%${params.name}%` }, // 'like' 검색
      };
    }
    if (params.code) {
      setQuery.where = {
        ...setQuery.where,
        code: params.code, // '=' 검색
      };
    }
    if (params.serial) {
      setQuery.where = {
        ...setQuery.where,
        serial: params.serial, // '=' 검색
      };
    }
    if (params.state) {
      setQuery.where = {
        ...setQuery.where,
        state: params.state, // '=' 검색
      };
    }
    if (params.active) {
      setQuery.where = {
        ...setQuery.where,
        active: params.active, // '=' 검색
      };
    }

    // 기간 검색
    if (params.createdAtFrom || params.createdAtTo) {
      if (params.createdAtFrom && params.createdAtTo) {
        setQuery.where = {
          ...setQuery.where,
          createdAt: { [Op.between]: [params.createdAtFrom, params.createdAtTo] }, // 'between '검색
        };
      } else {
        if (params.createdAtFrom) {
          setQuery.where = {
            ...setQuery.where,
            createdAt: { [Op.gte]: params.createdAtFrom }, // '>=' 검색
          };
        }
        if (params.createdAtTo) {
          setQuery.where = {
            ...setQuery.where,
            createdAt: { [Op.lte]: params.createdAtTo }, // '<=' 검색
          };
        }
      }
    }

    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    setQuery.order = getOrderby(params.order);

    return new Promise((resolve, reject) => {
      Amr.findAndCountAll({
        ...setQuery,
        attributes: { exclude: ['description'] }, // 해당 필드 제외
        distinct: true,
        include: [
          
        ],
      })
        .then((selectedList) => {
          resolve(selectedList);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectInfo(params: AmrSelectInfoParams): Promise<AmrAttributes | null> {
    return new Promise((resolve, reject) => {
      Amr.findByPk(params.id, {
        
      })
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectOneCode(params: AmrSelectOneByCodeParams): Promise<AmrAttributes | null> {
    return new Promise((resolve, reject) => {
      Amr.findOne({where: {code: params.code} })
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  update(params: AmrUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      Amr.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: AmrDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      Amr.destroy({
        where: {
          id: params.id,
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
};

export { dao };
