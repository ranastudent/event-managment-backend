// src/models/loginSession.model.ts
import mongoose from "mongoose";

const loginSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

const LoginSession = mongoose.model("LoginSession", loginSessionSchema);
export default LoginSession;
