/**
 * Mongoose schema for the `sessions` collection.
 *
 * Defines the MongoDB document shape for authenticated sessions.
 * Uses _id: String (UUID) and indexes userId for findAllByUserId queries.
 * loggedOut and isRevoked are updated during logout and revocation flows.
 */
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
    tokenId: { type: String, required: true, index: true },
    loggedIn: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    loggedOut: { type: Date, default: null },
    isRevoked: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

export const SessionModel = model<SessionDocType>('Session', sessionSchema, 'sessions');
