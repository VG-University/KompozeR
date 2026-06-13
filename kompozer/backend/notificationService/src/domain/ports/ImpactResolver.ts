import { CatalogEvent } from '../entities/CatalogEvent';
import { NotificationContextType } from '../entities/Notification';

export interface ImpactedUser {
  userId: string;
  contextType: NotificationContextType;
  contextId: string;
}

export interface ImpactResolver {
  resolve(event: CatalogEvent): Promise<ImpactedUser[]>;
}
