import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../../config/env";

export const sendVerificationEmail = async (email: string, token: string) => {
  const link = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Library App" <${EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click the link below to verify your email:</p><a href="${link}">${link}</a>`,
  });
};
