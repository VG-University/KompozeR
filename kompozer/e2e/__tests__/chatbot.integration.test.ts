/**
 * [INT] chatbotService — test e2e attraverso il gateway (localhost:3000)
 */

export {};

const BASE = 'http://localhost:3000';
let guestToken = '';
let otherGuestToken = '';
let adminToken = '';

beforeAll(async () => {
  const guestRes = await fetch(`${BASE}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!guestRes.ok) {
    throw new Error(`[chatbot INT] guest token non disponibile (${guestRes.status})`);
  }
  guestToken = ((await guestRes.json()) as Record<string, unknown>)['token'] as string;

  const otherGuestRes = await fetch(`${BASE}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!otherGuestRes.ok) {
    throw new Error(`[chatbot INT] second guest token non disponibile (${otherGuestRes.status})`);
  }
  otherGuestToken = ((await otherGuestRes.json()) as Record<string, unknown>)['token'] as string;

  const adminLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'devuser', password: 'devpassword' }),
  });

  if (!adminLoginRes.ok) {
    throw new Error(`[chatbot INT] login admin fallito (${adminLoginRes.status})`);
  }
  adminToken = ((await adminLoginRes.json()) as Record<string, unknown>)['token'] as string;

  const sku = `INT-CHAT-${Date.now()}`;
  await fetch(`${BASE}/catalog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      sku,
      name: `Componente Chatbot ${sku}`,
      description: 'Creato per test chatbot',
      category: 'TONDO',
      Type: 'RIPIANO',
      price: 3499,
      isAvailable: true,
      imageUrl: '',
      dimensions: { widthMm: 700, heightMm: 20, depthMm: 300 },
      compatibleWith: [],
    }),
  });
});

describe('[INT] Chatbot — sessioni e Q&A base', () => {
  it('POST /chatbot/sessions -> 401 senza token', async () => {
    const res = await fetch(`${BASE}/chatbot/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(401);
  });

  it('crea sessione, invia domanda e chiude sessione', async () => {
    const createRes = await fetch(`${BASE}/chatbot/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({}),
    });

    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as Record<string, unknown>;
    const sessionId = created['id'] as string;
    expect(created['status']).toBe('ACTIVE');

    const messageRes = await fetch(`${BASE}/chatbot/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({ content: 'Hai componenti disponibili e prezzi?' }),
    });

    expect(messageRes.status).toBe(201);
    const msgBody = (await messageRes.json()) as Record<string, unknown>;
    expect((msgBody['botMessage'] as Record<string, unknown>)['content']).toEqual(expect.any(String));

    const listRes = await fetch(`${BASE}/chatbot/sessions/${sessionId}/messages`, {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as Record<string, unknown>;
    expect(Array.isArray(listBody['items'])).toBe(true);

    const otherUserListRes = await fetch(`${BASE}/chatbot/sessions/${sessionId}/messages`, {
      headers: { Authorization: `Bearer ${otherGuestToken}` },
    });
    expect([403, 404]).toContain(otherUserListRes.status);

    const closeRes = await fetch(`${BASE}/chatbot/sessions/${sessionId}/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guestToken}`,
      },
      body: JSON.stringify({}),
    });

    expect(closeRes.status).toBe(200);
    const closeBody = (await closeRes.json()) as Record<string, unknown>;
    expect(closeBody['status']).toBe('CLOSED');
  });
});
