// userSchema — Schema Mongoose per la collection `users`.
// Definisce la struttura del documento MongoDB per gli utenti.
// Usa _id: String (UUID) invece del default ObjectId per coerenza con il modello di dominio.
// I campi createdAt e updatedAt sono gestiti automaticamente dall'opzione timestamps.
import { Schema, model } from 'mongoose';
import { UserRole } from '../../../domain/entities/UserRole';

type UserDocType = {
  _id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocType>(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, _id: false },
);

export const UserModel = model<UserDocType>('User', userSchema, 'users');
