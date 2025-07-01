// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env");
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGO_URI = process.env.MONGO_URI || "";
export const PORT = process.env.PORT || "5000";
