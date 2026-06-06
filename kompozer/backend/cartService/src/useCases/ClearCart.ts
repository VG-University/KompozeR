import { CartRepository } from '../domain/ports/CartRepository';
import { ClearCartInput } from './types';

export class ClearCart {
  constructor(private readonly cartRepo: CartRepository) {}

  async execute(input: ClearCartInput): Promise<void> {
    await this.cartRepo.clear(input.userId);
  }
}
