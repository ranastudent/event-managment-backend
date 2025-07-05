// models/pendingUser.model.ts
import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  photoUrl: String,
  verificationToken: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 🕒 auto-delete after 10 minutes
  },
});

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
export default PendingUser;
