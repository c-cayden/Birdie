const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MARKETS = [
  { title: 'Will Sovereignty win the 2025 Kentucky Derby?', category: 'HorseRacing', yesProb: 22, volume: 312000 },
  { title: 'Will a filly win the 2025 Kentucky Derby?', category: 'HorseRacing', yesProb: 12, volume: 198000 },
  { title: 'Will the 2025 Kentucky Derby winner also win the Preakness Stakes?', category: 'HorseRacing', yesProb: 38, volume: 245000 },
  { title: 'Will there be a Triple Crown winner in 2025?', category: 'HorseRacing', yesProb: 14, volume: 410000 },
  { title: 'Will the 2025 Kentucky Derby winning time be under 2 minutes?', category: 'HorseRacing', yesProb: 44, volume: 76000 },
  { title: 'Will the Federal Reserve cut interest rates at their next meeting?', category: 'Finance', yesProb: 54, volume: 88200 },
  { title: 'Will the S&P 500 reach 6,500 before end of 2025?', category: 'Finance', yesProb: 61, volume: 245000 },
  { title: 'Will gold prices exceed $3,500 per ounce in 2025?', category: 'Finance', yesProb: 47, volume: 132000 },
  { title: 'Will Bitcoin close above $90,000 by end of Q2 2025?', category: 'Crypto', yesProb: 43, volume: 195400 },
  { title: 'Will Ethereum exceed $5,000 before December 2025?', category: 'Crypto', yesProb: 38, volume: 141000 },
  { title: 'Will the US approve a spot Ethereum ETF in 2025?', category: 'Crypto', yesProb: 67, volume: 213000 },
  { title: 'Will the Boston Celtics win the 2025 NBA Championship?', category: 'Sports', yesProb: 31, volume: 189000 },
  { title: 'Will Caitlin Clark win WNBA MVP in 2025?', category: 'Sports', yesProb: 58, volume: 142000 },
  { title: 'Will Lewis Hamilton win a race for Ferrari in the 2025 F1 season?', category: 'Sports', yesProb: 63, volume: 176000 },
  { title: 'Will OpenAI release GPT-5 before Q3 2025?', category: 'Tech', yesProb: 71, volume: 67900 },
  { title: 'Will Apple announce a foldable iPhone at any 2025 event?', category: 'Tech', yesProb: 18, volume: 51600 },
  { title: 'Will Tesla release Full Self-Driving at Level 4 autonomy in 2025?', category: 'Tech', yesProb: 23, volume: 187000 },
  { title: 'Will there be a ceasefire agreement in Ukraine before 2026?', category: 'Politics', yesProb: 44, volume: 389000 },
  { title: 'Will any G7 nation ban TikTok entirely by end of 2025?', category: 'Politics', yesProb: 31, volume: 59400 },
  { title: 'Will US unemployment exceed 5% at any point in 2025?', category: 'Economy', yesProb: 26, volume: 113000 },
  { title: 'Will the US enter a technical recession in 2025?', category: 'Economy', yesProb: 33, volume: 234000 },
  { title: 'Will SpaceX successfully launch Starship into orbit in 2025?', category: 'Science', yesProb: 78, volume: 88000 },
  { title: 'Will Taylor Swift announce a new studio album in 2025?', category: 'Entertainment', yesProb: 62, volume: 134000 },
  { title: 'Will the next James Bond film be released before end of 2026?', category: 'Entertainment', yesProb: 37, volume: 88000 },
];

async function main() {
  console.log('Seeding database...');

  for (const market of MARKETS) {
    await prisma.market.create({ data: market });
  }

  console.log(`Created ${MARKETS.length} markets`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
