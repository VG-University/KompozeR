export const CATEGORIES = ['TONDO', 'QUADRO', 'KUBE'] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && CATEGORIES.includes(value as Category);
}
