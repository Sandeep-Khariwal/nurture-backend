import multer from "multer";
import path from "path";
import fs from "fs";

const TEMP_DIR = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (
    /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype) ||
    /^video\/(mp4|quicktime|webm|x-matroska)$/.test(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image and video files are allowed (png, jpg, jpeg, webp, gif, svg, mp4, mov, webm, mkv)."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

export default upload;
