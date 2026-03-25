import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `selfie-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    console.log(`SAVING: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

export default multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya gambar yang diizinkan'), false);
    }
  }
});
