require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRouter    = require('./routes/auth');
const marketsRouter = require('./routes/markets');
const betsRouter    = require('./routes/bets');
const fundsRouter   = require('./routes/funds');

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// ── Request logger ────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',    authRouter);
app.use('/api/markets', marketsRouter);
app.use('/api/bets',    betsRouter);
app.use('/api/funds',   fundsRouter);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Birdie API running at http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
