import express from "express";
import { signup, login, getMe, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter, forgotPasswordLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// NOTE: forgotPassword currently only console.logs the reset link — no email
// service is configured. To send it for real, install nodemailer
// (npm install nodemailer) and, inside forgotPassword in authController.js,
// replace the console.log with something like:
//
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
//   });
//   await transporter.sendMail({
//     to: email, subject: "Reset your password",
//     html: `<a href="${resetLink}">Reset your password</a> (expires in 1 hour)`,
//   });
//
// Gmail requires an "app password" (not your normal password) from
// https://myaccount.google.com/apppasswords — add EMAIL_USER and
// EMAIL_APP_PASSWORD to backend/.env if you go this route.

export default router;