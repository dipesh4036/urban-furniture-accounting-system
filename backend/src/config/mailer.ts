import nodemailer from "nodemailer";
import { env } from "./env";

// One shared nodemailer transporter for the whole app. Every place that
// needs to send an email (activation, password reset, invoice delivery)
// should import THIS instead of creating its own transporter.
export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  // Port 465 uses TLS from the start ("secure"). Other ports (like 587)
  // start plain and upgrade to TLS - nodemailer handles that on its own.
  secure: env.SMTP_PORT === 465,
  connectionTimeout: 10000, // 10s timeout to prevent hanging connections
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS.replace(/\s+/g, ""),
  },
});
