const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MARKETS = [
  // ── HORSE RACING ──────────────────────────────────────────
  { title: 'Will the 2026 Kentucky Derby winner also win the Preakness Stakes?', category: 'HorseRacing', yesProb: 38, volume: 245000 },
  { title: 'Will there be a Triple Crown winner in 2026?', category: 'HorseRacing', yesProb: 12, volume: 410000 },
  { title: 'Will a first-time Derby entrant win the 2026 Kentucky Derby?', category: 'HorseRacing', yesProb: 55, volume: 134000 },
  { title: 'Will the 2026 Kentucky Derby winning time be under 2 minutes?', category: 'HorseRacing', yesProb: 44, volume: 76000 },
  { title: 'Will a filly win the 2026 Kentucky Derby?', category: 'HorseRacing', yesProb: 10, volume: 198000 },

  // ── SPORTS ────────────────────────────────────────────────
  { title: 'Will a Big Ten team win the 2026 NCAA March Madness championship?', category: 'Sports', yesProb: 58, volume: 312000 },
  { title: 'Will Iowa make the 2026 NCAA Men\'s Final Four after upsetting No. 1 Florida?', category: 'Sports', yesProb: 34, volume: 187000 },
  { title: 'Will the 2026 NCAA Championship game be decided by 5 points or fewer?', category: 'Sports', yesProb: 31, volume: 98000 },
  { title: 'Will the Oklahoma City Thunder win the 2026 NBA Championship?', category: 'Sports', yesProb: 28, volume: 245000 },
  { title: 'Will LeBron James retire before the start of the 2026-27 NBA season?', category: 'Sports', yesProb: 41, volume: 178000 },
  { title: 'Will the Kansas City Chiefs win Super Bowl LXI in February 2027?', category: 'Sports', yesProb: 18, volume: 320000 },
  { title: 'Will Lewis Hamilton win a Formula 1 race for Ferrari in the 2026 season?', category: 'Sports', yesProb: 62, volume: 176000 },
  { title: 'Will the 2026 FIFA World Cup in the US, Canada and Mexico break attendance records?', category: 'Sports', yesProb: 71, volume: 134000 },

  // ── FINANCE ───────────────────────────────────────────────
  { title: 'Will the Federal Reserve cut interest rates at their May 2026 meeting?', category: 'Finance', yesProb: 42, volume: 198000 },
  { title: 'Will the S&P 500 recover above 5,500 before end of Q2 2026?', category: 'Finance', yesProb: 49, volume: 312000 },
  { title: 'Will gold prices exceed $4,600 per ounce before July 2026?', category: 'Finance', yesProb: 51, volume: 167000 },
  { title: 'Will oil prices stay above $100 per barrel through Q2 2026?', category: 'Finance', yesProb: 63, volume: 142000 },
  { title: 'Will the US dollar index fall below 95 by end of 2026?', category: 'Finance', yesProb: 37, volume: 88000 },

  // ── CRYPTO ────────────────────────────────────────────────
  { title: 'Will Bitcoin recover above $80,000 before May 2026?', category: 'Crypto', yesProb: 44, volume: 389000 },
  { title: 'Will the CLARITY Act pass the US Senate before end of 2026?', category: 'Crypto', yesProb: 61, volume: 245000 },
  { title: 'Will Ethereum break above $2,200 before June 2026?', category: 'Crypto', yesProb: 38, volume: 198000 },
  { title: 'Will the SEC approve tokenized securities trading on Nasdaq in 2026?', category: 'Crypto', yesProb: 72, volume: 134000 },
  { title: 'Will Bitcoin hit a new all-time high above $108,000 before end of 2026?', category: 'Crypto', yesProb: 39, volume: 412000 },

  // ── POLITICS ──────────────────────────────────────────────
  { title: 'Will the US and Iran reach a diplomatic agreement before end of 2026?', category: 'Politics', yesProb: 28, volume: 389000 },
  { title: 'Will a bipartisan bill banning sports betting on prediction markets pass Congress in 2026?', category: 'Politics', yesProb: 22, volume: 134000 },
  { title: 'Will Trump travel to China before end of April 2026?', category: 'Politics', yesProb: 58, volume: 178000 },
  { title: 'Will any NATO country formally leave the alliance before 2027?', category: 'Politics', yesProb: 8, volume: 245000 },

  // ── ECONOMY ───────────────────────────────────────────────
  { title: 'Will US inflation fall below 3% by end of Q2 2026?', category: 'Economy', yesProb: 41, volume: 167000 },
  { title: 'Will the US enter a technical recession in 2026?', category: 'Economy', yesProb: 38, volume: 289000 },
  { title: 'Will US tariffs on Chinese goods be reduced before July 2026?', category: 'Economy', yesProb: 34, volume: 198000 },
  { title: 'Will US unemployment exceed 5% at any point in 2026?', category: 'Economy', yesProb: 31, volume: 134000 },

  // ── TECH ──────────────────────────────────────────────────
  { title: 'Will OpenAI release GPT-5 before July 2026?', category: 'Tech', yesProb: 68, volume: 198000 },
  { title: 'Will Apple announce an AI-native device (not iPhone or Mac) in 2026?', category: 'Tech', yesProb: 29, volume: 134000 },
  { title: 'Will Morgan Stanley\'s Bitcoin ETF (MSBT) reach $1B in assets by end of 2026?', category: 'Tech', yesProb: 54, volume: 89000 },
  { title: 'Will any AI company be valued above $5 trillion before end of 2026?', category: 'Tech', yesProb: 33, volume: 245000 },

  // ── ENTERTAINMENT ─────────────────────────────────────────
  { title: 'Will the next James Bond film be released before end of 2026?', category: 'Entertainment', yesProb: 37, volume: 88000 },
  { title: 'Will the 2026 Oscars Best Picture winner be an AI-assisted production?', category: 'Entertainment', yesProb: 14, volume: 67000 },
  { title: 'Will a video game adaptation win a major Emmy award in 2026?', category: 'Entertainment', yesProb: 26, volume: 54000 },

  // ── SCIENCE ───────────────────────────────────────────────
  { title: 'Will SpaceX land humans on the Moon before end of 2026?', category: 'Science', yesProb: 19, volume: 312000 },
  { title: 'Will a major AI lab publish a peer-reviewed AGI breakthrough paper in 2026?', category: 'Science', yesProb: 21, volume: 245000 },
  { title: 'Will US-Iran conflict push oil above $130 per barrel before June 2026?', category: 'Science', yesProb: 34, volume: 167000 },
];

async function main() {
  console.log('Seeding database...');

  // Delete bets first, then markets (respects foreign key constraint)
  await prisma.bet.deleteMany({});
  await prisma.market.deleteMany({});
  console.log('Cleared existing data');

  for (const market of MARKETS) {
    await prisma.market.create({ data: market });
  }

  console.log(`Created ${MARKETS.length} markets`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());