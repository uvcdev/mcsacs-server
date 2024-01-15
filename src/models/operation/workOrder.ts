import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface WorkOrderAttributes {
  id: number;
  fromFacilityId: number | null;
  toFacilityId: number;
  code: string;
  materialId: number;
  level: number | null;
  state: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class WorkOrder extends Model implements WorkOrderAttributes {
  public readonly id!: WorkOrderAttributes['id'];
  public fromFacilityId!: WorkOrderAttributes['fromFacilityId'];
  public toFacilityId!: WorkOrderAttributes['toFacilityId'];
  public code!: WorkOrderAttributes['code'];
  public materialId!: WorkOrderAttributes['materialId'];
  public level!: WorkOrderAttributes['level'];
  public state!: WorkOrderAttributes['state'];
  public description!: WorkOrderAttributes['description'];
  public readonly createdAt!: WorkOrderAttributes['createdAt'];
  public readonly updatedAt!: WorkOrderAttributes['updatedAt'];
  public readonly deletedAt!: WorkOrderAttributes['deletedAt'];
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fromFacilityId: {
      type: DataTypes.INTEGER,
    },
    toFacilityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.STRING(20),
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
export interface WorkOrderInsertParams {
  fromFacilityId: number | null;
  toFacilityId: number;
  code: string;
  materialId: number;
  level: number | null;
  state: string | null;
  description: string | null;
}

// selectList
export interface WorkOrderSelectListParams {
  ids?: Array<number> | null;
  fromFacilityId?: number | null;
  toFacilityId?: number | null;
  code?: string | null;
  materialId?: number | null;
  state?: string | null;
  limit?: number;
  offset?: number;
  order?: string;
}

export interface WorkOrderSelectListQuery {
  where?: WhereOptions<WorkOrderAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface WorkOrderSelectInfoParams {
  id?: number;
}

// selectOne
export interface WorkOrderSelectOneParams {
  id?: number;
}

// selectOneWorkOrder
export interface WorkOrderSelectOneCodeParams {
  code?: string;
}

// update
export interface WorkOrderUpdateParams {
  id?: number;
  fromFacilityId?: number | null;
  toFacilityId?: number;
  code?: string;
  materialId?: number;
  level?: number | null;
  state?: string | null;
  description?: string | null;
}

// delete
export interface WorkOrderDeleteParams {
  id?: number;
}

// include attributes
export const WorkOrderAttributesInclude = [
  'id',
  'fromFacilityid',
  'toFacilityid',
  'code',
  'materialId',
  'level',
  'state',
  'description',
  'createdAt',
];

export default WorkOrder;
