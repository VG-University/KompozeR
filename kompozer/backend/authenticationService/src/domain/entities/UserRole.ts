/**
 * System user roles.
 *
 * Defines three access levels:
 * GUEST (anonymous guest session), BASE (standard registered user),
 * and ADMIN (elevated privileges).
 */
export enum UserRole {
  GUEST = 'GUEST',
  BASE = 'BASE',
  ADMIN = 'ADMIN',
}
