import express from 'express'
import multer from 'multer';
import fs from 'fs';
import { uploadsFolder } from '../config';
import { clearInitialData } from '../services/utils';
import { createInitialData } from '../services/data';

export const uploadRouter = express.Router()

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

const upload = multer({ storage });

uploadRouter.post('/upload', upload.array('files', 20), async (req, res) => {
  const files = (req as any).files || [];
  await clearInitialData()
  await createInitialData(new Date('07/01/2025'), new Date('07/31/2025'), ['.CSV'])
  res.json({ count: files.length, files: files.map((f: any) => ({ filename: f.filename, size: f.size })) });
});