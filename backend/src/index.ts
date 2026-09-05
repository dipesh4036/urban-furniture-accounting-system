import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { apiRouter } from "./routes";

const app = express();

// 1) Security headers
app.use(helmet());

// 2) Only allow our frontend's origin to call this API, and allow cookies
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// 3) Parse JSON request bodies (req.body). Default limit is only 100kb,
// which a base64-encoded profile image (Contact Master) blows past
// easily - raised to 5mb to give that room.
app.use(express.json({ limit: "5mb" }));

// 4) Parse cookies (req.cookies) - used for auth tokens later
app.use(cookieParser());

// Serve uploaded files (e.g. Contact profile images) as plain static
// files. A contact's profileImage field just stores a path like
// "/uploads/<name>.jpg", which resolves to a file here.
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);

// 5) Limit how many requests one IP can make, to slow down abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 6) Simple route to check the server is alive
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// 7) All feature routes live under /api/v1
app.use("/api/v1", apiRouter);

// 8) No route matched above - send a clean 404
app.use(notFoundMiddleware);

// 9) Catches every error thrown anywhere above - must be registered LAST
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
