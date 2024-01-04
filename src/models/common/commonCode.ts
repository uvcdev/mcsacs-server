import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface

export interface CommonCodeAttributes {
  id: number;
  code: string;
  name: string;
  masterCode: string;
  level: number;
  type: string;
  orderby: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class CommonCode extends Model implements CommonCodeAttributes {
  public readonly id!: CommonCodeAttributes['id'];
  public code!: CommonCodeAttributes['code'];
  public name!: CommonCodeAttributes['name'];
  public masterCode!: CommonCodeAttributes['masterCode'];
  public level!: CommonCodeAttributes['level'];
  public type!: CommonCodeAttributes['type'];
  public orderby!: CommonCodeAttributes['orderby'];
  public description!: CommonCodeAttributes['description'];
  public readonly createdAt!: CommonCodeAttributes['createdAt'];
  public readonly updatedAt!: CommonCodeAttributes['updatedAt'];
  public readonly deletedAt!: CommonCodeAttributes['deletedAt'];
}

export const CommonCodeDefaults = {
  level: 0,
  type: 'company',
  orderby: 0,
};

CommonCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    masterCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: CommonCodeDefaults.level,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: CommonCodeDefaults.type,
    },
    orderby: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: CommonCodeDefaults.orderby,
    },
    description: {
      type: DataTypes.TEXT,
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

// insert
export interface CommonCodeInsertParams {
  code: string;
  name: string;
  masterCode: string;
  level: number;
  type: string;
  orderby: number;
  description: string | null;
}

// selectList
export interface CommonCodeSelectListParams {
  code?: string;
  name?: string;
  masterCode?: string;
  level?: number;
  type?: string;
  limit?: number;
  offset?: number;
}
export interface CommonCodeSelectListQuery {
  where?: WhereOptions<CommonCodeAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface CommonCodeSelectInfoParams {
  id?: number;
}

// selectOne
export interface CommonCodeSelectOneParams {
  code: string;
}

// selectAllCode
export interface CommonCodeSelectAllCodeParams {
  codes: Array<string>;
}

// update
export interface CommonCodeUpdateParams {
  id?: number;
  name?: string;
  orderby?: number;
  description?: string | null;
  masterCode?: string;
  orderbyList?: Array<{ id: number; orderby: number; level: number; code: string; masterCode: string }>;
}

// delete
export interface CommonCodeDeleteParams {
  id?: number;
}

// include attributes
export const CommonCodeAttributesInclude = ['id', 'name', 'code', 'masterCode', 'createdAt'];

export default CommonCode;
