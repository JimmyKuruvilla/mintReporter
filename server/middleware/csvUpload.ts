import fs from 'node:fs';
import multer from 'multer';
import { uploadsFolder } from 'server/config';

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safeOriginal}`);
  },
});

export const csvUploadMiddleware = multer({ storage });



