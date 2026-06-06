import { CartItem } from '../domain/entities/Cart';

export interface GetCartInput {
  userId: string;
}

export interface GetCartOutput {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: Date;
}

export interface UpsertCartItemInput {
  userId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface RemoveCartItemInput {
  userId: string;
  sku: string;
}

export interface ClearCartInput {
  userId: string;
}
