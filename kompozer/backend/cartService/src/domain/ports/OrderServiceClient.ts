/**
 * Domain port for submitting orders during checkout.
 */
import { CartItem } from '../entities/Cart';

export interface SubmitOrderInput {
  userId: string;
  items: CartItem[];
  total: number;
}

export interface SubmitOrderOutput {
  orderId: string;
  status: 'SUBMITTED';
  submittedAt: Date;
}

export interface OrderServiceClient {
  submitOrder(input: SubmitOrderInput): Promise<SubmitOrderOutput>;
}
