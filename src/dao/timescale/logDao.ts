import { Op } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  // SelectedAllResult,
  // UpdatedResult,
  // DeletedResult,
  getOrderby,
  // DeletedResult,
} from '../../lib/resUtil';
import Log, {
  LogAttributes,
  LogInsertParams,
  LogSelectListParams,
  LogSelectListQuery,
  LogSelectInfoParams,
  logLevels,
  type,
} from '../../models/timescale/log';

const currentLevel = (process.env.LOGGER_LEVEL || 'info') as type;

const logDao = {
  insert(params: LogInsertParams): Promise<InsertedResult> | void {
    if (logLevels[currentLevel] < logLevels[params.type]) {
      return;
    }
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
  countLogRecords(params: LogSelectListParams, level: string): Promise<{ [key: string]: number }> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: LogSelectListQuery = {};
    // 1. where조건 세팅
    if (level) {
      setQuery.where = {
        ...setQuery.where,
        type: { [Op.like]: `%${level}%` }, // 'like' 검색
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
      Log.count({
        ...setQuery,
        where: {
          ...setQuery.where,
        },
        group: ['function'], // 'function' 컬럼을 기준으로 그룹화.
        // distinct: true,
      })
        .then((selectedList) => {
          resolve(selectedList);
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
    if (params.type) {
      setQuery.where = {
        ...setQuery.where,
        type: { [Op.like]: `%${params.type}%` }, // 'like' 검색
      };
    }
    if (params.function) {
      setQuery.where = {
        ...setQuery.where,
        function: { [Op.like]: `%${params.function}%` }, // 'like' 검색
      };
    }
    if (params.system) {
      setQuery.where = {
        ...setQuery.where,
        system: { [Op.like]: `%${params.system}%` }, // 'like' 검색
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
