import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone });

    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (requires `protect` middleware)
export const getMe = async (req, res) => {
  res.json(req.user);
};

// POST /api/auth/forgot-password  — body: { email }
// No email service is wired up yet, so the reset link is logged to the
// backend console instead of emailed. See the note in authRoutes.js for
// how to send it for real with nodemailer.
// POST /api/auth/forgot-password  — body: { email }
// Sends a real email via sendEmail() if EMAIL_USER/EMAIL_APP_PASSWORD are set
// in .env; otherwise sendEmail() itself falls back to logging the link to
// the console (see src/utils/sendEmail.js).
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return the same message whether or not the email exists,
    // so an attacker can't use this endpoint to find out which emails are registered.
    const genericResponse = { message: "If that email exists, a password reset link has been sent." };

    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1F2B1E">Reset your password</h2>
          <p>Click the link below to set a new password. It expires in 1 hour.</p>
          <p><a href="${resetLink}" style="background:#1F2B1E;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a></p>
          <p style="color:#6B6355;font-size:13px">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token  — body: { password }
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset. You can now log in." });
  } catch (err) {
    next(err);
  }
};