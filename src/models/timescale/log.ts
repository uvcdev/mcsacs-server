import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { logSequelize } from '../sequelize';
import { UserAttributes } from '../common/user';

// 기본 interface
export interface LogAttributes {
  id: number;
  facilityCode: string | null;
  facilityName: string | null;
  amrCode: string | null;
  amrName: string | null;
  system: 'mcs' | 'wcs' | 'eqp' | 'acs';
  type: 'debug' | 'warning' | 'info';
  data: Record<string, any> | null;
  createdAt: Date;
}

class Log extends Model implements LogAttributes {
  public readonly id!: LogAttributes['id'];
  public facilityCode!: LogAttributes['facilityCode'];
  public facilityName!: LogAttributes['facilityName'];
  public amrCode!: LogAttributes['amrCode'];
  public amrName!: LogAttributes['amrName'];
  public system!: LogAttributes['system'];
  public type!: LogAttributes['type'];
  public data!: LogAttributes['data'];
  public readonly createdAt!: LogAttributes['createdAt'];
}

Log.init(
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
    amrCode: {
      type: DataTypes.STRING(50),
    },
    amrName: {
      type: DataTypes.STRING(50),
    },
    system: {
      type: DataTypes.STRING(3),
    },
    type: {
      type: DataTypes.STRING(7),
    },
    data: {
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
export interface LogInsertParams {
  facilityCode: string | null;
  facilityName: string | null;
  amrCode: string | null;
  amrName: string | null;
  system: LogAttributes['system'];
  type: LogAttributes['type'];
  data: Record<string, any> | null;
}

// selectList
export interface LogSelectListParams {
  facilityCode?: string | null;
  facilityName?: string | null;
  amrCode?: string | null;
  amrName?: string | null;
  system?: LogAttributes['system'];
  type?: LogAttributes['type'];
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
  limit?: number;
  offset?: number;
  order?: string;
}
export interface LogSelectListQuery {
  where?: WhereOptions<LogAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}
export interface LogSelectListSubQueryUser {
  where?: WhereOptions<UserAttributes>;
}

// selectInfo
export interface LogSelectInfoParams {
  id?: number;
}

export default Log;
