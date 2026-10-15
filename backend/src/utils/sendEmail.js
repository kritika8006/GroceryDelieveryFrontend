import nodemailer from "nodemailer";

let transporter = null;
let warnedOnce = false;

const isConfigured = () => !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
    });
  }
  return transporter;
};

// Sends a real email if EMAIL_USER/EMAIL_APP_PASSWORD are set in .env.
// Otherwise falls back to printing it to the console — same pattern as the
// password-reset link, so the app always keeps working even with no email
// service configured yet.
//
// To enable real sending: get a Gmail "app password" (not your normal
// password) from https://myaccount.google.com/apppasswords, then set in
// backend/.env:
//   EMAIL_USER=youraddress@gmail.com
//   EMAIL_APP_PASSWORD=the16charapppassword
const sendEmail = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    if (!warnedOnce) {
      console.log("\nEmail not configured (EMAIL_USER/EMAIL_APP_PASSWORD missing from .env) — printing emails here instead.\n");
      warnedOnce = true;
    }
    console.log(`---- EMAIL ----\nTo: ${to}\nSubject: ${subject}\n${html}\n---------------\n`);
    return;
  }

  try {
    await getTransporter().sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (err) {
    // Email failing should never break the request that triggered it
    // (e.g. an order that was placed successfully) — just log it.
    console.error("Failed to send email:", err.message);
  }
};

export default sendEmail;