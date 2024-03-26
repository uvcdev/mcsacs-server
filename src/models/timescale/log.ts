import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
// import { logSequelize } from '../sequelize';
import { UserAttributes } from '../common/user';
import { logSequelize } from '../sequelize';

// 기본 interface
export interface LogAttributes {
  id: number;
  facilityCode: string | null;
  facilityName: string | null;
  amrCode: string | null;
  amrName: string | null;
  type: type;
  system: 'WCS' | 'EQP';
  function: string | null;
  data: Record<string, any> | null;
  createdAt: Date;
}

export type type = 'debug' | 'info' | 'warning' | 'error';
export const logLevels: { [key in type]: number } = {
  error: 1,
  warning: 2,
  info: 3,
  debug: 4,
};
class Log extends Model implements LogAttributes {
  public readonly id!: LogAttributes['id'];
  public facilityCode!: LogAttributes['facilityCode'];
  public facilityName!: LogAttributes['facilityName'];
  public amrCode!: LogAttributes['amrCode'];
  public amrName!: LogAttributes['amrName'];
  public type!: type;
  public system!: LogAttributes['system'];
  public function!: LogAttributes['function'];
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
    type: {
      type: DataTypes.STRING(7),
    },
    function: {
      type: DataTypes.STRING(20),
    },
    data: {
      type: DataTypes.JSONB,
    },
    system: {
      type: DataTypes.STRING(3),
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
  type: type;
  function: LogAttributes['function'];
  system: LogAttributes['system'] | null;
  data: Record<string, any> | null;
}

// selectList
export interface LogSelectListParams {
  facilityCode?: string | null;
  facilityName?: string | null;
  amrCode?: string | null;
  amrName?: string | null;
  type?: type | null;
  system?: LogAttributes['system'] | null;
  function?: LogAttributes['function'];
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
