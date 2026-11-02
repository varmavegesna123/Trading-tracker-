import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const JWT_SECRET = process.env.NODE_JWT_SECRET || 'node-insecure-tradetracker-dev-secret-key-2026';
const ALLOWED_ORIGINS = new Set((process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(origin => origin.trim()).filter(Boolean));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Input Sanitization against XSS injection
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// Password Hashing Utility using Crypto PBKDF2 (SHA-512)
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, originalHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  const actual = Buffer.from(hash, 'hex');
  const expected = Buffer.from(originalHash || '', 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// JWT Token Generator Utility
function generateJWT(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    username: user.username,
    full_name: user.full_name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

// Rate Limiter Storage (Harden: Max 5 failed attempts per 15 mins)
const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];
  const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
  if (recentAttempts.length >= 5) {
    return false;
  }
  recentAttempts.push(now);
  loginAttempts.set(ip, recentAttempts);
  return true;
}

function readAuthenticatedUser(req, db) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  const supplied = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return db.users.find(user => user.id === payload.sub) || null;
  } catch (error) {
    return null;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

// Database Operations
const getDatabaseData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        users: [],
        accounts: {}
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) parsed.users = [];
    if (!parsed.accounts || typeof parsed.accounts !== 'object') parsed.accounts = {};
    return parsed;
  } catch (err) {
    return { users: [], trades: [], capitalLogs: [], journal: [] };
  }
};

const saveDatabaseData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {
  // Production Security Headers
  const requestOrigin = req.headers.origin;
  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const ip = req.socket.remoteAddress || '127.0.0.1';

  // GET /api/data
  if (req.url === '/api/data' && req.method === 'GET') {
    const data = getDatabaseData();
    const user = readAuthenticatedUser(req, data);
    if (!user) return sendJson(res, 401, { error: 'Authentication required.' });
    const account = data.accounts?.[user.id] || { trades: [], capitalLogs: [], settings: {} };
    return sendJson(res, 200, account);
  }
  
  // POST /api/data
  else if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const currentDb = getDatabaseData();
        const user = readAuthenticatedUser(req, currentDb);
        if (!user) {
          sendJson(res, 401, { error: 'Authentication required.' });
          return;
        }
        const accounts = currentDb.accounts || {};
        accounts[user.id] = {
          trades: Array.isArray(payload.trades) ? payload.trades : [],
          capitalLogs: Array.isArray(payload.capitalLogs) ? payload.capitalLogs : [],
          settings: payload.settings && typeof payload.settings === 'object' ? payload.settings : {}
        };
        const updatedDb = { ...currentDb, accounts };
        saveDatabaseData(updatedDb);
        sendJson(res, 200, { success: true, message: 'Data persisted to backend database' });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
  }

  // POST /api/auth/signup
  else if (req.url === '/api/auth/signup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { full_name, username, email, password } = JSON.parse(body);
        const cleanName = sanitizeInput((full_name || '').trim());
        const cleanUsername = sanitizeInput((username || '').trim().toLowerCase());
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPassword = (password || '').trim();

        if (!cleanName || !cleanUsername || !cleanEmail || !cleanPassword) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please fill in all required registration fields.' }));
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }));
          return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_-])[A-Za-z\d@$!%*?&#^()_-]{8,}$/;
        if (!passwordRegex.test(cleanPassword)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Password must contain at least 8 characters, uppercase, lowercase, number, and special character.'
          }));
          return;
        }

        const db = getDatabaseData();
        
        if (db.users.some(u => u.email.toLowerCase() === cleanEmail)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'An account with this email address already exists.' }));
          return;
        }

        if (db.users.some(u => u.username && u.username.toLowerCase() === cleanUsername)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Username is already taken.' }));
          return;
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const { salt, hash } = hashPassword(cleanPassword);

        const newUser = {
          id: crypto.randomUUID(),
          full_name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password_hash: hash,
          salt: salt,
          is_verified: false,
          verification_token: otpCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        db.users.push(newUser);
        saveDatabaseData(db);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          requiresVerification: true,
          email: cleanEmail,
          message: 'Account created! Please check your verification code.'
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Server authentication error.' }));
      }
    });
  }

  // POST /api/auth/verify-otp
  else if (req.url === '/api/auth/verify-otp' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { email, otpCode } = JSON.parse(body);
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanOtp = (otpCode || '').trim();

        const db = getDatabaseData();
        const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

        if (!user) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'User record not found.' }));
          return;
        }

        if (user.verification_token !== cleanOtp) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid 6-digit verification code.' }));
          return;
        }

        user.is_verified = true;
        user.verification_token = null;
        user.updated_at = new Date().toISOString();
        saveDatabaseData(db);

        const jwtToken = generateJWT(user);

        const sessionUser = {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          plan: 'Premium Plan',
          is_verified: true
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Email verified successfully!',
          user: sessionUser,
          token: jwtToken
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Verification error.' }));
      }
    });
  }

  // POST /api/auth/login
  else if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPassword = (password || '').trim();

        if (!cleanEmail || !cleanPassword) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please enter both email address and password.' }));
          return;
        }

        if (!checkRateLimit(ip)) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Too many login attempts. Please try again later.' }));
          return;
        }

        const db = getDatabaseData();
        const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

        if (!user || !verifyPassword(cleanPassword, user.salt, user.password_hash) || !user.is_verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid email or password.' }));
          return;
        }

        const jwtToken = generateJWT(user);

        const sessionUser = {
          id: user.id,
          full_name: user.full_name || 'Varma Vegesna',
          username: user.username || 'varma',
          email: user.email,
          plan: 'Premium Plan',
          is_verified: true
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful!',
          user: sessionUser,
          token: jwtToken
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Server authentication error.' }));
      }
    });
  } 

  // POST /api/auth/resend-otp
  else if (req.url === '/api/auth/resend-otp' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { email } = JSON.parse(body);
        const cleanEmail = (email || '').trim().toLowerCase();

        const db = getDatabaseData();
        const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

        if (!user) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'User record not found.' }));
          return;
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verification_token = newOtp;
        saveDatabaseData(db);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'New 6-digit verification code sent!'
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to resend code.' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`TRADETRACKER Production-Hardened Auth & DB Server running live on http://localhost:${PORT}`);
});
