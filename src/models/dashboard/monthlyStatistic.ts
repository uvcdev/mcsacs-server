import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface MonthlyStatisticAttributes {
  id: number;
  type: string | null;
  data: JSON | null;
  year: number | null;
  month: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class MonthlyStatistic extends Model implements MonthlyStatisticAttributes {
  public readonly id!: MonthlyStatisticAttributes['id'];
  public type!: MonthlyStatisticAttributes['type'];
  public data!: MonthlyStatisticAttributes['data'];
  public year!: MonthlyStatisticAttributes['year'];
  public month!: MonthlyStatisticAttributes['month'];
  public readonly createdAt!: MonthlyStatisticAttributes['createdAt'];
  public readonly updatedAt!: MonthlyStatisticAttributes['updatedAt'];
  public readonly deletedAt!: MonthlyStatisticAttributes['deletedAt'];
}

MonthlyStatistic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(50),
    },
    data: {
      type: DataTypes.JSONB,
    },
    year: {
      type: DataTypes.INTEGER,
    },
    month: {
      type: DataTypes.INTEGER,
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
export interface MonthlyStatisticInsertParams {
  data: string | null;
}

export interface MonthlyStatisticSelectListParams {
  ids?: Array<number> | null;
  limit?: number;
  offset?: number;
  attributes?: Array<string>;
}

export interface MonthlyStatisticSelectListQuery {
  where?: WhereOptions<MonthlyStatisticAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
  attributes?: Array<string>;
}

// update
export interface MonthlyStatisticUpdateParams {
  id?: MonthlyStatisticAttributes['id'];
  data?: JSON | null;
}

// delete
export interface MonthlyStatisticDeleteParams {
  id?: MonthlyStatisticAttributes['id'];
}


/* 인터페이스 정의 끝 */

export default MonthlyStatistic;
