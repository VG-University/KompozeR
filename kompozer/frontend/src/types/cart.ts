/** Cart domain contracts used by cart services, store, and views. */
export interface CartItem {
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface CheckoutResult {
  orderId: string;
  status: 'SUBMITTED';
  userId: string;
  items: CartItem[];
  total: number;
  submittedAt: string;
}
