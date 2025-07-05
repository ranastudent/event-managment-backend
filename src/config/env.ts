// ✅ src/config/env.ts
import dotenv from "dotenv";
dotenv.config();

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("❌ Token secrets are missing in .env");
}

export const MONGO_URI = process.env.MONGO_URI || "";
export const PORT = process.env.PORT || "5000";

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; // ✅ fix here
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET; // ✅ fix here

export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASS = process.env.EMAIL_PASS || "";
