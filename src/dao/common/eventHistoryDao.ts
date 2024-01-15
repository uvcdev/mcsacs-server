import { Op } from 'sequelize';
import { sequelize } from '../../models/sequelize';
import {
  InsertedResult,
  SelectedListResult,
  SelectedAllResult,
  UpdatedResult,
  DeletedResult,
  getOrderby,
} from '../../lib/resUtil';
import EventHistory, {
  EventHistoryAttributes,
  EventHistoryInsertParams,
  EventHistorySelectListParams,
  EventHistorySelectListQuery,
  EventHistorySelectInfoParams,
  EventHistorySelectListSubQueryUser,
  EventHistorySelectAllMinMaxDateParams,
  EventHistorySelectedMinMaxDate,
  EventHistorySelectAllLatestParams,
} from '../../models/common/eventHistory';
import User, { UserAttributesInclude } from '../../models/common/user';

const dao = {
  insert(params: EventHistoryInsertParams): Promise<InsertedResult> {
    return new Promise((resolve, reject) => {
      EventHistory.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectList(params: EventHistorySelectListParams): Promise<SelectedListResult<EventHistoryAttributes>> {
    // DB에 넘길 최종 쿼리 세팅
    const setQuery: EventHistorySelectListQuery = {};
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
    if (params.tableName) {
      setQuery.where = {
        ...setQuery.where,
        tableName: params.tableName, // '=' 검색
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
    const setSubQueryUser: EventHistorySelectListSubQueryUser = {};
    // if (params.companyIds) {
    //   setSubQueryUser.where = {
    //     ...setSubQueryUser.where,
    //     companyId: params.companyIds,
    //   };
    // }
    // 2. limit, offset 세팅
    if (params.limit && params.limit > 0) setQuery.limit = params.limit;
    if (params.offset && params.offset > 0) setQuery.offset = params.offset;
    // 3. orderby 세팅
    setQuery.order = getOrderby(params.order);

    return new Promise((resolve, reject) => {
      EventHistory.findAndCountAll({
        ...setQuery,
        attributes: { exclude: ['requestLog', 'responseLog'] }, // 해당 필드 제외
        distinct: true,
        include: {
          model: User,
          as: 'User',
          attributes: UserAttributesInclude,
          ...setSubQueryUser,
          include: [
          ],
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
  selectInfo(params: EventHistorySelectInfoParams): Promise<EventHistoryAttributes | null> {
    return new Promise((resolve, reject) => {
      EventHistory.findByPk(params.id, {
        include: {
          model: User,
          as: 'User',
          attributes: UserAttributesInclude,
          include: [
          ],
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
  selectAllMinMaxDate(
    params: EventHistorySelectAllMinMaxDateParams
  ): Promise<SelectedAllResult<EventHistorySelectedMinMaxDate>> {
    const queryStr = `
      select 
      u.id, u.name, u.userid, u.active_pin as "activePin", u.active, 
      u.last_login as "lastLogin", u.last_logout as "lastLogout", 
      ev.min_day as "minDay", ev.max_day as "maxDay"
      from users u, 
        (select user_id, min(created_at) as min_day, max(created_at) as max_day
        from event_histories
        where  
        user_id in (select id from users where company_id in (${params.companyIds ? params.companyIds : 0})) and
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.MS') between 
        '${params.createdAtFrom ? params.createdAtFrom : ''}' and 
        '${params.createdAtTo ? params.createdAtTo : ''}'
        group by user_id
        ) ev
      where u.id = ev.user_id
    `;

    return new Promise((resolve, reject) => {
      sequelize
        .query(queryStr)
        .then((selectedList: [unknown[], unknown]) => {
          let rowsData: Array<EventHistorySelectedMinMaxDate> = [];
          if (
            selectedList &&
            selectedList[1] &&
            (selectedList[1] as { rows: Array<EventHistorySelectedMinMaxDate> }).rows
          ) {
            rowsData = (selectedList[1] as { rows: Array<EventHistorySelectedMinMaxDate> }).rows;
          }
          resolve(rowsData);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectAllLatest(params: EventHistorySelectAllLatestParams): Promise<SelectedAllResult<EventHistoryAttributes>> {
    const queryStr = `
      select 
      eh.id, eh.user_id as "userId", 
      u.userid, u.name, eh.action, 
      eh.table_name as "tableName", eh.table_pks as "tablePks", 
      eh.client_ip as "clientIp", eh.created_at as "createdAt"
      from event_histories eh, users u
      where eh.id <= (select max(id)  from event_histories eh2) - (${params.rowCount ? params.rowCount : 10} * (${params.page ? params.page - 1 : 0
      }))
      and eh.id > (select max(id)  from event_histories eh2) - ${params.rowCount ? params.rowCount : 10} - (${params.rowCount ? params.rowCount : 10
      } * (${params.page ? params.page - 1 : 0}))
      and eh.user_id = u.id
      order by eh.id desc;
    `;

    return new Promise((resolve, reject) => {
      sequelize
        .query(queryStr)
        .then((selectedList: [unknown[], unknown]) => {
          let rowsData: Array<EventHistoryAttributes> = [];
          if (selectedList && selectedList[1] && (selectedList[1] as { rows: Array<EventHistoryAttributes> }).rows) {
            rowsData = (selectedList[1] as { rows: Array<EventHistoryAttributes> }).rows;
          }
          resolve(rowsData);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export { dao };
