import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface FileAttributes {
  id: number;
  title: string;
  path: string;
  type: string | null;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class File extends Model implements FileAttributes {
  public readonly id!: FileAttributes['id'];
  public title!: FileAttributes['title'];
  public path!: FileAttributes['path'];
  public type!: FileAttributes['type'];
  public size!: FileAttributes['size'];
  public readonly createdAt!: FileAttributes['createdAt'];
  public readonly updatedAt!: FileAttributes['updatedAt'];
  public readonly deletedAt!: FileAttributes['deletedAt'];
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(20),
    },
    size: {
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

// insert
export interface FileInsertParams {
  title: string;
  path: string;
  type: string | null;
  size: number | null;
}

// selectInfo
export interface FileSelectInfoParams {
  token?: string;
  id?: number;
}

// include attributes
export const FileAttributesInclude = ['id', 'title', 'path', 'type', 'size', 'createdAt'];

export default File;
