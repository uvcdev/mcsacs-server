import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface AlarmAttributes {
  id: number;
  facilityId: number;
  data: JSON | null;
  state: 'registered' | 'confirmed' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Alarm extends Model implements AlarmAttributes {
  public readonly id!: AlarmAttributes['id'];
  public facilityId!: AlarmAttributes['facilityId'];
  public data!: AlarmAttributes['data'];
  public state!: AlarmAttributes['state'];
  public readonly createdAt!: AlarmAttributes['createdAt'];
  public readonly updatedAt!: AlarmAttributes['updatedAt'];
  public readonly deletedAt!: AlarmAttributes['deletedAt'];
}

Alarm.init(
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
export interface AlarmInsertParams {
  facilityId: number;
  data: string | null;
  state: AlarmAttributes['state'] | null;
}

export interface AlarmSelectListParams {
  ids?: Array<number> | null;
  facilityId?: number;
  state?: AlarmAttributes['state'] | null;
  limit?: number;
  offset?: number;
  attributes?: Array<string>;
}

export interface AlarmSelectListQuery {
  where?: WhereOptions<AlarmAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
  attributes?: Array<string>;
}


// selectInfo
export interface AlarmSelectInfoParams {
  id?: number;
}

// update
export interface AlarmUpdateParams {
  id?: AlarmAttributes['id'];
  facilityId?: number;
  data?: JSON | null;
  state?: AlarmAttributes['state'] | null;
}

// delete
export interface AlarmDeleteParams {
  id?: AlarmAttributes['id'];
}

/* 인터페이스 정의 끝 */

export default Alarm;
