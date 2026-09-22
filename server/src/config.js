import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8000", 10) || 8000,
  host: process.env.HOST || "0.0.0.0",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:8080,http://localhost:4173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET || "civic-ai-dev-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "civic-ai-dev-refresh-secret-change-me",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: "civic-ai",
    audience: "civic-ai-frontend",
  },
  dataDir: process.env.DATA_DIR || "./data",
  uploadsDir: process.env.UPLOADS_DIR || "./uploads",
  simulation: {
    enabled: (process.env.ALERT_SIMULATION || "true") === "true",
    intervalMs: parseInt(process.env.ALERT_SIMULATION_INTERVAL_MS || "25000", 10),
  },
};

export default config;
