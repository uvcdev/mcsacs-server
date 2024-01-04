import { InsertedResult } from '../../lib/resUtil';
import File, { FileInsertParams, FileAttributes, FileSelectInfoParams } from '../../models/common/file';

const dao = {
  insert(params: FileInsertParams): Promise<InsertedResult> {
    // DB에 넘길 최종 쿼리 세팅
    return new Promise((resolve, reject) => {
      File.create(params)
        .then((inserted) => {
          resolve({ insertedId: inserted.id });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  selectInfo(params: FileSelectInfoParams): Promise<FileAttributes | null> {
    return new Promise((resolve, reject) => {
      File.findByPk(params.id)
        .then((selectedInfo) => {
          resolve(selectedInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export { dao };
