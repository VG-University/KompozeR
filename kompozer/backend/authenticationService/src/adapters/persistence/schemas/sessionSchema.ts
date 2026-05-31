// sessionSchema — Schema Mongoose per la collection `sessions`.
// Definisce la struttura del documento MongoDB per le sessioni autenticate.
// Usa _id: String (UUID) e indicizza userId per le query findAllByUserId.
// loggedOut e isRevoked vengono aggiornati durante logout e revoca.
import { Schema, model } from 'mongoose';

type SessionDocType = {
  _id: string;
  userId: string;
  tokenId: string;
  loggedIn: Date;
  expiresAt: Date;
  loggedOut: Date | null;
  isRevoked: boolean;
};

const sessionSchema = new Schema<SessionDocType>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true },
    loggedIn: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    loggedOut: { type: Date, default: null },
    isRevoked: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

export const SessionModel = model<SessionDocType>('Session', sessionSchema, 'sessions');
