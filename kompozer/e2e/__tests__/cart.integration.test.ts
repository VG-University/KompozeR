/**
 * [INT] cartService — test e2e attraverso il gateway (localhost:3000)
 *
 * Dati persistiti su MongoDB dopo l'esecuzione — visibili in Compass:
 *   Connessione cart DB: mongodb://root:changeme@localhost:27019/?authSource=admin
 *   Collection:          cartdb.carts
 */

export {};

const BASE = 'http://localhost:3000';
let token = '';

beforeAll(async () => {
  const guestRes = await fetch(`${BASE}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!guestRes.ok) {
    throw new Error(`[cart INT] guest token non disponibile (${guestRes.status})`);
  }

  token = ((await guestRes.json()) as Record<string, unknown>)['token'] as string;
});

describe('[INT] Cart — gestione carrello base', () => {
  it('GET /cart → 401 senza token', async () => {
    const res = await fetch(`${BASE}/cart`);
    expect(res.status).toBe(401);
  });

  it('PUT /cart/items/:sku → 200, aggiunge item e calcola totale', async () => {
    const res = await fetch(`${BASE}/cart/items/INT-SKU-001`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Ripiano integrazione',
        unitPrice: 2500,
        quantity: 2,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['total']).toBe(5000);
  });

  it('GET /cart → 200, restituisce item appena aggiunto', async () => {
    const res = await fetch(`${BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    const items = body['items'] as Array<Record<string, unknown>>;
    expect(Array.isArray(items)).toBe(true);
    expect(items.some((i) => i['sku'] === 'INT-SKU-001')).toBe(true);
    expect(body['total']).toBe(5000);
  });

  it('DELETE /cart/items/:sku → 200, rimuove item', async () => {
    const res = await fetch(`${BASE}/cart/items/INT-SKU-001`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    const items = body['items'] as Array<Record<string, unknown>>;
    expect(items.some((i) => i['sku'] === 'INT-SKU-001')).toBe(false);
    expect(body['total']).toBe(0);
  });
});
