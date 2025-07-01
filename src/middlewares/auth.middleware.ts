// ✅ src/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
}

// ✅ Fix return type → void
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({ message: "Forbidden: No token provided" });
    return; // ✅ Ensure early exit without returning a Response object
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
    next(); // ✅ correctly hands off to the next middleware
  } catch (err) {
    res.status(403).json({ message: "Forbidden: Invalid token" });
    return; // ✅ again, early exit only
  }
};
