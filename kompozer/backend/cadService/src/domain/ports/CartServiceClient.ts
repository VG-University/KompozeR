import { BomItem } from '../entities/Bom';

/** Outbound contract used to synchronize finalized BOM items into the cart service. */
export interface CartServiceClient {
  pushBomToCart(ownerId: string, items: BomItem[]): Promise<void>;
}
