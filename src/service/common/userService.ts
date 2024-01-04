import { logging, LogFormat } from '../../lib/logging';
import {
  responseCode as resCode,
  InsertedResult,
  SelectedListResult,
  UpdatedResult,
  DeletedResult,
  ErrorClass,
  BulkInsertedOrUpdatedResult,
} from '../../lib/resUtil';
import {
  UserAttributes,
  UserInsertParams,
  UserSelectInfoParams,
  UserSelectListParams,
  UserUpdateParams,
  // UserDeleteParams,
  UserUpdatePasswordParams,
  UserLoginParams,
  UserLogoutParams,
  UserDeleteParams,
} from '../../models/common/user';
import { makePasswordHash, checkPasswordHash } from '../../lib/hashUtil';
import { dao as userDao } from '../../dao/common/userDao';

const service = {
  // insert
  async reg(params: UserInsertParams, logFormat: LogFormat<unknown>): Promise<InsertedResult> {
    let result: InsertedResult;

    // 1. 비밀번호 암호화 처리
    try {
      params.password = await makePasswordHash(params.password);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // 2. 사용자 정보 입력
    try {
      result = await userDao.insert(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectList
  async list(params: UserSelectListParams, logFormat: LogFormat<unknown>): Promise<SelectedListResult<UserAttributes>> {
    let result: SelectedListResult<UserAttributes>;

    try {
      result = await userDao.selectList(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // selectInfo
  async info(params: UserSelectInfoParams, logFormat: LogFormat<unknown>): Promise<UserAttributes | null> {
    let result: UserAttributes | null;

    try {
      result = await userDao.selectInfo(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // update
  async edit(params: UserUpdateParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    // 1. 사용자 정보 수정
    try {
      result = await userDao.update(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }
    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // login 프로세스
  async login(params: UserLoginParams, logFormat: LogFormat<unknown>): Promise<UserAttributes | null> {
    // 1. 사용자 아이디 조회
    let user: UserAttributes | null;
    try {
      user = await userDao.selectUser(params);
      logging.METHOD_ACTION(logFormat, __filename, params, user);

      // 해당 사용자가 없는 경우 튕겨냄
      if (!user) {
        const err = new ErrorClass(resCode.BAD_REQUEST_NODATA, 'Incorect userid or password');
        logging.ERROR_METHOD(logFormat, __filename, params, err);

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // 2. 비밀번호 비교
    try {
      const checkPassword = await checkPasswordHash(params.password, user.password);
      logging.METHOD_ACTION(logFormat, __filename, params, checkPassword);

      // 비밀번호 틀린 경우 튕겨냄
      if (!checkPassword) {
        // 비번 틀린 횟수 카운트 증가(1씩 증가)
        void userDao.updateLoginFailCount({ id: user.id, loginFailCount: 1 });

        const err = new ErrorClass(resCode.BAD_REQUEST_NODATA, 'Incorect userid or password');
        logging.ERROR_METHOD(logFormat, __filename, params, err);

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }

      // 비번 맞으면 다음을 처리
      if (checkPassword) {
        // 마지막 로그인 일시 업데이트 & 비번 틀린 횟수 초기화
        void userDao.updateLastLogin({ id: user.id });
      }
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(user);
    });
  },
  // logOut 프로세스
  async logOut(params: UserLogoutParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    try {
      // 마지막 로그아웃 일시 업데이트
      result = await userDao.updateLastLogout({ id: params.id });
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // update password
  async editPassword(params: UserUpdatePasswordParams, logFormat: LogFormat<unknown>): Promise<UpdatedResult> {
    let result: UpdatedResult;

    // 1. 사용자 정보 조회
    let user: UserAttributes | null;
    const userParams = {
      id: params.id,
    };
    try {
      user = await userDao.selectOne(userParams);
      logging.METHOD_ACTION(logFormat, __filename, userParams, user);

      // 해당 사용자가 없는 경우 튕겨냄
      if (!user) {
        const err = new ErrorClass(resCode.BAD_REQUEST_NODATA, 'Incorect userid or password');
        logging.ERROR_METHOD(logFormat, __filename, params, err);

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    // 2. old 비밀번호 확인(입력이 없으면 확인 안한다. - 강제 비번 변경 시)
    if (params.oldPassword) {
      try {
        const checkPassword = await checkPasswordHash(params.oldPassword, user.password);
        logging.METHOD_ACTION(logFormat, __filename, params, checkPassword);

        // 비밀번호 틀린 경우 튕겨냄
        if (!checkPassword) {
          const err = new ErrorClass(resCode.BAD_REQUEST_NODATA, 'Incorect userid or password');
          logging.ERROR_METHOD(logFormat, __filename, params, err);

          return new Promise((resolve, reject) => {
            reject(err);
          });
        }
      } catch (err) {
        logging.ERROR_METHOD(logFormat, __filename, params, err);

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    }

    // 3. 비밀번호 암호화 처리
    if (params.newPassword) {
      try {
        params.password = await makePasswordHash(params.newPassword);
      } catch (err) {
        logging.ERROR_METHOD(logFormat, __filename, params, err);

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    }

    // 4. 비밀번호 업데이트
    if (params.password) {
      try {
        result = await userDao.updatePassword(params);
        logging.METHOD_ACTION(logFormat, __filename, params, result);
      } catch (err) {
        logging.ERROR_METHOD(logFormat, __filename, params, err);

        return new Promise((resolve, reject) => {
          reject(err);
        });
      }
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
  // delete
  async delete(params: UserDeleteParams, logFormat: LogFormat<unknown>): Promise<DeletedResult> {
    let result: DeletedResult;

    try {
      const updatedResult = await userDao.updateUniqueForDelete({ id: params.id || 0 });
      result = await userDao.delete(params);
      logging.METHOD_ACTION(logFormat, __filename, params, result);
    } catch (err) {
      logging.ERROR_METHOD(logFormat, __filename, params, err);

      return new Promise((resolve, reject) => {
        reject(err);
      });
    }

    return new Promise((resolve) => {
      resolve(result);
    });
  },
};

export { service };
