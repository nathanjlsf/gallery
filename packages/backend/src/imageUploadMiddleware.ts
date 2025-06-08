import { Request, Response, NextFunction } from "express";
import multer from "multer";

export class ImageFormatError extends Error {}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = process.env.IMAGE_UPLOAD_DIR;
    if (!dir) return cb(new Error("Missing IMAGE_UPLOAD_DIR"), "");
    cb(null, dir);
  },
  filename(req, file, cb) {
    let ext: string;
    switch (file.mimetype) {
      case "image/png":
        ext = "png";
        break;
      case "image/jpeg":
      case "image/jpg":
        ext = "jpg";
        break;
      default:
        return cb(new ImageFormatError("Unsupported image type"), "");
    }
    const name =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "." +
      ext;
    cb(null, name);
  },
});

export const imageUpload = multer({
  storage,
  limits: { files: 1, fileSize: 5 * 1024 * 1024 /*5MB*/ },
});

export function handleImageFileErrors(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
    return res.status(400).send({ error: "Bad Request", message: err.message });
  }
  next(err);
}
