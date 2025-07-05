import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/errorHandler";
import eventRoutes from "./routes/event.route";
import rateLimit from "express-rate-limit";
import morgan from "morgan";


console.log("App started")
const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 60, // limit each IP
  message: "Too many requests, please try again later.",
});
app.use(limiter);
app.use(morgan("dev"));
app.get("/", (req, res) => {
      res.send("✅ Event Management API is Live!");
    });
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler); 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});
export default app;
