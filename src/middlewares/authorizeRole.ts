import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export const authorizeRole = (role: "admin" | "user") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
         res.status(401).json({ message: "Unauthorized: No token provided" });
         return;
        
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      const user = await User.findById((decoded as any).id);
      if (!user || user.role !== role) {
         res.status(403).json({ message: "Forbidden: Insufficient permissions" });
         return;
      }

      next();
    } catch (err) {
      res.status(403).json({ message: "Forbidden: Invalid token" });
    }
  };
};
