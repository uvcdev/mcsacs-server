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
import AlarmEmail, {
  AlarmEmailAttributes,
  AlarmEmailInsertParams,
  AlarmEmailSelectListParams,
  AlarmEmailSelectListQuery,
  AlarmEmailSelectInfoParams,
  AlarmEmailSelectOneParams,
  AlarmEmailUpdateParams,
  // AlarmEmailDeleteParams,
  AlarmEmailDeleteParams,
  AlarmEmailAttributesInclude,
} from '../../models/common/alarmEmail';
import User, { UserAttributesInclude } from '../../models/common/user';

const dao = {
  insert(params: AlarmEmailInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      AlarmEmail.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: AlarmEmailSelectListParams): Promise<SelectedListResult<AlarmEmailAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: AlarmEmailSelectListQuery = {};
    // 1. where조건 세팅
    if (params.ids) {
      setQuery.where = {
        ...setQuery.where,
        id: params.ids, // 'in' 검색
      };
    }
    if (params.email) {
      setQuery.where = {
        ...setQuery.where,
        email: { [Op.like]: `%${params.email}%` }, // 'like' 검색
      };
    }
    if (params.name) {
      setQuery.where = {
        ...setQuery.where,
        name: { [Op.like]: `%${params.name}%` }, // 'like' 검색
      };
    }
    if (params.userIds) {
      setQuery.where = {
        ...setQuery.where,
        userId: params.userIds, // 'in' 검색
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
      AlarmEmail.findAndCountAll({
        ...setQuery,
        where: {
          ...setQuery.where,
        },
        attributes: AlarmEmailAttributesInclude, // 해당 필드 제외
        distinct: true,
        include: [
          {
            model: User,
            as: 'User',
            attributes: UserAttributesInclude,
          },
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
  selectInfo(params: AlarmEmailSelectInfoParams): Promise<AlarmEmailAttributes | null> {
    return new Promise((resolve, reject) => {
      AlarmEmail.findByPk(params.id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: UserAttributesInclude,
          },
        ],
      })
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  update(params: AlarmEmailUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      AlarmEmail.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectOne(params: AlarmEmailSelectOneParams): Promise<AlarmEmailAttributes | null> {
    return new Promise((resolve, reject) => {
      AlarmEmail.findOne({
        where: { id: params.id },
      })
        .then((selectedOne) => {
          resolve(selectedOne);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: AlarmEmailDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      AlarmEmail.destroy({
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
