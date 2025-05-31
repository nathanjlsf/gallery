import express, { Request, Response, RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../ImageProvider";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  const getAllHandler: RequestHandler = async (_req, res) => {
    const images = await imageProvider.getAllImages();
    res.json(images);
    return; 
  };
  app.get("/api/images", getAllHandler);

  const searchHandler: RequestHandler = async (req, res) => {
    const name = req.query.name;
    if (typeof name !== "string") {
      res.status(400).json({ 
        error: "Bad Request", 
        message: "Missing or invalid name param" 
      });
      return;
    }

    const images = await imageProvider.getImages(name);
    res.json(images);
    return; 
  };
  app.get("/api/images/search", searchHandler);

  const updateHandler: RequestHandler = async (req, res) => {
    const { imageId } = req.params;
    const { newName } = req.body;

    if (typeof newName !== "string") {
      res.status(400).json({ 
        error: "Bad Request", 
        message: "newName must be a string" 
      });
      return; 
    }

    if (newName.length > 100) {
      res.status(422).json({
        error: "Unprocessable Entity",
        message: "Image name exceeds 100 characters"
      });
      return; 
    }

    if (!ObjectId.isValid(imageId)) {
      res.status(404).json({ 
        error: "Not Found", 
        message: "Invalid image ID" 
      });
      return;
    }

    const updatedCount = await imageProvider.updateImageName(imageId, newName);
    if (updatedCount === 0) {
      res.status(404).json({ 
        error: "Not Found", 
        message: "Image does not exist" 
      });
      return; 
    }

    res.status(204).send();
    return; 
  };
  app.put("/api/images/:imageId", updateHandler);
}
