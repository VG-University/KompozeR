// seed — Script di inizializzazione del database.
// Legge DEVUSER.json dalla root del progetto, fa l'hash della password e
// esegue un UPSERT dell'utente ADMIN su MongoDB. È idempotente: può essere
// eseguito più volte senza creare duplicati. Se l'utente esiste già, aggiorna
// password hash, email e ruolo in modo da restare sincronizzato con il file.
//
// Uso: npm run seed
// Prerequisiti: MONGO_URI e JWT_SECRET devono essere definiti (o usa i default di sviluppo).

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { UserModel } from './adapters/persistence/schemas/userSchema';
import { UserRole } from './domain/entities/UserRole';

const SALT_ROUNDS = 12;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kompozer-auth';
const DEVUSER_PATH = path.resolve(__dirname, '..', 'DEVUSER.json');

interface DevUserConfig {
  username: string;
  password: string;
  email: string;
  role: string;
}

function readDevUserConfig(): DevUserConfig {
  const raw = fs.readFileSync(DEVUSER_PATH, 'utf-8');
  // Rimuove i commenti // (non validi in JSON standard) prima del parsing.
  const stripped = raw.replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(stripped) as DevUserConfig;
}

function resolveRole(role: string): UserRole {
  if (Object.values(UserRole).includes(role as UserRole)) {
    return role as UserRole;
  }
  console.warn(`[seed] Ruolo sconosciuto "${role}", fallback a BASE`);
  return UserRole.BASE;
}

async function seed(): Promise<void> {
  console.log(`[seed] Connessione a MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const config = readDevUserConfig();
  const role = resolveRole(config.role);
  const passwordHash = await bcrypt.hash(config.password, SALT_ROUNDS);
  const now = new Date();

  const existing = await UserModel.findOne({ username: config.username }).lean();

  if (existing) {
    await UserModel.findByIdAndUpdate(existing._id, {
      passwordHash,
      email: config.email,
      role,
      updatedAt: now,
    });
    console.log(`[seed] Utente "${config.username}" aggiornato (upsert).`);
  } else {
    await UserModel.create({
      _id: uuidv4(),
      username: config.username,
      passwordHash,
      email: config.email,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`[seed] Utente "${config.username}" creato con ruolo ${role}.`);
  }

  await mongoose.disconnect();
  console.log('[seed] Completato.');
}

seed().catch((err: unknown) => {
  console.error('[seed] Errore:', err);
  process.exit(1);
});
