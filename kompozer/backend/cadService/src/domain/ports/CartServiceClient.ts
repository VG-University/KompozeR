import { BomItem } from '../entities/Bom';

export interface CartServiceClient {
  pushBomToCart(ownerId: string, items: BomItem[]): Promise<void>;
}
