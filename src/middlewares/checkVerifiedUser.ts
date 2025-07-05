// src/middlewares/checkVerifiedUser.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { AuthRequest } from "./auth.middleware";

export const checkVerifiedUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select("isVerified email");

    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    if (!user.isVerified) {
       res.status(403).json({
        message: `Email not verified for account: ${user.email}`,
      });
      return;
    }

    next();
  } catch (err) {
     res.status(500).json({ message: "Server error", error: err });
     return;
  }
};
