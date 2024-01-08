import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface McsAlarmAttributes {
  id: number;
  facilityId: number;
  data: JSON | null;
  state: 'registered' | 'confirmed' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class McsAlarm extends Model implements McsAlarmAttributes {
  public readonly id!: McsAlarmAttributes['id'];
  public facilityId!: McsAlarmAttributes['facilityId'];
  public data!: McsAlarmAttributes['data'];
  public state!: McsAlarmAttributes['state'];
  public readonly createdAt!: McsAlarmAttributes['createdAt'];
  public readonly updatedAt!: McsAlarmAttributes['updatedAt'];
  public readonly deletedAt!: McsAlarmAttributes['deletedAt'];
}

McsAlarm.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    facilityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
    },
    state: {
      type: DataTypes.STRING(10),
    },
  },
  {
    sequelize,
    // tableName: 'tableName', // table명을 수동으로 생성 함
    // freezeTableName: true, // true: table명의 복수형 변환을 막음
    underscored: true, // true: underscored, false: camelCase
    timestamps: true, // createAt, updatedAt
    paranoid: true, // deletedAt
  }
);

/* 인터페이스 정의 시작 */
// insert
export interface McsAlarmInsertParams {
  facilityId: number;
  data: string | null;
  state: McsAlarmAttributes['state'] | null;
}

export interface McsAlarmSelectListParams {
  ids?: Array<number> | null;
  facilityId?: number;
  state?: McsAlarmAttributes['state'] | null;
  limit?: number;
  offset?: number;
  attributes?: Array<string>;
}

export interface McsAlarmSelectListQuery {
  where?: WhereOptions<McsAlarmAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
  attributes?: Array<string>;
}


// selectInfo
export interface McsAlarmSelectInfoParams {
  id?: number;
}

// update
export interface McsAlarmUpdateParams {
  id?: McsAlarmAttributes['id'];
  facilityId?: number;
  data?: JSON | null;
  state?: McsAlarmAttributes['state'] | null;
}

// delete
export interface McsAlarmDeleteParams {
  id?: McsAlarmAttributes['id'];
}

/* 인터페이스 정의 끝 */

export default McsAlarm;
