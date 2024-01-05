import { Model, DataTypes, WhereOptions, Order, JSON } from 'sequelize';
import { sequelize } from '../sequelize';

export interface DailyStatisticAttribute {
  id: number;
  type: string | null;
  data: JSON | null;
  year: number | null;
  month: number | null;
  day: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class DailyStatistic extends Model implements DailyStatisticAttribute {
  public readonly id!: DailyStatisticAttribute['id'];
  public type!: DailyStatisticAttribute['type'];
  public data!: DailyStatisticAttribute['data'];
  public year!: DailyStatisticAttribute['year'];
  public month!: DailyStatisticAttribute['month'];
  public day!: DailyStatisticAttribute['day'];
  public readonly createdAt!: DailyStatisticAttribute['createdAt'];
  public readonly updatedAt!: DailyStatisticAttribute['updatedAt'];
  public readonly deletedAt!: DailyStatisticAttribute['deletedAt'];
}

DailyStatistic.init(
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
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
export interface DailyStatisticInsertParams {
  data: string | null;
}

export interface DailyStatisticSelectListParams {
  ids?: Array<number> | null;
  limit?: number;
  offset?: number;
  attributes?: Array<string>;
}

export interface DailyStatisticSelectListQuery {
  where?: WhereOptions<DailyStatisticAttribute>;
  limit?: number;
  offset?: number;
  order?: Order;
  attributes?: Array<string>;
}

// update
export interface DailyStatisticUpdateParams {
  id?: DailyStatisticAttribute['id'];
  data?: JSON | null;
}

// delete
export interface DailyStatisticDeleteParams {
  id?: DailyStatisticAttribute['id'];
}

/* 인터페이스 정의 끝 */

export default DailyStatistic;
