import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface SettingAttribute {
  id: number;
  system: string;
  type: string;
  data: JSON | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Setting extends Model implements SettingAttribute {
  public readonly id!: SettingAttribute['id'];
  public system!: SettingAttribute['system'];
  public type!: SettingAttribute['type'];
  public data!: SettingAttribute['data'];
  public readonly createdAt!: SettingAttribute['createdAt'];
  public readonly updatedAt!: SettingAttribute['updatedAt'];
  public readonly deletedAt!: SettingAttribute['deletedAt'];
}

export const SystemDefaults = {
  system: 'WCS',
};

Setting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    system: {
      type: DataTypes.STRING(5),
      defaultValue: SystemDefaults.system,
    },
    type: {
      type: DataTypes.STRING(20),
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
// insert
export interface SettingInsertParams {
  system: string;
  type: string;
  data: string | null;
}

export interface SettingSelectListParams {
  ids?: Array<number> | null;
  system?: string;
  type?: string;
  limit?: number;
  offset?: number;
  attributes?: Array<string>;
}

export interface SettingSelectListQuery {
  where?: WhereOptions<SettingAttribute>;
  limit?: number;
  offset?: number;
  order?: Order;
  attributes?: Array<string>;
}


// selectInfo
export interface SettingSelectInfoParams {
  id?: number;
}

// update
export interface SettingUpdateParams {
  id?: SettingAttribute['id'];
  system?: string;
  type?: string;
  data?: JSON | null;
}

// delete
export interface SettingDeleteParams {
  id?: SettingAttribute['id'];
}

/* 인터페이스 정의 끝 */

export default Setting;
