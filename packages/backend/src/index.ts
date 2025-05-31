import express from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

async function main() {
  const app = express();
  const mongoClient = connectMongo();
  await mongoClient.connect();

  const imageProvider = new ImageProvider(mongoClient);

  app.use(express.static(STATIC_DIR));
  app.use(express.json());

  app.get("/api/hello", (_req, res) => {
    res.send("Hello, World");
  });

  // Register all image routes from routes/imageRoutes.ts
  registerImageRoutes(app, imageProvider);

  // Serve index.html for all non-API routes
  Object.values(ValidRoutes)
    .filter((route) => !route.startsWith("/api") && !route.includes(":"))
    .forEach((route) => {
      app.get(route, (_req, res) => {
        res.sendFile(path.join(__dirname, STATIC_DIR, "index.html"));
      });
    });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Error starting server:", err);
});
