import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface ItemAttributes {
  id: number;
  code: string;
  type: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class Item extends Model implements ItemAttributes {
  public readonly id!: ItemAttributes['id'];
  public code!: ItemAttributes['code'];
  public type!: ItemAttributes['type'];
  public readonly createdAt!: ItemAttributes['createdAt'];
  public readonly updatedAt!: ItemAttributes['updatedAt'];
  public readonly deletedAt!: ItemAttributes['deletedAt'];
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(255),
      unique: true,
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
export interface ItemInsertParams {
  code: string;
  type: string | null;
}

// selectList
export interface ItemSelectListParams {
  ids?: Array<number> | null;
  code?: string | null;
  type?: string | null;
  limit?: number;
  offset?: number;
  order?: string;
}

export interface ItemSelectListQuery {
  where?: WhereOptions<ItemAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface ItemSelectInfoParams {
  id?: number;
}

// selectOne
export interface ItemSelectOneParams {
  id?: number;
}

// selectOneItem
export interface ItemSelectOneCodeParams {
  code?: string;
}

// update
export interface ItemUpdateParams {
  id?: number;
  code?: string;
  type?: string | null;
}

// delete
export interface ItemDeleteParams {
  id?: number;
}

// include attributes
export const ItemAttributesInclude = [
  'id',
  'code',
  'type',
  'createdAt',
];

export default Item;
