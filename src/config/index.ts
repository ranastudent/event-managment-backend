// src/config/index.ts


if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is undefined");
}

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is undefined");
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 5000;
