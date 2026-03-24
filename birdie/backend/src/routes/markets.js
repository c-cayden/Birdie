const express = require('express');
const prisma = require('../lib/prisma');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/markets ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.category && req.query.category !== 'All') {
      where.category = req.query.category;
    }
    const markets = await prisma.market.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(markets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load markets' });
  }
});

// ── GET /api/markets/:id ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const market = await prisma.market.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!market) return res.status(404).json({ error: 'Market not found' });
    res.json(market);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load market' });
  }
});

// ── POST /api/markets ─────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  const { title, category, yesProb, volume } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'title and category are required' });
  }
  try {
    const market = await prisma.market.create({
      data: {
        title,
        category,
        yesProb: yesProb ?? 50,
        volume: volume ?? 0,
      },
    });
    res.status(201).json(market);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create market' });
  }
});

// ── POST /api/markets/generate ────────────────────────────
router.post('/generate', requireAuth, async (req, res) => {
  const { topic, apiKey } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

  const SYSTEM = `You are a prediction market maker for Birdie, a Kalshi-style betting platform.
Use the web_search tool to research current real-world events, then create 4-6 YES/NO prediction markets.
Respond ONLY with a JSON array — no markdown, no backticks, no preamble:
[{"title":"Will X happen by Y date?","category":"Finance","yesProb":62,"volume":45000}]
Rules:
- title: clear YES/NO question with specific conditions or dates
- category: one of Finance | Crypto | Sports | Tech | Politics | Economy | Entertainment | Science | HorseRacing
- yesProb: realistic integer 5-95
- volume: realistic integer 5000-250000
- Ground every market in real current events found via search`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: SYSTEM,
        messages: [{ role: 'user', content: `Create prediction markets about: ${topic}. Search for current news first.` }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const block = data.content.find(b => b.type === 'text');
    if (!block) return res.status(502).json({ error: 'No text in AI response' });

    let raw = block.text.trim().replace(/```json|```/g, '').trim();
    const start = raw.indexOf('['), end = raw.lastIndexOf(']');
    if (start < 0 || end < 0) return res.status(502).json({ error: 'Could not parse AI response' });

    const parsed = JSON.parse(raw.slice(start, end + 1));

    const created = await Promise.all(
      parsed.map(m =>
        prisma.market.create({
          data: {
            title: m.title,
            category: m.category,
            yesProb: Math.min(95, Math.max(5, m.yesProb)),
            volume: m.volume || 0,
          },
        })
      )
    );

    res.json(created);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
