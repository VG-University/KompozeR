export interface NotificationSubscriptionClient {
  ensureProductAvailabilitySubscription(ownerId: string, sku: string): Promise<void>;
}
