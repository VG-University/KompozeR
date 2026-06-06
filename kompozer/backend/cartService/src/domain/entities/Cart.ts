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
  updatedAt: Date;
}

export function computeLineTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}
