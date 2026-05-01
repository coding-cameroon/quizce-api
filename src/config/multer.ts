import { v4 as uuid } from "uuid";
import type { Request } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  const allowedFormats = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ];

  if (allowedFormats.includes(file.mimetype)) return cb(null, true);
  else
    return cb(
      new Error(
        `${file.mimetype} is not a valid file extension. Only JPEG, PNG, and PDF are allowed!`,
      ),
      false,
    );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
