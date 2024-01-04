import { Op } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  SelectedAllResult,
  UpdatedResult,
  DeletedResult,
  getOrderby,
} from '../../lib/resUtil';
import TokenHistory, {
  TokenHistoryAttributes,
  TokenHistoryInsertParams,
  TokenHistorySelectListParams,
  TokenHistorySelectListQuery,
  TokenHistorySelectListSubQueryUser,
  TokenHistorySelectInfoParams,
  // TokenHistoryUpdateParams,
  // TokenHistoryDeleteParams,
} from '../../models/common/tokenHistory';
import User, { UserAttributesInclude } from '../../models/common/user';

const dao = {
  insert(params: TokenHistoryInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      TokenHistory.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: TokenHistorySelectListParams): Promise<SelectedListResult<TokenHistoryAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: TokenHistorySelectListQuery = {};
    // 1. where조건 세팅
    if (params.userIds) {
      setQuery.where = {
        ...setQuery.where,
        userId: params.userIds, // 'in' 검색
      };
    }
    if (params.action) {
      setQuery.where = {
        ...setQuery.where,
        action: params.action, // '=' 검색
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
    // subQuery
    const setSubQueryUser: TokenHistorySelectListSubQueryUser = {};
    if (params.companyIds) {
      setSubQueryUser.where = {
        ...setSubQueryUser.where,
        companyId: params.companyIds,
      };
    }
    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    setQuery.order = getOrderby(params.order);

    return new Promise((resolve, reject) => {
      TokenHistory.findAndCountAll({
        ...setQuery,
        attributes: { exclude: ['accessToken'] }, // 해당 필드 제외
        distinct: true,
        include: {
          model: User,
          as: 'User',
          attributes: UserAttributesInclude,
          ...setSubQueryUser,
          include: [],
        },
      })
        .then((selectedList) => {
          resolve(selectedList);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectInfo(params: TokenHistorySelectInfoParams): Promise<TokenHistoryAttributes | null> {
    return new Promise((resolve, reject) => {
      TokenHistory.findByPk(params.id, {
        include: {
          model: User,
          as: 'User',
          attributes: UserAttributesInclude,
          include: [],
        },
      })
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export { dao };
