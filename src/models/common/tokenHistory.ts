import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';
import { UserAttributes } from './user';

// 기본 interface
export interface TokenHistoryAttributes {
  id: number;
  userId: number | null;
  action: 'Created' | 'CreatedPin' | 'Destroyed';
  accessToken: string | null;
  accessExpire: Date | null;
  clientIp: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class TokenHistory extends Model implements TokenHistoryAttributes {
  public readonly id!: TokenHistoryAttributes['id'];
  public userId!: TokenHistoryAttributes['userId'];
  public action!: TokenHistoryAttributes['action'];
  public accessToken!: TokenHistoryAttributes['accessToken'];
  public accessExpire!: TokenHistoryAttributes['accessExpire'];
  public clientIp!: TokenHistoryAttributes['clientIp'];
  public readonly createdAt!: TokenHistoryAttributes['createdAt'];
  public readonly updatedAt!: TokenHistoryAttributes['updatedAt'];
  public readonly deletedAt!: TokenHistoryAttributes['deletedAt'];
}

TokenHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    action: {
      type: DataTypes.STRING(30),
    },
    accessToken: {
      type: DataTypes.STRING(500),
    },
    accessExpire: {
      type: DataTypes.DATE,
    },
    clientIp: {
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
export interface TokenHistoryInsertParams {
  userId: number | null;
  action: TokenHistoryAttributes['action'];
  accessToken: string;
  accessExpire: Date | null;
  clientIp: string | null;
}

// selectList
export interface TokenHistorySelectListParams {
  companyIds?: Array<number> | null;
  userIds?: Array<number> | null;
  action?: TokenHistoryAttributes['action'];
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
  limit?: number;
  offset?: number;
  order?: string;
}
export interface TokenHistorySelectListQuery {
  where?: WhereOptions<TokenHistoryAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}
export interface TokenHistorySelectListSubQueryUser {
  where?: WhereOptions<UserAttributes>;
}

// 사용자 로그인+활동 현황
export interface TokenHistorySelectAllUsersParams {
  companyIds?: Array<number> | null;
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
}

// selectInfo
export interface TokenHistorySelectInfoParams {
  id?: number;
}

export default TokenHistory;
