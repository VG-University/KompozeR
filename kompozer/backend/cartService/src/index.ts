import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT = Number(process.env['CART_PORT'] ?? process.env['PORT']) || 3003;
const MONGO_URI = process.env['CART_MONGO_URI'] ?? process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/kompozer-cart';

const app = buildApp();

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[cart] MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[cart] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[cart] Failed to connect to MongoDB', err);
    process.exit(1);
  });
