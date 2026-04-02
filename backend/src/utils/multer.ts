import multer from 'multer';
import path from 'path';
import fs from 'fs';

// pastikan folder uploads ada
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// storage (tetap sama)
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `file-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    console.log(`SAVING: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

// ✅ FIX DI SINI
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung (hanya gambar / excel / csv)'), false);
  }
};

// export multer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter
});

export default upload;