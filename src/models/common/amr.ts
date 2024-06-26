import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import sequelize from '../sequelize';

// 기본 interface
export interface AmrAttributes {
  id: number;
  code: string;
  name: string | null;
  serial: string | null;
  state: string | null;
  active: boolean | null;
  mode: 'auto' | 'manual' | 'autoPending' | 'manualPending';
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
class Amr extends Model implements AmrAttributes {
  public readonly id!: AmrAttributes['id'];
  public code!: AmrAttributes['code'];
  public name!: AmrAttributes['name'];
  public serial!: AmrAttributes['serial'];
  public state!: AmrAttributes['state'];
  public active!: AmrAttributes['active'];
  public mode!: AmrAttributes['mode'];
  public description!: AmrAttributes['description'];
  public readonly createdAt!: AmrAttributes['createdAt'];
  public readonly updatedAt!: AmrAttributes['updatedAt'];
  public readonly deletedAt!: AmrAttributes['deletedAt'];
}

Amr.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // unique: true,
    },
    serial: {
      type: DataTypes.STRING(255),
    },
    state: {
      type: DataTypes.STRING(20),
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mode: {
      type: DataTypes.STRING(15),
      defaultValue: 'auto',
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
export interface AmrInsertParams {
  code: AmrAttributes['code'];
  name: AmrAttributes['name'];
  serial: AmrAttributes['serial'];
  state: AmrAttributes['state'];
  active: AmrAttributes['active'];
  mode: AmrAttributes['mode'];
  description: AmrAttributes['description'];
}

// selectList
export interface AmrSelectListParams {
  code?: string;
  name?: string;
  serial?: string | null;
  state?: string | null;
  active?: boolean | null;
  mode?: string | null;
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
  limit?: number;
  offset?: number;
  order?: string;
}

export interface AmrSelectListQuery {
  where?: WhereOptions<AmrAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface AmrSelectInfoParams {
  id?: number;
}
// selectInfo
export interface AmrSelectOneByCodeParams {
  code?: string;
}

// update
export interface AmrUpdateParams {
  id?: number;
  code?: AmrAttributes['code'];
  name?: AmrAttributes['name'];
  serial?: AmrAttributes['serial'];
  state?: AmrAttributes['state'];
  active?: AmrAttributes['active'];
  mode?: AmrAttributes['mode'];
  description?: AmrAttributes['description'];
}

// upsert
export interface AmrUpsertParams {
  id?: number;
  code?: string;
  name?: string;
  serial?: string;
  state?: string;
  active?: boolean;
  mode?: string;
  description?: string;
}

// delete
export interface AmrDeleteParams {
  id?: number;
}

// include attributes
export const AmrAttributesInclude = [
  'id',
  'name',
  'code',
  'serial',
  'state',
  'active',
  'mode',
  'description',
  'createdAt',
];

export default Amr;
