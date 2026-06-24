import mongoose from 'mongoose';
import { buildApp } from './app';

/** HTTP listening port for the CAD service. */
const PORT = Number(process.env['CAD_PORT'] ?? process.env['PORT']) || 3002;
/** Mongo connection string for CAD persistence. */
const MONGO_URI = process.env['CAD_MONGO_URI'] ?? process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/kompozer-cad';

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
