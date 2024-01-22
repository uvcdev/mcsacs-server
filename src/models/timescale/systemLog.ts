import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { logSequelize } from '../sequelize';
import { UserAttributes } from '../common/user';

// 기본 interface
export interface SystemLogAttributes {
  id: number;
  facilityCode: string | null;
  facilityName: string | null;
  send: 'mcs' | 'wcs' | 'eqp' | 'acs';
  recv: 'mcs' | 'wcs' | 'eqp' | 'acs';
  type: 'debug' | 'warning' | 'info';
  request: Record<string, any> | null;
  response: Record<string, any> | null;
  createdAt: Date;
}

class SystemLog extends Model implements SystemLogAttributes {
  public readonly id!: SystemLogAttributes['id'];
  public facilityCode!: SystemLogAttributes['facilityCode'];
  public facilityName!: SystemLogAttributes['facilityName'];
  public send!: SystemLogAttributes['send'];
  public recv!: SystemLogAttributes['recv'];
  public type!: SystemLogAttributes['type'];
  public request!: SystemLogAttributes['request'];
  public response!: SystemLogAttributes['response'];
  public readonly createdAt!: SystemLogAttributes['createdAt'];
}

SystemLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      primaryKey: true,
    },
    facilityCode: {
      type: DataTypes.STRING(50),
    },
    facilityName: {
      type: DataTypes.STRING(50),
    },
    send: {
      type: DataTypes.STRING(10),
    },
    recv: {
      type: DataTypes.STRING(10),
    },
    type: {
      type: DataTypes.STRING(7),
    },
    request: {
      type: DataTypes.JSONB,
    },
    Response: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize: logSequelize,
    // tableName: 'tableName', // table명을 수동으로 생성 함
    // freezeTableName: true, // true: table명의 복수형 변환을 막음
    underscored: true, // true: underscored, false: camelCase
    timestamps: true,
    createdAt: true, // createAt
    updatedAt: false,
    paranoid: false, // deletedAt
  }
);

// insert
export interface SystemLogInsertParams {
  facilityCode: string | null;
  facilityName: string | null;
  send: SystemLogAttributes['send'];
  recv: SystemLogAttributes['recv'];
  type: SystemLogAttributes['type'];
  request: Record<string, any> | null;
  response: Record<string, any> | null;
}

// selectList
export interface SystemLogSelectListParams {
  facilityCode?: string | null;
  facilityName?: string | null;
  send?: SystemLogAttributes['send'];
  recv?: SystemLogAttributes['recv'];
  type?: SystemLogAttributes['type'];
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
  limit?: number;
  offset?: number;
  order?: string;
}
export interface SystemLogSelectListQuery {
  where?: WhereOptions<SystemLogAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}
export interface SystemLogSelectListSubQueryUser {
  where?: WhereOptions<UserAttributes>;
}

// selectInfo
export interface SystemLogSelectInfoParams {
  id?: number;
}

export default SystemLog;
