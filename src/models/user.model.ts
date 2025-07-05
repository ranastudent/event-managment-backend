import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  photoUrl: string;
  role: "admin" | "user"; // 👈 Role
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: String ;
  resetTokenExpiry?: Date ;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photoUrl: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      select: true,
    }, // 👈 Added here
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetToken: { type: String, required:false },
    resetTokenExpiry: { type: Date, required:false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
