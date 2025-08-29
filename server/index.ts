import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const ts = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}_${safeOriginal}`);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.array('files', 20), (req, res) => {
  const files = (req as any).files || [];
  res.json({ count: files.length, files: files.map((f: any) => ({ filename: f.filename, size: f.size })) });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}, uploads at ${uploadsDir}`);
});
