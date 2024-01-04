import { RequestHandler } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import multer from 'multer';

const uploadDir = 'uploads'; // upload 메인 디렉토리

function checkType(file: Express.Multer.File, done: multer.FileFilterCallback, filetypes: RegExp) {
  const ext = path.extname(file.originalname).toLowerCase();
  // Check ext
  const extname = filetypes.test(ext);
  // Check mime
  // const mimetype = filetypes.test(file.mimetype); // xls가 걸러짐??

  if (extname) {
    return done(null, true);
  } else {
    return done(null, false);
  }
}

/**
 * 이미지 업로드 - 단일
 * @param paramName 이미지 파일의 form 이름
 * @param fileDir 업로드 파일 경로
 * @param originalName 파일명 그대로 사용 여부(default: false)
 * @returns
 */
export const uploadImage = (paramName: string, fileDir: string, originalName?: boolean): RequestHandler => {
  const fileDirWeb = `${uploadDir}/${fileDir}`;
  const fileTypeCheck = new RegExp('jpeg|jpg|png|gif|bmp');
  const fileSize = 5 * 1024 * 1024;

  // 디렉토리 없으면 생성
  const dir = path.join(__dirname, '../../', uploadDir, fileDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // multer 호출
  const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        done(null, fileDirWeb);
      },
      filename(req, file, done) {
        const ext = path.extname(file.originalname).toLowerCase();
        const uuid = uuidv4();
        let fileName = uuid + ext;
        if (originalName === true) {
          fileName = file.originalname;
        }
        done(null, fileName);
      },
    }),
    limits: { fileSize },
    fileFilter: (req, file, done) => {
      checkType(file, done, fileTypeCheck);
    },
  });

  return upload.single(paramName);
};

/**
 * 이미지 업로드 - 다중
 * @param paramName 이미지 파일의 form 이름
 * @param fileDir 업로드 파일 경로
 * @param originalName 파일명 그대로 사용 여부(default: false)
 * @returns
 */
export const uploadImages = (paramName: string, fileDir: string, originalName?: boolean): RequestHandler => {
  const fileDirWeb = `${uploadDir}/${fileDir}`;
  const fileTypeCheck = new RegExp('jpeg|jpg|png|gif|bmp');
  const fileSize = 5 * 1024 * 1024;

  // 디렉토리 없으면 생성
  const dir = path.join(__dirname, '../../', uploadDir, fileDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // multer 호출
  const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, done) {
        done(null, fileDirWeb);
      },
      filename(req, file, done) {
        const ext = path.extname(file.originalname).toLowerCase();
        const uuid = uuidv4();
        let fileName = uuid + ext;
        if (originalName === true) {
          fileName = file.originalname;
        }
        done(null, fileName);
      },
    }),
    limits: { fileSize },
    fileFilter: (req, file, done) => {
      checkType(file, done, fileTypeCheck);
    },
  });

  return upload.array(paramName);
};
