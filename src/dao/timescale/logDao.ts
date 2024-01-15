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
import Log, {
  LogAttributes,
  LogInsertParams,
  LogSelectListParams,
  LogSelectListQuery,
  LogSelectInfoParams,
} from '../../models/timescale/log';

const logDao = {
  insert(params: LogInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      Log.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: LogSelectListParams): Promise<SelectedListResult<LogAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: LogSelectListQuery = {};
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
    if (params.amrCode) {
      setQuery.where = {
        ...setQuery.where,
        amrCode: { [Op.like]: `%${params.amrCode}%` }, // 'like' 검색
      };
    }
    if (params.amrName) {
      setQuery.where = {
        ...setQuery.where,
        amrName: { [Op.like]: `%${params.amrName}%` }, // 'like' 검색
      };
    }
    if (params.system) {
      setQuery.where = {
        ...setQuery.where,
        system: { [Op.like]: `%${params.system}%` }, // 'like' 검색
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
      Log.findAndCountAll({
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
  selectInfo(params: LogSelectInfoParams): Promise<LogAttributes | null> {
    return new Promise((resolve, reject) => {
      Log.findByPk(params.id, {})
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export { logDao };
