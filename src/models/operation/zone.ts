import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface ZoneAttributes {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Zone extends Model implements ZoneAttributes {
  public readonly id!: ZoneAttributes['id'];
  public name!: ZoneAttributes['name'];
  public description!: ZoneAttributes['description'];
  public readonly createdAt!: ZoneAttributes['createdAt'];
  public readonly updatedAt!: ZoneAttributes['updatedAt'];
  public readonly deletedAt!: ZoneAttributes['deletedAt'];
}

Zone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
export interface ZoneInsertParams {
  name: string;
  description: string | null;
}

// selectList
export interface ZoneSelectListParams {
  ids?: Array<number> | null;
  name?: string | null;
  limit?: number;
  offset?: number;
  order?: string;
}

export interface ZoneSelectListQuery {
  where?: WhereOptions<ZoneAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface ZoneSelectInfoParams {
  id?: number;
}

// selectOne
export interface ZoneSelectOneParams {
  id?: number;
}

// update
export interface ZoneUpdateParams {
  id?: number;
  name?: string;
  description?: string | null;
}

// delete
export interface ZoneDeleteParams {
  id?: number;
}

// include attributes
export const ZoneAttributesInclude = [
  'id',
  'name',
  'description',
  'createdAt',
];

export default Zone;
