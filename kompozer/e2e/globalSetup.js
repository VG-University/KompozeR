// globalSetup.js — Plain CJS, eseguito una volta prima di tutti i test.
// 1. Verifica che il gateway su localhost:3000 sia raggiungibile.
// 2. Esegue il seed idempotente dell'admin (devuser) su authdb,
//    in modo che i test catalog abbiano sempre un ADMIN disponibile.
//
// Prerequisito: docker compose -f docker-compose.dev.yml up

const http         = require('http');
const { execSync } = require('child_process');
const path         = require('path');

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkGateway() {
  return new Promise(resolve => {
    http
      // Il gateway risponde 200 se tutti i servizi sono up, 207 se alcuni sono down.
      // In dev con soli 3 servizi implementati, 207 è atteso e sufficiente.
      .get('http://localhost:3000/health', res => resolve(res.statusCode < 500))
      .on('error', () => resolve(false));
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── globalSetup ──────────────────────────────────────────────────────────────

module.exports = async function globalSetup() {
  // ── 1. Attendi il gateway (max 15 s) ─────────────────────────────────────
  const timeoutMs = 15000;
  const start     = Date.now();
  let up          = false;

  process.stdout.write('\n[e2e] Verifica gateway su localhost:3000');
  while (Date.now() - start < timeoutMs) {
    up = await checkGateway();
    if (up) break;
    process.stdout.write('.');
    await sleep(1000);
  }
  process.stdout.write(up ? ' OK\n' : ' FAIL\n');

  if (!up) {
    throw new Error(
      '\n[e2e] Gateway non raggiungibile su localhost:3000.\n' +
      'Assicurati che i container siano in esecuzione:\n' +
      '  cd kompozer && docker compose -f docker-compose.dev.yml up\n',
    );
  }

  // ── 2. Seed admin idempotente ─────────────────────────────────────────────
  // Crea/aggiorna devuser (ADMIN) in authdb usando lo script seed del servizio.
  // Il seed legge DEVUSER.json e fa upsert — rieseguibile senza effetti collaterali.
  const authServiceDir = path.resolve(
    __dirname, '..', 'backend', 'authenticationService',
  );

  process.stdout.write('[e2e] Seed admin (devuser in authdb)...');
  try {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execSync(`${npmCmd} run seed`, {
      cwd:   authServiceDir,
      shell: true,
      env: {
        ...process.env,
        MONGO_URI:   'mongodb://root:changeme@localhost:27017/authdb?authSource=admin',
        JWT_SECRET:  'kompozer-dev-secret-key-32-chars!!',
      },
      stdio: 'pipe',
    });
    process.stdout.write(' OK\n');
  } catch (err) {
    process.stdout.write(' WARN\n');
    const msg = err.stderr ? err.stderr.toString().trim() : String(err.message);
    process.stderr.write(
      `[e2e] Seed fallito — i test ADMIN potrebbero fallire.\n  ${msg}\n`,
    );
  }
};
