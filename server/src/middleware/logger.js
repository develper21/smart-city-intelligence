const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const currentLevel = LEVELS[process.env.LOG_LEVEL || "info"] ?? LEVELS.info;

function log(level, message, meta) {
  if (LEVELS[level] < currentLevel) return;
  const line = {
    time: new Date().toISOString(),
    level,
    msg: message,
    ...(meta ? { meta } : {}),
  };
  const out = JSON.stringify(line);
  if (level === "error") console.error(out);
  else if (level === "warn") console.warn(out);
  else console.log(out);
}

export const logger = {
  debug: (msg, meta) => log("debug", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};

/** Express request logging middleware (morgan-free, JSON lines). */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
}
