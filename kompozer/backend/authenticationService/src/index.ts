/**
 * Authentication Service process entry point.
 *
 * Reads environment variables (PORT, MONGO_URI, JWT_SECRET, SESSION_TTL_HOURS),
 * connects to MongoDB, and starts the HTTP server.
 *
 * The process exits early if JWT_SECRET is missing or if database connection fails.
 */
import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT = Number(process.env['AUTH_PORT'] ?? process.env['PORT']) || 3001;
const MONGO_URI = process.env['AUTH_MONGO_URI'] ?? process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/kompozer-auth';
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS) || 8;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const app = buildApp({
  jwtSecret: JWT_SECRET,
  sessionTtlMs: SESSION_TTL_HOURS * 60 * 60 * 1000,
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[auth] MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[auth] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[auth] Failed to connect to MongoDB', err);
    process.exit(1);
  });
