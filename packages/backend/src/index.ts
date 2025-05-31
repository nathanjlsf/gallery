import express, { RequestHandler } from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { IMAGES } from "./common/ApiImageData";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

app.use(express.static(STATIC_DIR));
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.send("Hello, World");
});

app.get("/api/images", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  res.json(IMAGES);
});

const updateImageName: RequestHandler = (req, res) => {
  const { imageId } = req.params as { imageId: string };
  const { newName } = req.body as { newName: string };

  const image = IMAGES.find((img) => img.id === imageId);
  if (!image || typeof newName !== "string") {
    res.status(400).json({ error: "Invalid imageId or newName" });
    return; 
  }

  image.name = newName;

  res.json({ success: true });
  return;
};

app.post("/api/images/:imageId", updateImageName);

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