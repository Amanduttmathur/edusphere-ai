'use strict';

const http = require('node:http');
const { readFileSync } = require('node:fs');
const { randomBytes, createHash, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const { Worker } = require('node:worker_threads');

const deriveKey = promisify(scrypt);
const db = new DatabaseSync(process.env.DATABASE_PATH || path.join(__dirname, 'edusphere.sqlite'));
const secureCookies = process.env.NODE_ENV === 'production';
const sessionAge = 7 * 24 * 60 * 60;
const model = process.env.OPENAI_MODEL;
const apiKey = process.env.OPENAI_API_KEY;

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    expires INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS study (
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    lesson_id TEXT NOT NULL,
    saved INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (account_id, lesson_id)
  );
`);

const staticFiles = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/lab.html', ['lab.html', 'text/html']],
  ['/lab.js', ['lab.js', 'text/javascript']]
].map(([url, [filename, type]]) => [url, {
  type, content: readFileSync(path.join(__dirname, filename))
}]));
const lessonIds = new Set(Array.from(
  staticFiles.get('/app.js').content.toString().matchAll(/id: '([a-z-]+)'/g), match => match[1]
));
const attempts = new Map();

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

function limit(key, maximum, interval) {
  const now = Date.now();
  if (attempts.size >= 10000) {
    for (const [entry, quota] of attempts) {
      if (quota.until <= now) attempts.delete(entry);
    }
    if (attempts.size >= 10000 && !attempts.has(key)) fail(429, 'Try again later.');
  }
  const quota = attempts.get(key);
  if (!quota || quota.until <= now) {
    attempts.set(key, { count: 1, until: now + interval });
  } else if (quota.count >= maximum) {
    fail(429, 'Too many requests. Try again later.');
  } else {
    quota.count += 1;
  }
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function cookie(token, age) {
  return `edusphere_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secureCookies ? '; Secure' : ''}`;
}

function sessionToken(req) {
  return (req.headers.cookie || '').match(/(?:^|; *)edusphere_session=([a-f0-9]{64})(?:;|$)/)?.[1];
}

function accountFor(req) {
  const token = sessionToken(req);
  if (!token) return undefined;
  return db.prepare(`
    SELECT accounts.id, accounts.username FROM accounts
    JOIN sessions ON sessions.account_id = accounts.id
    WHERE token_hash = ? AND expires > unixepoch()
  `).get(tokenHash(token));
}

function startSession(res, accountId) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires <= unixepoch()').run();
  db.prepare('INSERT INTO sessions VALUES (?, ?, unixepoch() + ?)').run(tokenHash(token), accountId, sessionAge);
  res.setHeader('Set-Cookie', cookie(token, sessionAge));
}

async function readJson(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'Cross-site request.');
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) {
    fail(415, 'Expected JSON.');
  }
  let length = 0;
  const chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length <= 32768) chunks.push(chunk);
  }
  if (length > 32768) fail(413, 'Request is too large.');
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString());
    if (!data || Array.isArray(data) || typeof data !== 'object') fail(400, 'Expected a JSON object.');
    return data;
  } catch {
    fail(400, 'Invalid JSON request.');
  }
}

async function authenticate(req, res, register) {
  limit(`auth:${req.socket.remoteAddress}`, 20, 15 * 60_000);
  const { username, password } = await readJson(req);
  if (typeof username !== 'string' || !/^[a-z0-9_]{3,30}$/i.test(username) ||
      typeof password !== 'string' || password.length < 12 || password.length > 128) {
    fail(400, 'Use a username of 3–30 letters, numbers, or underscores and a password of 12–128 characters.');
  }
  const normalized = username.toLowerCase();
  const account = db.prepare('SELECT * FROM accounts WHERE username = ?').get(normalized);
  const salt = register ? randomBytes(16).toString('hex') : account?.salt || 'unused-account-salt';
  const hash = await deriveKey(password, salt, 64);
  if (register) {
    const result = db.prepare('INSERT OR IGNORE INTO accounts (username, salt, password_hash) VALUES (?, ?, ?)')
      .run(normalized, salt, hash.toString('hex'));
    if (!result.changes) fail(409, 'That username is already registered.');
    startSession(res, result.lastInsertRowid);
  } else {
    const expected = account ? Buffer.from(account.password_hash, 'hex') : Buffer.alloc(64);
    if (!timingSafeEqual(hash, expected) || !account) fail(401, 'Incorrect username or password.');
    startSession(res, account.id);
  }
  return { username: normalized };
}

function studyRows(accountId) {
  return db.prepare('SELECT lesson_id, saved, completed, note FROM study WHERE account_id = ?').all(accountId);
}

async function updateStudy(req, accountId) {
  const { lessonId, saved, completed, note } = await readJson(req);
  if (!lessonIds.has(lessonId) || (saved !== undefined && typeof saved !== 'boolean') ||
      (completed !== undefined && completed !== true) ||
      (note !== undefined && (typeof note !== 'string' || note.length > 4000))) {
    fail(400, 'Invalid lesson update.');
  }
  db.prepare(`
    INSERT INTO study (account_id, lesson_id, saved, completed, note)
    VALUES (?, ?, coalesce(?, 0), coalesce(?, 0), coalesce(?, ''))
    ON CONFLICT(account_id, lesson_id) DO UPDATE SET
      saved = coalesce(?, saved),
      completed = max(completed, coalesce(?, 0)),
      note = coalesce(?, note)
  `).run(accountId, lessonId, saved == null ? null : Number(saved), completed ? 1 : null,
    note ?? null, saved == null ? null : Number(saved), completed ? 1 : null, note ?? null);
  return { ok: true };
}

async function chat(req, accountId) {
  if (!apiKey || !model) fail(503, 'AI chat is not configured on this server.');
  const { question, lesson } = await readJson(req);
  if (typeof question !== 'string' || !question.trim() || question.length > 1000 ||
      typeof lesson !== 'string' || lesson.length > 1000) fail(400, 'Enter a question of up to 1,000 characters.');
  limit(`chat:${accountId}`, 10, 60 * 60_000);
  limit('chat:all', 60, 60 * 60_000);
  let response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, store: false, max_output_tokens: 500,
        instructions: 'You are a study tutor. Help the learner understand the current lesson. Give a concise explanation and a short example when useful.',
        input: `Lesson context:\n${lesson}\n\nLearner question:\n${question}`
      }),
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) fail(502, 'The AI provider could not answer. Try again later.');
    const data = await response.json();
    const answer = data.output?.flatMap(item => item.type === 'message' ? item.content : [])
      .filter(part => part?.type === 'output_text').map(part => part.text).join('\n').trim();
    if (!answer) fail(502, 'The AI provider returned no answer.');
    return { answer };
  } catch (error) {
    if (error.status) throw error;
    fail(502, 'The AI provider is temporarily unavailable.');
  }
}

let activeLabQueries = 0;

async function evaluateSql(req) {
  const {sql, task} = await readJson(req);
  if (typeof sql !== 'string' || !/^\s*(SELECT|WITH)\b/i.test(sql) || sql.length > 3000 ||
      !Number.isInteger(task) || task < 0 || task > 2) {
    fail(400, 'Enter a SELECT or WITH query of up to 3,000 characters.');
  }
  limit(`sql:${req.socket.remoteAddress}`, 60, 60_000);
  if (activeLabQueries >= 4) fail(503, 'The SQL lab is busy. Try again in a moment.');
  const worker = new Worker(path.join(__dirname, 'lab-worker.js'), {
    workerData: {sql, task}, resourceLimits: {maxOldGenerationSizeMb: 32}
  });
  activeLabQueries += 1;
  let timeout;
  try {
    const result = await new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Query timed out. Simplify it and try again.')), 1500);
      worker.once('message', resolve);
      worker.once('error', () => reject(new Error('The query could not be evaluated.')));
      worker.once('exit', () => reject(new Error('The query could not be evaluated.')));
    });
    if (result.error) fail(400, result.error);
    return result;
  } catch (error) {
    if (error.status) throw error;
    fail(400, error.message);
  } finally {
    clearTimeout(timeout);
    // Keep the slot occupied until SQLite finishes any native work.
    void worker.terminate().finally(() => { activeLabQueries -= 1; });
  }
}

async function api(req, res, route) {
  const name = `${req.method} ${route}`;
  if (name === 'POST /api/lab/query') return evaluateSql(req);
  if (name === 'POST /api/register') return authenticate(req, res, true);
  if (name === 'POST /api/login') return authenticate(req, res, false);
  if (name === 'POST /api/logout') {
    await readJson(req);
    const token = sessionToken(req);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token));
    res.setHeader('Set-Cookie', cookie('', 0));
    return { ok: true };
  }
  const account = accountFor(req);
  if (name === 'GET /api/session') return {
    username: account?.username ?? null, chatEnabled: Boolean(apiKey && model)
  };
  if (!account) fail(401, 'Sign in to use this feature.');
  if (name === 'GET /api/study') return { lessons: studyRows(account.id) };
  if (name === 'PATCH /api/study') return updateStudy(req, account.id);
  if (name === 'POST /api/chat') return chat(req, account.id);
  fail(404, 'Not found.');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; form-action 'self'");
  const route = req.url?.split('?')[0];
  const file = staticFiles.get(route);
  if (file && (req.method === 'GET' || req.method === 'HEAD')) {
    res.setHeader('Content-Type', `${file.type}; charset=utf-8`);
    res.end(req.method === 'HEAD' ? undefined : file.content);
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!route?.startsWith('/api/')) fail(404, 'Not found.');
    res.end(JSON.stringify(await api(req, res, route)));
  } catch (error) {
    res.statusCode = error.status || 500;
    if (!error.status) console.error('EduSphere API error:', error.code || error.name);
    res.end(JSON.stringify({ error: error.status ? error.message : 'Unexpected server error.' }));
  }
});

server.requestTimeout = 30000;
server.listen(Number(process.env.PORT || 8000), process.env.HOST || '127.0.0.1', () => {
  console.log(`EduSphere AI listening on port ${server.address().port}`);
});
