const express = require('express');
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const PACKAGES = [
  { id: 'starter',    points: 500,  usdPrice: '4.99',  rate: '100 pts / $1' },
  { id: 'popular',    points: 1200, usdPrice: '9.99',  rate: '120 pts / $1' },
  { id: 'pro',        points: 2750, usdPrice: '19.99', rate: '137 pts / $1' },
  { id: 'best-value', points: 6000, usdPrice: '39.99', rate: '150 pts / $1' },
];

// ── GET /api/funds/packages ───────────────────────────────
router.get('/packages', (_req, res) => {
  res.json(PACKAGES);
});

// ── GET /api/funds/balance ────────────────────────────────
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// ── POST /api/funds/purchase ──────────────────────────────
router.post('/purchase', requireAuth, async (req, res) => {
  const { packageId, cardName, cardNumber, expiry, cvv } = req.body;

  if (!packageId) return res.status(400).json({ error: 'packageId is required' });
  if (!cardName || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({ error: 'All card fields are required' });
  }

  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) return res.status(404).json({ error: 'Package not found' });

  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { balance: { increment: pkg.points } },
    });
    res.json({ success: true, pointsAdded: pkg.points, newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

module.exports = router;
