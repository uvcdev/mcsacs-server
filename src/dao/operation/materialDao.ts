import { Op, Transaction } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  SelectedAllResult,
  UpdatedResult,
  DeletedResult,
  getOrderby,
} from '../../lib/resUtil';
import Material, {
  MaterialAttributes,
  MaterialInsertParams,
  MaterialSelectListParams,
  MaterialSelectListQuery,
  // MaterialSelectAllParams,
  // MaterialSelectAllQuery,
  MaterialSelectInfoParams,
  MaterialSelectOneParams,
  MaterialUpdateParams,
  // MaterialUpdateLiveStateParams,
  // MaterialUpdateRunningStateParams,
  MaterialDeleteParams,
} from '../../models/operation/material';
import CommonCode, { CommonCodeAttributesInclude } from '../../models/common/commonCode';
import User, { UserAttributesInclude } from '../../models/common/user';
// import MaterialInterrupt, { MaterialInterruptAttributesInclude } from '../../models/operation/materialInterrupt';
// import MaterialMaintenance, { MaterialMaintenanceAttributesInclude } from '../../models/operation/materialMaintenance';
// import MaterialMaintenanceHistory, {
//   MaterialMaintenanceHistoryAttributesInclude,
// } from '../../models/operation/materialMaintenanceHistory';

const dao = {
  insert(params: MaterialInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      Material.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: MaterialSelectListParams): Promise<SelectedListResult<MaterialAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: MaterialSelectListQuery = {};
    // 1. where조건 세팅
    if (params.ids) {
      setQuery.where = {
        ...setQuery.where,
        id: params.ids, // 'in' 검색
      };
    }

    if (params.code) {
      setQuery.where = {
        ...setQuery.where,
        code: params.code, // 'in' 검색
      };
    }

    if (params.type) {
      setQuery.where = {
        ...setQuery.where,
        type: params.type, // 'in' 검색
      };
    }
    // }
    // if (params.code) {
    //   setQuery.where = {
    //     ...setQuery.where,
    //     code: { [Op.like]: `%${params.code}%` }, // 'like' 검색
    //   };
    // }
    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    setQuery.order = getOrderby(params.order);

    return new Promise((resolve, reject) => {
      Material.findAndCountAll({
        ...setQuery,
        distinct: true,
        include: [
          // {
          //   model: MaterialGroup,
          //   as: 'MaterialGroup',
          //   attributes: MaterialGroupAttributesInclude,
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
  // selectAll(params: MaterialSelectAllParams): Promise<SelectedAllResult<MaterialAttributes>> {
  //   // DB에 넘길 최종 쿼리 세팅
  //   const setQuery: MaterialSelectAllQuery = {};
  //   // 1. where조건 세팅
  //   if (params.companyIds) {
  //     setQuery.where = {
  //       ...setQuery.where,
  //       companyId: params.companyIds, // 'in' 검색
  //     };
  //   }

  //   return new Promise((resolve, reject) => {
  //     Material.findAll({
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
  selectInfo(params: MaterialSelectInfoParams): Promise<MaterialAttributes | null> {
    return new Promise((resolve, reject) => {
      Material.findByPk(params.id, {
        include: [
          // {
          //   model: MaterialGroup,
          //   as: 'MaterialGroup',
          //   attributes: MaterialGroupAttributesInclude,
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
          //   model: MaterialInterrupt,
          //   as: 'MaterialInterrupts',
          //   attributes: MaterialInterruptAttributesInclude,
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
          //   model: MaterialMaintenance,
          //   as: 'MaterialMaintenances',
          //   attributes: MaterialMaintenanceAttributesInclude,
          //   include: [
          //     {
          //       model: MaterialMaintenanceHistory,
          //       as: 'MaterialMaintenanceHistories',
          //       attributes: MaterialMaintenanceHistoryAttributesInclude,
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
  selectOne(params: MaterialSelectOneParams): Promise<MaterialAttributes | null> {
    return new Promise((resolve, reject) => {
      Material.findOne({
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
  update(params: MaterialUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      Material.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: MaterialDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      Material.destroy({
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
