import { Op, Transaction } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  SelectedAllResult,
  UpdatedResult,
  DeletedResult,
  getOrderby,
} from '../../lib/resUtil';
import FacilityGroup, {
  FacilityGroupAttributes,
  FacilityGroupInsertParams,
  FacilityGroupSelectListParams,
  FacilityGroupSelectListQuery,
  // FacilityGroupSelectAllParams,
  // FacilityGroupSelectAllQuery,
  FacilityGroupSelectInfoParams,
  FacilityGroupSelectOneParams,
  FacilityGroupSelectOneCodeParams,
  FacilityGroupUpdateParams,
  // FacilityGroupUpdateLiveStateParams,
  // FacilityGroupUpdateRunningStateParams,
  FacilityGroupDeleteParams,
} from '../../models/operation/facilityGroup';
import CommonCode, { CommonCodeAttributesInclude } from '../../models/common/commonCode';
import User, { UserAttributesInclude } from '../../models/common/user';
// import FacilityGroupInterrupt, { FacilityGroupInterruptAttributesInclude } from '../../models/operation/facilityGroupInterrupt';
// import FacilityGroupMaintenance, { FacilityGroupMaintenanceAttributesInclude } from '../../models/operation/facilityGroupMaintenance';
// import FacilityGroupMaintenanceHistory, {
//   FacilityGroupMaintenanceHistoryAttributesInclude,
// } from '../../models/operation/facilityGroupMaintenanceHistory';

const dao = {
  insert(params: FacilityGroupInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      FacilityGroup.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: FacilityGroupSelectListParams): Promise<SelectedListResult<FacilityGroupAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: FacilityGroupSelectListQuery = {};
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
      FacilityGroup.findAndCountAll({
        ...setQuery,
        distinct: true,
        include: [
          // {
          //   model: FacilityGroupGroup,
          //   as: 'FacilityGroupGroup',
          //   attributes: FacilityGroupGroupAttributesInclude,
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
  // selectAll(params: FacilityGroupSelectAllParams): Promise<SelectedAllResult<FacilityGroupAttributes>> {
  //   // DB에 넘길 최종 쿼리 세팅
  //   const setQuery: FacilityGroupSelectAllQuery = {};
  //   // 1. where조건 세팅
  //   if (params.companyIds) {
  //     setQuery.where = {
  //       ...setQuery.where,
  //       companyId: params.companyIds, // 'in' 검색
  //     };
  //   }

  //   return new Promise((resolve, reject) => {
  //     FacilityGroup.findAll({
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
  selectInfo(params: FacilityGroupSelectInfoParams): Promise<FacilityGroupAttributes | null> {
    return new Promise((resolve, reject) => {
      FacilityGroup.findByPk(params.id, {
        include: [
          // {
          //   model: FacilityGroupGroup,
          //   as: 'FacilityGroupGroup',
          //   attributes: FacilityGroupGroupAttributesInclude,
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
          //   model: FacilityGroupInterrupt,
          //   as: 'FacilityGroupInterrupts',
          //   attributes: FacilityGroupInterruptAttributesInclude,
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
          //   model: FacilityGroupMaintenance,
          //   as: 'FacilityGroupMaintenances',
          //   attributes: FacilityGroupMaintenanceAttributesInclude,
          //   include: [
          //     {
          //       model: FacilityGroupMaintenanceHistory,
          //       as: 'FacilityGroupMaintenanceHistories',
          //       attributes: FacilityGroupMaintenanceHistoryAttributesInclude,
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
  selectOne(params: FacilityGroupSelectOneParams): Promise<FacilityGroupAttributes | null> {
    return new Promise((resolve, reject) => {
      FacilityGroup.findOne({
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
  selectOneCode(params: FacilityGroupSelectOneCodeParams): Promise<FacilityGroupAttributes | null> {
    return new Promise((resolve, reject) => {
      FacilityGroup.findOne({
        where: { code: params.code },
        attributes: { exclude: ['description'] }, // 해당 필드 제외
      })
        .then((selectedOne) => {
          resolve(selectedOne);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectAllTags(): Promise<SelectedAllResult<FacilityGroupAttributes>> {
    return new Promise((resolve, reject) => {
      FacilityGroup.findAll({
        where: {
          tags: { [Op.not]: null },
        },
        attributes: ['id', 'tags'],
      })
        .then((selectedAll) => {
          resolve(selectedAll);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  update(params: FacilityGroupUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      FacilityGroup.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: FacilityGroupDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      FacilityGroup.destroy({
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
