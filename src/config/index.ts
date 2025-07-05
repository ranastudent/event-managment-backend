// src/config/index.ts


if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("❌ ACCESS_TOKEN_SECRET is undefined");
}

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is undefined");
}

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 5000;
