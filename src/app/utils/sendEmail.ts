import nodemailer from "nodemailer";

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // must be verified sender
        pass: process.env.EMAIL_PASS, // 16-digit app password
      },
    });

    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Event App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Verify Your Email</h2>
        <p>Click the link below to verify:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to: ${email}`, info.messageId);
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error);
    throw error;
  }
};


export const sendResetPasswordEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Event App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Reset Your Password</h2>
      <p>Click below to reset:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Password reset email sent to: ${email}`, info.messageId);
};

