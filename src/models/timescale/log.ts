import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
// import { logSequelize } from '../sequelize';
import { UserAttributes } from '../common/user';
import { logSequelize } from '../sequelize';

// 기본 interface
export interface LogAttributes {
  id: number;
  itemCode: string | null;
  facilityCode: string | null;
  facilityName: string | null;
  amrCode: string | null;
  amrName: string | null;
  logLevel: LogLevel;
  function: string | null;
  key: string | null;
  data: Record<string, any> | null;
  createdAt: Date;
}

export type LogLevel = 'debug' | 'info' | 'warning' | 'error';
export const logLevels: { [key in LogLevel]: number } = {
  error: 1,
  warning: 2,
  info: 3,
  debug: 4,
};
class Log extends Model implements LogAttributes {
  public readonly id!: LogAttributes['id'];
  public itemCode!: LogAttributes['itemCode'];
  public facilityCode!: LogAttributes['facilityCode'];
  public facilityName!: LogAttributes['facilityName'];
  public amrCode!: LogAttributes['amrCode'];
  public amrName!: LogAttributes['amrName'];
  public logLevel!: LogLevel;
  public function!: LogAttributes['function'];
  public key!: LogAttributes['key'];
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
    itemCode: {
      type: DataTypes.STRING(500),
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
    logLevel: {
      type: DataTypes.STRING(7),
    },
    function: {
      type: DataTypes.STRING(20),
    },
    key: {
      type: DataTypes.STRING(50),
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
  itemCode?: string | null;
  facilityCode: string | null;
  facilityName: string | null;
  amrCode: string | null;
  amrName: string | null;
  logLevel: LogLevel;
  function: LogAttributes['function'];
  key?: LogAttributes['key'];
  data: Record<string, any> | null;
}

// selectList
export interface LogSelectListParams {
  itemCode?: string | null;
  facilityCode?: string | null;
  facilityName?: string | null;
  amrCode?: string | null;
  amrName?: string | null;
  logLevel?: LogLevel;
  function?: LogAttributes['function'];
  key?: string | null;
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
  data?: Record<string, any> | string | null;
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
