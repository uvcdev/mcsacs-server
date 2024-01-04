import { Model, DataTypes, WhereOptions, Order } from 'sequelize';
import { sequelize } from '../sequelize';

// 기본 interface
export interface UserAttributes {
  id: number;
  companyId: number | null;
  partnerId: number | null;
  userid: string;
  password: string;
  pin: string | null;
  name: string;
  auth: 'system' | 'admin' | 'staff';
  email: string | null;
  mobile: string | null;
  externalCode: string | null;
  activePin: boolean;
  active: boolean;
  loginFailCount: number;
  lastLogin: Date | null;
  lastLogout: Date | null;
  updatedPassword: Date;
  otherDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class User extends Model implements UserAttributes {
  public readonly id!: UserAttributes['id'];
  public companyId!: UserAttributes['companyId'];
  public partnerId!: UserAttributes['partnerId'];
  public userid!: UserAttributes['userid'];
  public password!: UserAttributes['password'];
  public pin!: UserAttributes['pin'];
  public name!: UserAttributes['name'];
  public auth!: UserAttributes['auth'];
  public email!: UserAttributes['email'];
  public mobile!: UserAttributes['mobile'];
  public externalCode!: UserAttributes['externalCode'];
  public activePin!: UserAttributes['activePin'];
  public active!: UserAttributes['active'];
  public loginFailCount!: UserAttributes['loginFailCount'];
  public lastLogin!: UserAttributes['lastLogin'];
  public lastLogout!: UserAttributes['lastLogout'];
  public updatedPassword!: UserAttributes['updatedPassword'];
  public otherDate!: UserAttributes['otherDate'];
  public readonly createdAt!: UserAttributes['createdAt'];
  public readonly updatedAt!: UserAttributes['updatedAt'];
  public readonly deletedAt!: UserAttributes['deletedAt'];
}

export const UserDefaults = {
  auth: 'staff',
  active: false,
  loginFailCount: 0,
};

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      // 얘는 null 가능함
    },
    partnerId: {
      type: DataTypes.INTEGER,
      // 얘는 null 가능함
    },
    userid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pin: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    auth: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: UserDefaults.auth,
    },
    email: {
      type: DataTypes.STRING(255),
    },
    mobile: {
      type: DataTypes.STRING(20),
    },
    externalCode: {
      type: DataTypes.STRING(50),
    },
    activePin: {
      type: DataTypes.BOOLEAN,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: UserDefaults.active,
    },
    loginFailCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: UserDefaults.loginFailCount,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    lastLogout: {
      type: DataTypes.DATE,
    },
    updatedPassword: {
      type: DataTypes.DATE,
    },
    otherDate: {
      type: DataTypes.DATE,
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
export interface UserInsertParams {
  companyId: number | null;
  userid: string;
  password: string;
  pin: string | null;
  name: string;
  auth: UserAttributes['auth'];
  email: string | null;
  mobile: string | null;
  externalCode: string | null;
  activePin: boolean;
  active: boolean;
  partnerId: number | null;
  departmentIds?: Array<number>;
  roleGroupIds?: Array<number>;
}

// selectList
export interface UserSelectListParams {
  companyIds?: Array<number> | null;
  userid?: string | null;
  name?: string | null;
  auth?: UserAttributes['auth'];
  externalCode?: string | null;
  activePin?: string | null;
  active?: string | null;
  departmentIds?: Array<number> | null;
  roleGroupIds?: Array<number> | null;
  limit?: number;
  offset?: number;
  order?: string;
}
export interface UserSelectListQuery {
  where?: WhereOptions<UserAttributes>;
  limit?: number;
  offset?: number;
  order?: Order;
}

// selectInfo
export interface UserSelectInfoParams {
  id?: number;
}

// selectOne
export interface UserSelectOneParams {
  id?: number;
}

// update
export interface UserUpdateParams {
  id?: number;
  pin?: string;
  name?: string;
  email?: string | null;
  mobile?: string | null;
  externalCode?: string | null;
  activePin?: boolean;
  active?: boolean;
  partnerId?: number | null;
  otherDate?: Date | null;
  departmentIds?: Array<number>;
  roleGroupIds?: Array<number>;
  ccIdEligibilityIds?: Array<number>;
}

// updatePassword
export interface UserUpdatePasswordParams {
  id?: number;
  password?: string;
  oldPassword?: string;
  newPassword?: string;
}

// delete
export interface UserDeleteParams {
  id?: number;
}

// 로그인을 위한 파라미터
export interface UserLoginParams {
  userid: string;
  password: string;
}

// PIN로그인을 위한 파라미터
export interface UserPinLoginParams {
  pin: string;
}

// 라이센스 로그인을 위한 파라미터
export interface UserLicenseLoginParams {
  userid: string;
  password: string;
  key: string;
}

// 라이센스 핀 로그인을 위한 파라미터
export interface UserLicensePinLoginParams {
  pin: string;
  key: string;
}
// 로그인 실패 카운트 업데이트
export interface UserLoginFailCountUpdateParams {
  id: number;
  loginFailCount: number;
}

// 로그아웃을 위한 파라미터
export interface UserLogoutParams {
  id: number;
}

// include attributes
export const UserAttributesInclude = [
  'id',
  'companyId',
  'userid',
  'name',
  'auth',
  'externalCode',
  'createdAt',
  'active',
];

export default User;
