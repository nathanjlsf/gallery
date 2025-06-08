import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";
import { verifyAuthToken } from "../middleware/verifyAuthToken";
import { imageUpload, handleImageFileErrors } from "../imageUploadMiddleware";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  const router = express.Router();

  router.get(
    "/api/images",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      const images = await imageProvider.getAllImagesDenormalized();
      res.json(images);
    }
  );

  router.get(
    "/api/images/search",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      const name = req.query.name;
      if (typeof name !== "string") {
        res
          .status(400)
          .send({ error: "Bad Request", message: "Missing or invalid name param" });
        return;
      }
      const images = await imageProvider.getImages(name);
      res.json(images);
    }
  );

  router.patch(
    "/api/images/:imageId",
    verifyAuthToken,
    async (req: Request, res: Response) => {
      const { imageId } = req.params;
      const { newName } = req.body;
      if (typeof newName !== "string") {
        res
          .status(400)
          .send({ error: "Bad Request", message: "newName must be a string" });
        return;
      }

      const username = req.user?.username;
      if (!username) {
        res.status(401).send({ error: "Unauthorized" });
        return;
      }

      const matched = await imageProvider.updateImageName(imageId, newName, username);
      if (!matched) {
        res
          .status(403)
          .send({ error: "Forbidden", message: "You do not own this image" });
        return;
      }

      res.sendStatus(204);
    }
  );

  router.post(
    "/api/images",
    verifyAuthToken,
    imageUpload.single("image"),
    handleImageFileErrors as ErrorRequestHandler,
    async (req: Request, res: Response) => {
      if (!req.file || !req.body.name || !req.user) {
        res
          .status(400)
          .send({
            error: "Bad Request",
            message: "Missing image file, title, or authentication",
          });
        return;
      }

      const filename = req.file.filename;
      const src = `/uploads/${filename}`;
      const name = String(req.body.name);
      const author = req.user.username;

      await imageProvider.createImage({ src, name, author });
      res.sendStatus(201);
    }
  );

  app.use("/", router);
}
