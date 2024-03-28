import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface FacilityGroupAttributes {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class FacilityGroup extends Model implements FacilityGroupAttributes {
  public readonly id!: FacilityGroupAttributes['id'];
  public code!: FacilityGroupAttributes['code'];
  public name!: FacilityGroupAttributes['name'];
  public description!: FacilityGroupAttributes['description'];
  public readonly createdAt!: FacilityGroupAttributes['createdAt'];
  public readonly updatedAt!: FacilityGroupAttributes['updatedAt'];
  public readonly deletedAt!: FacilityGroupAttributes['deletedAt'];
}

FacilityGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'unique_code',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
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
export interface FacilityGroupInsertParams {
  code: string;
  name: string;
  description: string | null;
}

// selectList
export interface FacilityGroupSelectListParams {
  ids?: Array<number> | null;
  code?: string | null;
  name?: string | null;
  uniqueName?: string | null;
  limit?: number;
  offset?: number;
  order?: string;
}

export interface FacilityGroupSelectListQuery {
  where?: WhereOptions<FacilityGroupAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface FacilityGroupSelectInfoParams {
  id?: number;
}

// selectOne
export interface FacilityGroupSelectOneParams {
  id?: number;
}

// update
export interface FacilityGroupUpdateParams {
  id?: number;
  code?: string;
  name?: string;
  description?: string | null;
}

// delete
export interface FacilityGroupDeleteParams {
  id?: number;
}

// include attributes
export const FacilityGroupAttributesInclude = ['id', 'code', 'name', 'description', 'createdAt'];

export default FacilityGroup;
