import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CallSpecAttributes {
  id: number;
  floorId: string;
  callType: string;
  callId: string;
  data: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class CallSpec extends Model implements CallSpecAttributes {
  public readonly id!: CallSpecAttributes['id'];
  public floorId!: CallSpecAttributes['floorId'];
  public callType!: CallSpecAttributes['callType'];
  public callId!: CallSpecAttributes['callId'];
  public data!: CallSpecAttributes['data'];
  public readonly createdAt!: CallSpecAttributes['createdAt'];
  public readonly updatedAt!: CallSpecAttributes['updatedAt'];
  public readonly deletedAt!: CallSpecAttributes['deletedAt'];
}

CallSpec.init(
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
    callId: {
      type: DataTypes.STRING(100),
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
// export interface CallSpecInsertParams {
//   floorId: string;
//   callType: string;
//   data: Record<string, any>
// }

// export interface CallSpecSelectListParams {
//   ids?: Array<number> | null;
//   facilityId?: number;
//   state?: CallSpecAttributes['state'] | null;
//   limit?: number;
//   offset?: number;
//   attributes?: Array<string>;
// }

// export interface CallSpecSelectListQuery {
//   where?: WhereOptions<CallSpecAttributes>;
//   limit?: number;
//   offset?: number;
//   order?: Order;
//   attributes?: Array<string>;
// }

// // selectInfo
// export interface CallSpecSelectInfoParams {
//   id?: number;
// }

// // update
// export interface CallSpecUpdateParams {
//   id?: CallSpecAttributes['id'];
//   facilityId?: number;
//   data?: JSON | null;
//   state?: CallSpecAttributes['state'] | null;
// }

// // delete
// export interface CallSpecDeleteParams {
//   id?: CallSpecAttributes['id'];
// }

/* 인터페이스 정의 끝 */

export default CallSpec;
