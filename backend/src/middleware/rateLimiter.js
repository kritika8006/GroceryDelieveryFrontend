import rateLimit from "express-rate-limit";

// Applies to login/signup/forgot-password: 5 attempts per IP per 15 minutes.
// Stops both password-guessing against one account and mass account creation.
// Resets automatically after the window passes — no manual unlocking needed.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true, // sends RateLimit-* headers so the client could show "try again in Xs"
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

// Slightly looser limit for forgot-password, since someone might retype their
// email a few times by mistake and shouldn't get blocked for that alone.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in 15 minutes." },
});