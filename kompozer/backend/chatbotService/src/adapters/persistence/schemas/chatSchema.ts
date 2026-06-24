import { Schema, model } from 'mongoose';

/** MongoDB document shape for chatbot sessions. */
export type ChatSessionDoc = {
  _id: string;
  userId: string;
  configurationId?: string;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
};

/** Embedded schema for chatbot session persistence. */
const chatSessionSchema = new Schema<ChatSessionDoc>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    configurationId: { type: String, required: false, index: true },
    status: { type: String, required: true, enum: ['ACTIVE', 'CLOSED'] },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true, index: true },
  },
  { _id: false },
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });

export const ChatSessionModel = model<ChatSessionDoc>(
  'ChatSession',
  chatSessionSchema,
  'chatSessions',
);

/** MongoDB document shape for chatbot messages. */
export type ChatMessageDoc = {
  _id: string;
  sessionId: string;
  role: 'USER' | 'BOT';
  content: string;
  userId: string | null;
  createdAt: Date;
};

/** Embedded schema for chatbot message persistence. */
const chatMessageSchema = new Schema<ChatMessageDoc>(
  {
    _id: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    role: { type: String, required: true, enum: ['USER', 'BOT'] },
    content: { type: String, required: true },
    userId: { type: String, required: false, default: null },
    createdAt: { type: Date, required: true, index: true },
  },
  { _id: false },
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessageModel = model<ChatMessageDoc>(
  'ChatMessage',
  chatMessageSchema,
  'chatMessages',
);
