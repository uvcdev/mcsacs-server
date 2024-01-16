import { Op, Transaction } from 'sequelize';
import {
  InsertedResult,
  SelectedListResult,
  SelectedAllResult,
  UpdatedResult,
  DeletedResult,
  getOrderby,
} from '../../lib/resUtil';
import Item, {
  ItemAttributes,
  ItemInsertParams,
  ItemSelectListParams,
  ItemSelectListQuery,
  // ItemSelectAllParams,
  // ItemSelectAllQuery,
  ItemSelectInfoParams,
  ItemSelectOneParams,
  ItemUpdateParams,
  // ItemUpdateLiveStateParams,
  // ItemUpdateRunningStateParams,
  ItemDeleteParams,
} from '../../models/operation/item';
import CommonCode, { CommonCodeAttributesInclude } from '../../models/common/commonCode';
import User, { UserAttributesInclude } from '../../models/common/user';
// import ItemInterrupt, { ItemInterruptAttributesInclude } from '../../models/operation/itemInterrupt';
// import ItemMaintenance, { ItemMaintenanceAttributesInclude } from '../../models/operation/itemMaintenance';
// import ItemMaintenanceHistory, {
//   ItemMaintenanceHistoryAttributesInclude,
// } from '../../models/operation/itemMaintenanceHistory';

const dao = {
  insert(params: ItemInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      Item.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: ItemSelectListParams): Promise<SelectedListResult<ItemAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: ItemSelectListQuery = {};
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
      Item.findAndCountAll({
        ...setQuery,
        distinct: true,
        include: [
          // {
          //   model: ItemGroup,
          //   as: 'ItemGroup',
          //   attributes: ItemGroupAttributesInclude,
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
  // selectAll(params: ItemSelectAllParams): Promise<SelectedAllResult<ItemAttributes>> {
  //   // DB에 넘길 최종 쿼리 세팅
  //   const setQuery: ItemSelectAllQuery = {};
  //   // 1. where조건 세팅
  //   if (params.companyIds) {
  //     setQuery.where = {
  //       ...setQuery.where,
  //       companyId: params.companyIds, // 'in' 검색
  //     };
  //   }

  //   return new Promise((resolve, reject) => {
  //     Item.findAll({
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
  selectInfo(params: ItemSelectInfoParams): Promise<ItemAttributes | null> {
    return new Promise((resolve, reject) => {
      Item.findByPk(params.id, {
        include: [
          // {
          //   model: ItemGroup,
          //   as: 'ItemGroup',
          //   attributes: ItemGroupAttributesInclude,
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
          //   model: ItemInterrupt,
          //   as: 'ItemInterrupts',
          //   attributes: ItemInterruptAttributesInclude,
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
          //   model: ItemMaintenance,
          //   as: 'ItemMaintenances',
          //   attributes: ItemMaintenanceAttributesInclude,
          //   include: [
          //     {
          //       model: ItemMaintenanceHistory,
          //       as: 'ItemMaintenanceHistories',
          //       attributes: ItemMaintenanceHistoryAttributesInclude,
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
  selectOne(params: ItemSelectOneParams): Promise<ItemAttributes | null> {
    return new Promise((resolve, reject) => {
      Item.findOne({
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
  update(params: ItemUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      Item.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: ItemDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      Item.destroy({
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
