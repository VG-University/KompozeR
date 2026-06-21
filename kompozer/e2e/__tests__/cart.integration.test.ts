/**
 * [INT] cartService — test e2e attraverso il gateway (localhost:3000)
 *
 * Dati persistiti su MongoDB dopo l'esecuzione — visibili in Compass:
 *   Connessione cart DB: mongodb://root:changeme@localhost:27019/?authSource=admin
 *   Collection:          cartdb.carts
 */

export {};

const BASE = 'http://localhost:3000';
const RUN = Date.now();
const SKU = `INT-CART-${RUN}`;

let adminToken = '';
let token = '';

beforeAll(async () => {
  const adminRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'devuser', password: 'devpassword' }),
  });

  if (!adminRes.ok) {
    throw new Error(`[cart INT] admin login fallito (${adminRes.status})`);
  }

  adminToken = ((await adminRes.json()) as Record<string, unknown>)['token'] as string;

  const guestRes = await fetch(`${BASE}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!guestRes.ok) {
    throw new Error(`[cart INT] guest token non disponibile (${guestRes.status})`);
  }

  token = ((await guestRes.json()) as Record<string, unknown>)['token'] as string;

  const createComponent = await fetch(`${BASE}/catalog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      sku: SKU,
      name: `Ripiano Cart ${RUN}`,
      description: 'Creato dal test e2e cart',
      category: 'TONDO',
      Type: 'RIPIANO',
      price: 2500,
      isAvailable: true,
      imageUrl: '',
      dimensions: { widthMm: 700, heightMm: 20, depthMm: 300 },
      compatibleWith: [],
    }),
  });

  if (!createComponent.ok) {
    throw new Error(`[cart INT] creazione componente fallita (${createComponent.status})`);
  }
});

describe('[INT] Cart — gestione carrello base', () => {
  it('GET /cart → 401 senza token', async () => {
    const res = await fetch(`${BASE}/cart`);
    expect(res.status).toBe(401);
  });

  it('PUT /cart/items/:sku → 200, aggiunge item e calcola totale', async () => {
    const res = await fetch(`${BASE}/cart/items/${SKU}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: `Ripiano Cart ${RUN}`,
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
    expect(items.some((i) => i['sku'] === SKU)).toBe(true);
    expect(body['total']).toBe(5000);
  });

  it('DELETE /cart/items/:sku → 200, rimuove item', async () => {
    const res = await fetch(`${BASE}/cart/items/${SKU}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    const items = body['items'] as Array<Record<string, unknown>>;
    expect(items.some((i) => i['sku'] === SKU)).toBe(false);
    expect(body['total']).toBe(0);
  });
});
