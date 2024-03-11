import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface AlarmEmailAttributes {
  id: number;
  email: string;
  name: string;
  userId: number | null;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class AlarmEmail extends Model implements AlarmEmailAttributes {
  public readonly id!: AlarmEmailAttributes['id'];
  public email!: AlarmEmailAttributes['email'];
  public name!: AlarmEmailAttributes['name'];
  public userId!: AlarmEmailAttributes['userId'];
  public description!: AlarmEmailAttributes['description'];
  public active!: AlarmEmailAttributes['active'];
  public readonly createdAt!: AlarmEmailAttributes['createdAt'];
  public readonly updatedAt!: AlarmEmailAttributes['updatedAt'];
  public readonly deletedAt!: AlarmEmailAttributes['deletedAt'];
}

AlarmEmail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
export interface AlarmEmailInsertParams {
  email: string;
  name: string;
  userId: number | null;
  description: string | null;
  active: boolean;
}

// selectList
export interface AlarmEmailSelectListParams {
  ids?: number[] | null;
  email?: string | null;
  name?: string | null;
  userIds?: number[] | null;
  active?: boolean | null;
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
  limit?: number;
  offset?: number;
  order?: string;
}
export interface AlarmEmailSelectListQuery {
  where?: WhereOptions<AlarmEmailAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface AlarmEmailSelectInfoParams {
  id?: number;
}

// selectOne
export interface AlarmEmailSelectOneParams {
  id?: number;
}

// update
export interface AlarmEmailUpdateParams {
  id?: number;
  email?: string;
  name?: string;
  userId?: number | null;
  description?: string;
  active?: boolean;
}

// delete
export interface AlarmEmailDeleteParams {
  id?: number;
}

// include attributes
export const AlarmEmailAttributesInclude = ['id', 'email', 'name', 'userId', 'description', 'active', 'createdAt'];

export default AlarmEmail;
