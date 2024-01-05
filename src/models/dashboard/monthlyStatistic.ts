import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface MonthlyStatisticAttribute {
  id: number;
  type: string | null;
  data: JSON | null;
  year: number | null;
  month: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class MonthlyStatistic extends Model implements MonthlyStatisticAttribute {
  public readonly id!: MonthlyStatisticAttribute['id'];
  public type!: MonthlyStatisticAttribute['type'];
  public data!: MonthlyStatisticAttribute['data'];
  public year!: MonthlyStatisticAttribute['year'];
  public month!: MonthlyStatisticAttribute['month'];
  public readonly createdAt!: MonthlyStatisticAttribute['createdAt'];
  public readonly updatedAt!: MonthlyStatisticAttribute['updatedAt'];
  public readonly deletedAt!: MonthlyStatisticAttribute['deletedAt'];
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
  where?: WhereOptions<MonthlyStatisticAttribute>;
  limit?: number;
  offset?: number;
  order?: Order;
  attributes?: Array<string>;
}

// update
export interface MonthlyStatisticUpdateParams {
  id?: MonthlyStatisticAttribute['id'];
  data?: JSON | null;
}

// delete
export interface MonthlyStatisticDeleteParams {
  id?: MonthlyStatisticAttribute['id'];
}


/* 인터페이스 정의 끝 */

export default MonthlyStatistic;
