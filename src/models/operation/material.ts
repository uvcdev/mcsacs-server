import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface MaterialAttributes {
  id: number;
  code: string;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Material extends Model implements MaterialAttributes {
  public readonly id!: MaterialAttributes['id'];
  public code!: MaterialAttributes['code'];
  public type!: MaterialAttributes['type'];
  public readonly createdAt!: MaterialAttributes['createdAt'];
  public readonly updatedAt!: MaterialAttributes['updatedAt'];
  public readonly deletedAt!: MaterialAttributes['deletedAt'];
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
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
export interface MaterialInsertParams {
  code: string;
  type: string | null;
}

// selectList
export interface MaterialSelectListParams {
  ids?: Array<number> | null;
  code?: string | null;
  type?: string | null;
  limit?: number;
  offset?: number;
  order?: string;
}

export interface MaterialSelectListQuery {
  where?: WhereOptions<MaterialAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface MaterialSelectInfoParams {
  id?: number;
}

// selectOne
export interface MaterialSelectOneParams {
  id?: number;
}

// selectOneMaterial
export interface MaterialSelectOneCodeParams {
  code?: string;
}

// update
export interface MaterialUpdateParams {
  id?: number;
  code?: string;
  type?: string | null;
}

// delete
export interface MaterialDeleteParams {
  id?: number;
}

// include attributes
export const MaterialAttributesInclude = [
  'id',
  'code',
  'type',
  'createdAt',
];

export default Material;
