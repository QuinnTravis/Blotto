/**
 * Colonel Blotto — Bot Strategies
 * Each bot is a pure function that returns a valid distribution.
 */

const { TOTAL_TROOPS, NUM_BATTLEFIELDS } = require("./game");

function randomPartition(total, parts) {
  const cuts = Array.from({ length: parts - 1 }, () =>
    Math.floor(Math.random() * (total + 1))
  ).sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const c of cuts) { result.push(c - prev); prev = c; }
  result.push(total - prev);
  return result;
}

// Completely random distribution
function randomBot() {
  return randomPartition(TOTAL_TROOPS, NUM_BATTLEFIELDS);
}

// Wins exactly 3 battlefields, ignores the other 2
function greedyBot() {
  const avgPerField = TOTAL_TROOPS / NUM_BATTLEFIELDS;
  const neededToWin = Math.ceil(NUM_BATTLEFIELDS / 2);
  const troopsPerWinField = Math.floor(avgPerField) + 1;
  const troopsOnWinFields = troopsPerWinField * neededToWin;
  const leftover = TOTAL_TROOPS - troopsOnWinFields;

  const dist = new Array(NUM_BATTLEFIELDS).fill(0);
  for (let i = 0; i < neededToWin; i++) dist[i] = troopsPerWinField;
  dist[0] += leftover;

  // Shuffle so it's not always the same fields
  for (let i = dist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dist[i], dist[j]] = [dist[j], dist[i]];
  }
  return dist;
}

// Approximates Nash equilibrium via regret-matching
function nashBot() {
  const POOL_SIZE = 200;
  const ITERATIONS = 3;

  let pool = Array.from({ length: POOL_SIZE }, () =>
    randomPartition(TOTAL_TROOPS, NUM_BATTLEFIELDS)
  );

  function scorePool(p) {
    return p.map((dist, i) => {
      let wins = 0;
      for (let j = 0; j < p.length; j++) {
        if (i === j) continue;
        let dWins = 0, oWins = 0;
        for (let k = 0; k < NUM_BATTLEFIELDS; k++) {
          if (dist[k] > p[j][k]) dWins++;
          else if (p[j][k] > dist[k]) oWins++;
        }
        if (dWins > oWins) wins++;
      }
      return wins;
    });
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const scores = scorePool(pool);
    const indexed = pool
      .map((d, i) => ({ d, s: scores[i] }))
      .sort((a, b) => b.s - a.s);
    const survivors = indexed.slice(0, POOL_SIZE / 2).map((x) => x.d);

    const mutants = survivors.map((d) => {
      const m = [...d];
      const i = Math.floor(Math.random() * NUM_BATTLEFIELDS);
      const j = Math.floor(Math.random() * NUM_BATTLEFIELDS);
      const amount = Math.floor(Math.random() * Math.min(m[i], 10) + 1);
      if (m[i] >= amount) { m[i] -= amount; m[j] += amount; }
      return m;
    });

    pool = [...survivors, ...mutants];
  }

  const finalScores = scorePool(pool);
  const topN = Math.max(1, Math.floor(POOL_SIZE / 4));
  const ranked = pool
    .map((d, i) => ({ d, s: finalScores[i] }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topN);

  return ranked[Math.floor(Math.random() * ranked.length)].d;
}

const BOTS = {
  RandomBot: { name: "🎲 RandomBot", fn: randomBot, description: "Uniformly random" },
  GreedyBot: { name: "💰 GreedyBot", fn: greedyBot, description: "Win minimum battlefields" },
  NashBot:   { name: "🧮 NashBot",   fn: nashBot,   description: "Nash equilibrium approx" },
};

function getBotDistribution(botType) {
  const bot = BOTS[botType];
  if (!bot) throw new Error(`Unknown bot type: ${botType}`);
  return bot.fn();
}

module.exports = { BOTS, getBotDistribution };