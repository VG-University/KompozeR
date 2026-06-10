import mongoose from 'mongoose';
import { buildApp } from './app';

const PORT = Number(process.env['PORT']) || 3005;
const MONGO_URI = process.env['MONGO_URI'] || 'mongodb://localhost:27017/kompozer-cad';

const app = buildApp();

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[cad] MongoDB connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[cad] Listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('[cad] Failed to connect to MongoDB', err);
    process.exit(1);
  });
