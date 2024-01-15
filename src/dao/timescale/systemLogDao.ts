import { Op } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  // SelectedAllResult,
  UpdatedResult,
  // DeletedResult,
  getOrderby,
  DeletedResult,
} from '../../lib/resUtil';
import SystemLog, {
  SystemLogAttributes,
  SystemLogInsertParams,
  SystemLogSelectListParams,
  SystemLogSelectListQuery,
  SystemLogSelectInfoParams,
} from '../../models/timescale/systemLog';

const systemLogDao = {
  insert(params: SystemLogInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      SystemLog.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: SystemLogSelectListParams): Promise<SelectedListResult<SystemLogAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: SystemLogSelectListQuery = {};
    // 1. where조건 세팅

    if (params.facilityCode) {
      setQuery.where = {
        ...setQuery.where,
        facilityCode: { [Op.like]: `%${params.facilityCode}%` }, // 'like' 검색
      };
    }
    if (params.facilityName) {
      setQuery.where = {
        ...setQuery.where,
        facilityName: { [Op.like]: `%${params.facilityName}%` }, // 'like' 검색
      };
    }
    if (params.from) {
      setQuery.where = {
        ...setQuery.where,
        from: { [Op.like]: `%${params.from}%` }, // 'like' 검색
      };
    }
    if (params.to) {
      setQuery.where = {
        ...setQuery.where,
        to: { [Op.like]: `%${params.to}%` }, // 'like' 검색
      };
    }
    if (params.type) {
      setQuery.where = {
        ...setQuery.where,
        type: { [Op.like]: `%${params.type}%` }, // 'like' 검색
      };
    }
    // 기간 검색 - 등록일
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
      SystemLog.findAndCountAll({
        ...setQuery,
        where: {
          ...setQuery.where,
        },
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
  selectInfo(params: SystemLogSelectInfoParams): Promise<SystemLogAttributes | null> {
    return new Promise((resolve, reject) => {
      SystemLog.findByPk(params.id, {})
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export { systemLogDao };
