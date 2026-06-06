// globalSetup.js — Plain CJS, eseguito una volta prima di tutti i test.
// 1. Verifica che il gateway su localhost:3000 sia raggiungibile.
// 2. Esegue il seed idempotente dell'admin (devuser) su authdb,
//    in modo che i test catalog abbiano sempre un ADMIN disponibile.
//
// Prerequisito: docker compose -f docker-compose.dev.yml up

const http         = require('http');
const { execSync } = require('child_process');
const path         = require('path');
const fs           = require('fs');

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

function requestGateway(pathname, method = 'GET', headers = {}, body = null) {
  return new Promise(resolve => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: pathname,
        method,
        headers,
      },
      res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch {
            parsed = null;
          }
          resolve({ status: res.statusCode || 0, body: parsed, raw: data });
        });
      },
    );

    req.on('error', () => resolve({ status: 0, body: null, raw: '' }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ status: 0, body: null, raw: '' });
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function resolveNpmCommand() {
  if (process.platform !== 'win32') {
    return 'npm';
  }

  const candidates = [
    process.env.npm_execpath,
    'C:/Program Files/nodejs/npm.cmd',
    'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = candidate.replace(/\\/g, '/');
    if (fs.existsSync(normalized)) {
      if (normalized.endsWith('npm-cli.js')) {
        return `"${process.execPath}" "${normalized}"`;
      }
      return `"${normalized}"`;
    }
  }

  return 'npm.cmd';
}

function withNodeInPath(env) {
  const nodeDir = path.dirname(process.execPath);
  const currentPath = env.PATH || env.Path || '';
  const joined = currentPath ? `${nodeDir};${currentPath}` : nodeDir;
  return {
    ...env,
    PATH: joined,
    Path: joined,
  };
}

// ── globalSetup ──────────────────────────────────────────────────────────────

module.exports = async function globalSetup() {
  // ── 1. Attendi il gateway (max 30 s) ─────────────────────────────────────
  const timeoutMs = 30000;
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

  // ── 1b. Attendi auth via endpoint pubblico reale: POST /auth/guest ─────
  process.stdout.write('[e2e] Attendo auth (POST /auth/guest)');
  let guestToken = '';
  while (Date.now() - start < timeoutMs) {
    const res = await requestGateway('/auth/guest', 'POST', {
      'Content-Type': 'application/json',
    });
    if (res.status === 200 && res.body && typeof res.body.token === 'string') {
      guestToken = res.body.token;
      break;
    }
    process.stdout.write('.');
    await sleep(1000);
  }
  process.stdout.write(guestToken ? ' OK\n' : ' FAIL\n');

  if (!guestToken) {
    throw new Error(
      '\n[e2e] auth non pronto entro timeout (POST /auth/guest non riuscito).\n',
    );
  }

  // ── 1c. Attendi catalog via endpoint reale protetto: GET /catalog ───────
  process.stdout.write('[e2e] Attendo catalog (GET /catalog con token guest)');
  let catalogReady = false;
  while (Date.now() - start < timeoutMs) {
    const res = await requestGateway('/catalog', 'GET', {
      Authorization: `Bearer ${guestToken}`,
    });
    if (res.status === 200) {
      catalogReady = true;
      break;
    }
    process.stdout.write('.');
    await sleep(1000);
  }
  process.stdout.write(catalogReady ? ' OK\n' : ' FAIL\n');

  if (!catalogReady) {
    throw new Error(
      '\n[e2e] catalog non pronto entro timeout (GET /catalog non riuscito).\n',
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
    const npmCmd = resolveNpmCommand();
    execSync(`${npmCmd} run seed`, {
      cwd:   authServiceDir,
      shell: true,
      env: withNodeInPath({
        ...process.env,
        MONGO_URI:   'mongodb://root:changeme@localhost:27017/authdb?authSource=admin',
        JWT_SECRET:  'kompozer-dev-secret-key-32-chars!!',
      }),
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
