// src/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ACCESS_TOKEN_SECRET } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     res.status(401).json({ message: "Unauthorized: No token provided" });
     return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string };
    req.userId = decoded.id;
    console.log("✅ Decoded user ID:", req.userId);
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
     res.status(403).json({ message: "Forbidden: Invalid token" });
     return;
  }
};

