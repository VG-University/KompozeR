import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT = Number(process.env['CHATBOT_PORT'] ?? process.env['PORT']) || 3006;
const MONGO_URI =
  process.env['CHAT_MONGO_URI'] ??
  process.env['MONGO_URI'] ??
  'mongodb://localhost:27017/kompozer-chatbot';
const CATALOG_BASE_URL = process.env['CATALOG_BASE_URL'] ?? 'http://catalog-service:3002';

const app = buildApp({
  catalogBaseUrl: CATALOG_BASE_URL,
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[chatbot] MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[chatbot] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[chatbot] Failed to connect to MongoDB', err);
    process.exit(1);
  });
