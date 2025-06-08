import express, { Request, Response } from "express";
import type { CredentialsProvider } from "../CredentialsProvider";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
  username: string;
}

function generateAuthToken(
  username: string,
  secret: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: IAuthTokenPayload = { username };
    jwt.sign(payload, secret, { expiresIn: "1d" }, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    });
  });
}

export function registerAuthRoutes(
  app: express.Application,
  credentials: CredentialsProvider
) {
  const router = express.Router();

  router.post("/auth/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).send({
        error: "Bad request",
        message: "Missing username or password",
      });
      return; 
    }

    const success = await credentials.registerUser(username, password);
    if (!success) {
      res.status(409).send({ error: "Username already taken" });
      return;
    }

    try {
      const token = await generateAuthToken(
        username,
        req.app.locals.JWT_SECRET as string
      );
      res.status(201).json({ token }); 
    } catch (err) {
      console.error("JWT sign error:", err);
      res.sendStatus(500);
    }
  });

  router.post("/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).send({
        error: "Bad request",
        message: "Missing username or password",
      });
      return;
    }

    const valid = await credentials.verifyPassword(username, password);
    if (!valid) {
      res.status(401).send({
        error: "Unauthorized",
        message: "Invalid username or password",
      });
      return;
    }

    try {
      const token = await generateAuthToken(
        username,
        req.app.locals.JWT_SECRET as string
      );
      res.json({ token });
    } catch (err) {
      console.error("JWT sign error:", err);
      res.sendStatus(500);
    }
  });

  app.use("/", router);
}
