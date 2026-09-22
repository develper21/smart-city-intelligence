import fs from "fs";
import path from "path";
import crypto from "crypto";
import config from "./config.js";
import { logger } from "./middleware/logger.js";
import {
  seedUsers,
  seedCameras,
  seedAlerts,
  seedOperators,
  seedSettings,
} from "./seedData.js";

/**
 * Lightweight JSON-file persistence layer (zero external DB dependency).
 * Collections are loaded lazily, mutated in memory and flushed to disk
 * atomically (tmp file + rename) after writes.
 *
 * SEED SOURCE OF TRUTH: `seedData.js` — pura frontend demo data wahin
 * likha jata hai. Fresh DB ke liye `server/data/` delete karke restart.
 */
const COLLECTIONS = ["users", "cameras", "alerts", "operators", "settings"];
const store = new Map();
const timers = new Map();

function fileFor(name) {
  return path.join(config.dataDir, `${name}.json`);
}

export function initStore() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  for (const name of COLLECTIONS) {
    const file = fileFor(name);
    if (fs.existsSync(file)) {
      try {
        store.set(name, JSON.parse(fs.readFileSync(file, "utf-8")));
        logger.info("store_loaded", { collection: name });
        continue;
      } catch (err) {
        logger.warn("store_corrupt_reseeding", { collection: name, error: err.message });
      }
    }
    store.set(name, seedCollection(name));
    flush(name);
    logger.info("store_seeded", { collection: name });
  }
}

function seedCollection(name) {
  switch (name) {
    case "users": return seedUsers();
    case "cameras": return seedCameras();
    case "alerts": return seedAlerts();
    case "operators": return seedOperators();
    case "settings": return seedSettings();
    default: return [];
  }
}

function flush(name) {
  const file = fileFor(name);
  const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store.get(name), null, 2));
  fs.renameSync(tmp, file);
}

/** Debounced persist so bursty writes don't thrash the disk. */
export function save(name) {
  clearTimeout(timers.get(name));
  timers.set(
    name,
    setTimeout(() => {
      try {
        flush(name);
      } catch (err) {
        logger.error("store_flush_failed", { collection: name, error: err.message });
      }
    }, 150)
  );
}

/** Clear pending debounced flushes (graceful shutdown / test teardown). */
export function disposeStore() {
  for (const [, t] of timers) clearTimeout(t);
  timers.clear();
}

export function getCollection(name) {
  return store.get(name);
}

export function nextId(name) {
  const rows = store.get(name) || [];
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

export function findIn(name, predicate) {
  return (store.get(name) || []).find(predicate);
}

export function filterIn(name, predicate) {
  return (store.get(name) || []).filter(predicate);
}

export function insert(name, row) {
  const rows = store.get(name);
  rows.push(row);
  save(name);
  return row;
}

export function updateIn(name, predicate, patch) {
  const rows = store.get(name) || [];
  let updated = null;
  for (let i = 0; i < rows.length; i++) {
    if (predicate(rows[i], i)) {
      rows[i] = { ...rows[i], ...patch };
      updated = rows[i];
    }
  }
  if (updated) save(name);
  return updated;
}

export function removeFrom(name, predicate) {
  const rows = store.get(name) || [];
  const before = rows.length;
  const kept = rows.filter((r) => !predicate(r));
  store.set(name, kept);
  if (kept.length !== before) save(name);
  return before - kept.length;
}
