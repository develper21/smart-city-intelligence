import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";
import { initStore, disposeStore } from "./store.js";
import { requestLogger, logger } from "./middleware/logger.js";
import { initWebSocket, startAlertSimulation } from "./realtime.js";
import authRoutes from "./routes/auth.js";
import alertsRoutes from "./routes/alerts.js";
import camerasRoutes from "./routes/cameras.js";
import analyticsRoutes from "./routes/analytics.js";
import streamsRoutes from "./routes/streams.js";
import videoRoutes from "./routes/video.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initStore();

/* Test mode: import karte hi auto-listen avoid karo (tests apna server listen karti hain). */
const IS_TEST = process.env.NODE_ENV === "test";

const app = express();

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin(origin, cb) {
      /* allow server-to-server / curl (no origin) and whitelisted origins */
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(morgan("tiny"));

/* Serve uploaded video snapshots if needed later */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---- Routes ---- */
const api = express.Router();
api.get("/health", (req, res) => {
  res.json({ status: "ok", service: "civic-ai-server", timestamp: new Date().toISOString() });
});
api.use("/auth", authRoutes);
api.use("/alerts", alertsRoutes);
api.use("/cameras", camerasRoutes);
api.use("/analytics", analyticsRoutes);

/* Streams + system-status + settings + video */
api.use("/", streamsRoutes);
api.use("/", videoRoutes);

app.use("/api", api);

/* Root-level alias mount: /system-status, /alerts, /cameras, /start-stream etc.
   also respond directly for legacy clients that omit the /api prefix. */
app.use("/", api);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({ detail: "Resource not found" });
});

/* Error handler */
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ detail: "Origin not allowed" });
  }
  logger.error("unhandled_error", { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({ detail: err.message || "Internal server error" });
});

/* HTTP + WebSocket server */
const server = IS_TEST
  ? { close: (cb) => cb && cb() }
  : app.listen(config.port, config.host, () => {
      logger.info("server_started", { host: config.host, port: config.port, env: config.env });
    });

if (!IS_TEST) {
  initWebSocket(server);
  startAlertSimulation();
}

/* Graceful shutdown */
function shutdown() {
  logger.info("shutting_down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("beforeExit", disposeStore);

export default app;
