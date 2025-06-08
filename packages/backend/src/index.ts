import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./middleware/verifyAuthToken";
import { imageUpload, handleImageFileErrors } from "./imageUploadMiddleware";

dotenv.config();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || "public");

async function main() {
  const app = express();

  app.locals.JWT_SECRET = process.env.JWT_SECRET;

  const mongoClient = connectMongo();
  await mongoClient.connect();
  const db = mongoClient.db();

  const credsCollection = process.env.CREDS_COLLECTION_NAME;
  const jwtSecret = process.env.JWT_SECRET;

  if (!credsCollection) throw new Error("Missing CREDS_COLLECTION_NAME");
  if (!jwtSecret) throw new Error("Missing JWT_SECRET");

  app.locals.JWT_SECRET = jwtSecret; 

  const credentialsProvider = new CredentialsProvider(db, credsCollection);
  const imageProvider = new ImageProvider(mongoClient);

  app.use(express.static(STATIC_DIR));
  app.use(
    "/uploads",
    express.static(process.env.IMAGE_UPLOAD_DIR!, { fallthrough: false })
  );
  app.use(express.json());

  app.get("/api/hello", (_req, res) => {
    res.send("Hello, World");
  });

  registerImageRoutes(app, imageProvider);
  registerAuthRoutes(app, credentialsProvider);

  Object.values(ValidRoutes)
    .filter((route) => !route.startsWith("/api") && !route.includes(":"))
    .forEach((route) => {
      app.get(route, (_req, res) => {
        res.sendFile(path.join(STATIC_DIR, "index.html"));
      });
    });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Error starting server:", err);
});
