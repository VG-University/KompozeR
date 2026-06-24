/** Outbound contract for creating availability subscriptions after finalize. */
export interface NotificationSubscriptionClient {
  ensureProductAvailabilitySubscription(ownerId: string, sku: string): Promise<void>;
}
