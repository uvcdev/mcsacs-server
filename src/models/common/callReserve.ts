import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CallReserveAttributes {
  id: number;
  floorId: string;
  callType: string;
  data: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class CallReserve extends Model implements CallReserveAttributes {
  public readonly id!: CallReserveAttributes['id'];
  public floorId!: CallReserveAttributes['floorId'];
  public callType!: CallReserveAttributes['callType'];
  public data!: CallReserveAttributes['data'];
  public readonly createdAt!: CallReserveAttributes['createdAt'];
  public readonly updatedAt!: CallReserveAttributes['updatedAt'];
  public readonly deletedAt!: CallReserveAttributes['deletedAt'];
}

CallReserve.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    floorId: {
      type: DataTypes.STRING(50),
    },
    callType: {
      type: DataTypes.STRING(50),
    },
    data: {
      type: DataTypes.JSONB,
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
// // insert
// export interface CallReserveInsertParams {
//   floorId: string;
//   callType: string;
//   data: Record<string, any>
// }

// export interface CallReserveSelectListParams {
//   ids?: Array<number> | null;
//   facilityId?: number;
//   state?: CallReserveAttributes['state'] | null;
//   limit?: number;
//   offset?: number;
//   attributes?: Array<string>;
// }

// export interface CallReserveSelectListQuery {
//   where?: WhereOptions<CallReserveAttributes>;
//   limit?: number;
//   offset?: number;
//   order?: Order;
//   attributes?: Array<string>;
// }

// // selectInfo
// export interface CallReserveSelectInfoParams {
//   id?: number;
// }

// // update
// export interface CallReserveUpdateParams {
//   id?: CallReserveAttributes['id'];
//   facilityId?: number;
//   data?: JSON | null;
//   state?: CallReserveAttributes['state'] | null;
// }

// // delete
// export interface CallReserveDeleteParams {
//   id?: CallReserveAttributes['id'];
// }

/* 인터페이스 정의 끝 */

export default CallReserve;
