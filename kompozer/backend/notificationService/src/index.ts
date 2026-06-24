/**
 * notificationService entrypoint.
 * Loads runtime configuration, connects MongoDB, starts HTTP/WebSocket runtime,
 * and handles graceful shutdown.
 */
import mongoose from 'mongoose';
import { createServer } from 'http';
import { buildApp } from './app';

const PORT = Number(process.env['NOTIFICATION_PORT'] ?? process.env['PORT']) || 3005;
const MONGO_URI =
  process.env['NOTIFICATION_MONGO_URI'] ??
  process.env['MONGO_URI'] ??
  'mongodb://localhost:27017/kompozer-notification';
const REDIS_URL = process.env['REDIS_URL'] || '';
const CART_MONGO_URI = process.env['CART_MONGO_URI'] || '';
const CAD_MONGO_URI = process.env['CAD_MONGO_URI'] || '';

const runtime = buildApp({
  redisUrl: REDIS_URL || undefined,
  cartMongoUri: CART_MONGO_URI || undefined,
  cadMongoUri: CAD_MONGO_URI || undefined,
});

const server = createServer(runtime.app);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`[notification] MongoDB connected: ${MONGO_URI}`);
    await runtime.attachRealtime(server);
    server.listen(PORT, () => {
      console.log(`[notification] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[notification] Failed to connect to MongoDB', err);
    process.exit(1);
  });

async function shutdown(signal: string): Promise<void> {
  console.log(`[notification] Received ${signal}, shutting down...`);
  await runtime.shutdown();
  await mongoose.disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
