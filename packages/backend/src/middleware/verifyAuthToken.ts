import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface IAuthTokenPayload {
  username: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: IAuthTokenPayload;
  }
}

export function verifyAuthToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  jwt.verify(token, req.app.locals.JWT_SECRET as string, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }

    req.user = decoded as IAuthTokenPayload;
    next(); 
  });
}
