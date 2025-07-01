import mongoose from "mongoose";
// import { JWT_SECRET }  from "./config/env"
import app from "./app";


// console.log("🔐 JWT_SECRET from .env is:", process.env.JWT_SECRET);
// console.log("🌐 MONGO_URI from .env is:", process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET");
}
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
