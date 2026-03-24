const express = require('express');
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── POST /api/bets ────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  const { marketId, side, amount } = req.body;

  if (!marketId || !side || !amount) {
    return res.status(400).json({ error: 'marketId, side, and amount are required' });
  }
  if (!['YES', 'NO'].includes(side)) {
    return res.status(400).json({ error: 'side must be YES or NO' });
  }
  if (amount <= 0) {
    return res.status(400).json({ error: 'amount must be positive' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    const market = await prisma.market.findUnique({ where: { id: parseInt(marketId) } });
    if (!market) return res.status(404).json({ error: 'Market not found' });
    if (market.resolved) return res.status(400).json({ error: 'Market already resolved' });

    const prob = side === 'YES' ? market.yesProb / 100 : (100 - market.yesProb) / 100;
    const payout = parseFloat((amount / prob).toFixed(2));

    // Run as a transaction so balance and bet are always in sync
    const [bet, updatedUser, updatedMarket] = await prisma.$transaction([
      prisma.bet.create({
        data: {
          userId: req.userId,
          marketId: parseInt(marketId),
          side,
          amount,
          payout,
          entryProb: prob,
        },
      }),
      prisma.user.update({
        where: { id: req.userId },
        data: { balance: { decrement: amount } },
      }),
      prisma.market.update({
        where: { id: parseInt(marketId) },
        data: {
          yesProb: Math.min(93, Math.max(7, market.yesProb + (side === 'YES' ? 2 : -2))),
          volume: { increment: amount },
        },
      }),
    ]);

    res.status(201).json({
      bet,
      newBalance: updatedUser.balance,
      updatedMarket,
    });
  } catch (err) {
    console.error('Bet error:', err);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

// ── GET /api/bets/mine ────────────────────────────────────
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bets = await prisma.bet.findMany({
      where: { userId: req.userId },
      include: { market: true },
      orderBy: { placedAt: 'desc' },
    });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bets' });
  }
});

module.exports = router;
