// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import crypto from "crypto";
import { sendVerificationEmail } from "../app/utils/sendEmail";
import PendingUser from "../models/pendingUser.model";
import LoginSession from "../models/loginSession.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateTokens, verifyRefreshToken } from "../app/utils/token";
import { ACCESS_TOKEN_SECRET } from "../config/env";
import { sendResetPasswordEmail } from "../app/utils/sendEmail";


export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, photoUrl } = req.body;

    if (!name || !email || !password || !photoUrl) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    const existingPending = await PendingUser.findOne({ email });
    if (existingUser || existingPending) {
      res
        .status(409)
        .json({ message: "User already exists or awaiting verification" });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedPassword = await bcrypt.hash(password, 10);

    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      photoUrl,
      verificationToken,
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message:
        "Verification email sent. Please verify to complete registration.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+role");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: "Please verify your email first" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id.toString());

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        role: user.role,
      },
    });
    // res
    //   .cookie("accessToken", accessToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    //     maxAge: 0.2 * 24 * 60 * 60 * 1000, // 20 min
    //   })
    //   .cookie("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    //     maxAge: 1.5 * 24 * 60 * 60 * 1000, // 1.5 days
    //   })
    //   .json({
    //     message: "Login successful",
    //     accessToken,
    //     refreshToken,
    //     user: {
    //       id: user._id,
    //       name: user.name,
    //       email: user.email,
    //       photoUrl: user.photoUrl,
    //       role: user.role,
    //     },
    //   });

    await LoginSession.create({
      userId: user._id,
      token: refreshToken,
      // ipAddress: req.ip,
      // userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.body.refreshToken;
  if (!token) {
    res.status(400).json({ message: "Refresh token missing" });
    return;
  }

  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
    return;
  }

  const session = await LoginSession.findOne({ token });
  if (!session) {
    res.status(403).json({ message: "Invalid refresh session" });
    return;
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    decoded.id
  );

  res.status(200).json({ accessToken, refreshToken: newRefreshToken });
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ message: "Token is missing" });
      return;
    }

    const pendingUser = await PendingUser.findOne({ verificationToken: token });
    if (!pendingUser) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    // ✅ Move to User collection
    const { name, email, password, photoUrl } = pendingUser;

    const user = await User.create({
      name,
      email,
      password,
      photoUrl,
      isVerified: true,
    });

    // ❌ Delete from pending
    await pendingUser.deleteOne();

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Resend verification email
export const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.isVerified) {
    res.status(400).json({ message: "Email is already verified" });
    return;
  }

  // Create a new verification token (optional: reuse existing)
  const newToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = newToken;
  await user.save();

  // Send email again
  await sendVerificationEmail(user.email, newToken);

 res.status(200).json({ message: `Verification email resent to ${user.email}` });
};

export const logoutUser = async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Delete refreshToken from DB
  await LoginSession.findOneAndDelete({ token });

  // Clear cookies if used
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};


export const getMe = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select(
      "-password -verificationToken"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
    return;
  }
};

export const getLoginUsers = async (_req: Request, res: Response) => {
  const sessions = await LoginSession.find().populate(
    "userId",
    "name email photoUrl"
  );
  const users = sessions.map((s) => s.userId);
  res.status(200).json({ users });
};

// With auth middleware attached:
export const getLoggedInUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -verificationToken -resetToken -resetTokenExpiry"
    );

    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  console.log("Requesting userId:", req.userId);
  const requestingUser = await User.findById(req.userId).select("+role email");
  console.log("Fetched user:", requestingUser);
  console.log("Role:", requestingUser?.role);
  console.log(
    "Found requestingUser:",
    requestingUser?.email,
    requestingUser?.role
  );

  if (!requestingUser || requestingUser.role !== "admin") {
    console.log("⛔ Not admin or not found");
    res.status(403).json({ message: "Forbidden: Only admin can change roles" });
    return;
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  targetUser.role = role;
  await targetUser.save();

  res
    .status(200)
    .json({ message: "Role updated successfully", user: targetUser });
  console.log("Decoded user ID:", req.userId);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "No user found with that email" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await user.save();

  await sendResetPasswordEmail(user.email, token);

  res.status(200).json({ message: "Password reset email sent" });
};


export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ message: "Token and new password are required" });
    return;
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    res.status(400).json({ message: "Invalid or expired token" });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, photoUrl } = req.body;

  if (!name && !photoUrl) {
     res.status(400).json({ message: "Nothing to update" });
     return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
  }

  if (name) user.name = name;
  if (photoUrl) user.photoUrl = photoUrl;

  await user.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      role: user.role,
    },
  });
};





