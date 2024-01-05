import { InsertedResult, SelectedListResult, UpdatedResult, DeletedResult } from '../../lib/resUtil';
import DailyStatistic, {
  DailyStatisticInsertParams,
  DailyStatisticSelectListParams,
  DailyStatisticSelectListQuery,
  DailyStatisticUpdateParams,
  DailyStatisticDeleteParams,
  DailyStatisticAttribute,
} from '../../models/dashboard/dailyStatistic';

const dao = {
  insert(params: DailyStatisticInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      DailyStatistic.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: DailyStatisticSelectListParams): Promise<SelectedListResult<DailyStatisticAttribute>> {
    const setQuery: DailyStatisticSelectListQuery = {};

    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    setQuery.order = [['id', 'DESC']];
    setQuery.attributes = params.attributes;

    if (params.ids) {
      setQuery.where = {
        ...setQuery.where,
        id: params.ids, // 'in'검색,
      };
    }

    return new Promise((resolve, reject) => {
      DailyStatistic.findAndCountAll({
        ...setQuery,
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
  update(params: DailyStatisticUpdateParams): Promise<UpdatedResult> {
    return new Promise((resolve, reject) => {
      DailyStatistic.update(params, { where: { id: params.id } })
        .then(([updated]) => {
          resolve({ updatedCount: updated });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(params: DailyStatisticDeleteParams): Promise<DeletedResult> {
    return new Promise((resolve, reject) => {
      DailyStatistic.destroy({
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
