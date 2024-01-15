import { Op, Transaction } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  SelectedAllResult,
  UpdatedResult,
  DeletedResult,
  getOrderby,
} from '../../lib/resUtil';
import Zone, {
  ZoneAttributes,
  ZoneInsertParams,
  ZoneSelectListParams,
  ZoneSelectListQuery,
  // ZoneSelectAllParams,
  // ZoneSelectAllQuery,
  ZoneSelectInfoParams,
  ZoneSelectOneParams,
  ZoneUpdateParams,
  // ZoneUpdateLiveStateParams,
  // ZoneUpdateRunningStateParams,
  ZoneDeleteParams,
} from '../../models/operation/zone';
import CommonCode, { CommonCodeAttributesInclude } from '../../models/common/commonCode';
import User, { UserAttributesInclude } from '../../models/common/user';
// import ZoneInterrupt, { ZoneInterruptAttributesInclude } from '../../models/operation/zoneInterrupt';
// import ZoneMaintenance, { ZoneMaintenanceAttributesInclude } from '../../models/operation/zoneMaintenance';
// import ZoneMaintenanceHistory, {
//   ZoneMaintenanceHistoryAttributesInclude,
// } from '../../models/operation/zoneMaintenanceHistory';

const dao = {
  insert(params: ZoneInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      Zone.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: ZoneSelectListParams): Promise<SelectedListResult<ZoneAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: ZoneSelectListQuery = {};
    // 1. where조건 세팅
    if (params.ids) {
      setQuery.where = {
        ...setQuery.where,
        id: params.ids, // 'in' 검색
      };
    }
    if (params.name) {
      setQuery.where = {
        ...setQuery.where,
        name: { [Op.like]: `%${params.name}%` }, // 'like' 검색
      };
    }
    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    setQuery.order = getOrderby(params.order);

    return new Promise((resolve, reject) => {
      Zone.findAndCountAll({
        ...setQuery,
        distinct: true,
        include: [
          // {
          //   model: ZoneGroup,
          //   as: 'ZoneGroup',
          //   attributes: ZoneGroupAttributesInclude,
          // },
          // {
          //   model: Zone,
          //   as: 'Zone',
          //   attributes: ZoneAttributesInclude,
          // },
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
  // selectAll(params: ZoneSelectAllParams): Promise<SelectedAllResult<ZoneAttributes>> {
  //   // DB에 넘길 최종 쿼리 세팅
  //   const setQuery: ZoneSelectAllQuery = {};
  //   // 1. where조건 세팅
  //   if (params.companyIds) {
  //     setQuery.where = {
  //       ...setQuery.where,
  //       companyId: params.companyIds, // 'in' 검색
  //     };
  //   }

  //   return new Promise((resolve, reject) => {
  //     Zone.findAll({
  //       ...setQuery,
  //       order: [['code', 'ASC']],
  //     })
  //       .then((selectedAll) => {
  //         resolve(selectedAll);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  // },
  selectInfo(params: ZoneSelectInfoParams): Promise<ZoneAttributes | null> {
    return new Promise((resolve, reject) => {
      Zone.findByPk(params.id, {
        include: [
          // {
          //   model: ZoneGroup,
          //   as: 'ZoneGroup',
          //   attributes: ZoneGroupAttributesInclude,
          // },
          // {
          //   model: Zone,
          //   as: 'Zone',
          //   attributes: ZoneAttributesInclude,
          // },
          // {
          //   model: User,
          //   as: 'User',
          //   attributes: UserAttributesInclude,
          // },
          // {
          //   model: User,
          //   as: 'Workers',
          //   attributes: UserAttributesInclude,
          //   through: {
          //     attributes: [],
          //   },
          //   include: [
          //     {
          //       model: Department,
          //       as: 'Departments',
          //       attributes: DepartmentAttributesInclude,
          //       through: {
          //         attributes: [],
          //       },
          //     },
          //   ],
          // },
          // 히스토리가 많이 쌓이므로 페이징 처리 하기위해 별도로 호출 한다.
          // {
          //   model: ZoneInterrupt,
          //   as: 'ZoneInterrupts',
          //   attributes: ZoneInterruptAttributesInclude,
          //   include: [
          //     {
          //       model: User,
          //       as: 'User',
          //       attributes: UserAttributesInclude,
          //     },
          //     {
          //       model: User,
          //       as: 'ConfirmUser',
          //       attributes: UserAttributesInclude,
          //     },
          //   ],
          // },
          // 히스토리가 많이 쌓이므로 페이징 처리 하기위해 별도로 호출 한다.
          // {
          //   model: ZoneMaintenance,
          //   as: 'ZoneMaintenances',
          //   attributes: ZoneMaintenanceAttributesInclude,
          //   include: [
          //     {
          //       model: ZoneMaintenanceHistory,
          //       as: 'ZoneMaintenanceHistories',
          //       attributes: ZoneMaintenanceHistoryAttributesInclude,
          //     },
          //   ],
          // },
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
  selectOne(params: ZoneSelectOneParams): Promise<ZoneAttributes | null> {
    return new Promise((resolve, reject) => {
      Zone.findOne({
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
  update(params: ZoneUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      Zone.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: ZoneDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      Zone.destroy({
        where: { id: params.id },
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
