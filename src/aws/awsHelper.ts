import { createReadStream, unlink } from "fs";
import multer from "multer";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static"; // ensure you install this: npm i ffmpeg-static
import path from "path";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { Upload } from "@aws-sdk/lib-storage";
import { existsSync, mkdirSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

// Set ffmpeg static binary path
// ffmpeg.setFfmpegPath(ffmpegPath!);

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
];
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = "uploads/";
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    console.log("Uploaded file mimetype:", file.mimetype); 
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Only images and videos are allowed."), false);
  }
};

export const upload = multer({ storage, fileFilter });

// AWS S3 Client config
const REGION = process.env.REGION || "ap-south-1";
const IMAGE_VIDEO_BUCKET = process.env.CONTENT_IMAGES_BUCKET;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY ,
    secretAccessKey:
      process.env.SECRET_KEY ,
  },
});

export async function uploadMediaFile(
  file: Express.Multer.File,
  newName: string
) {
  const inputPath = file.path;

  // Detect MIME type
  const isVideo = file.mimetype.startsWith("video/");
  const isImage = file.mimetype.startsWith("image/");

  let uploadFilePath = inputPath;
  let contentType = file.mimetype;

  if (isVideo) {
    // Convert video to mp4
    // const outputFileName = `${uuidv4()}.mp4`;
    // const outputPath = path.join("uploads", outputFileName);
    // await new Promise<void>((resolve, reject) => {
    //   ffmpeg(inputPath)
    //     .outputOptions([
    //       "-c:v libx264",
    //       "-preset fast",
    //       "-c:a aac",
    //       "-b:a 128k",
    //       "-movflags +faststart",
    //     ])
    //     .output(outputPath)
    //     .on("end", () => {
    //       console.log("✅ Video converted to mp4:", outputPath);
    //       resolve();
    //     })
    //     .on("error", (err) => {
    //       console.error("❌ FFmpeg conversion error:", err);
    //       reject(err);
    //     })
    //     .run();
    // });
    // uploadFilePath = outputPath;
    // contentType = "video/mp4"; // force mp4 after conversion
  } else if (isImage) {
    // ✅ No processing needed — image can be uploaded as-is
  }else {
    throw new Error(
      "Unsupported file type. Only images and videos are allowed."
    );
  }

  // Upload file (video or image) to S3
  const stream = createReadStream(uploadFilePath);
  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: IMAGE_VIDEO_BUCKET,
      Key: newName,
      Body: stream,
      ContentType: contentType,
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024, // 5MB
    leavePartsOnError: false,
  });

  parallelUpload.on("httpUploadProgress", (progress) => {
    console.log(`Uploading ${newName}: ${progress.loaded} / ${progress.total}`);
  });

  const result = await parallelUpload.done();

  // Optional: Cleanup local files
  unlink(inputPath, () => {});
  if (isVideo) {
    unlink(uploadFilePath, () => {}); // remove converted mp4 too
  }

  return result.Location;
}

// ✅ Upload from a direct file path
export async function uploadMediaFileUsingPath(
  filePath: string,
  newName: string,
  mimeType: string = "video/mp4"
) {
  const fileStream = createReadStream(filePath);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: IMAGE_VIDEO_BUCKET,
      Key: newName,
      Body: fileStream,
      ContentType: mimeType,
    },
  });

  const result = await upload.done();
  return result.Location;
}

// ✅ Delete media file from S3
export async function deleteMediaFile(fileName: string) {
  const command = new DeleteObjectCommand({
    Bucket: IMAGE_VIDEO_BUCKET,
    Key: fileName,
  });

  try {
    const response = await s3Client.send(command);
    return response.DeleteMarker || true;
  } catch (err) {
    console.error("❌ Delete error:", err);
    throw err;
  }
}
