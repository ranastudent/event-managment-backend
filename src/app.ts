import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/errorHandler";
import eventRoutes from "./routes/event.route";


console.log("App started")
const app = express();
app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use("/api/events", eventRoutes);

app.use("/api/auth", authRoutes); // ✅ this is where router is used

export default app;
