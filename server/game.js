/**
 * Colonel Blotto — Game Engine
 * Pure functions only. No side effects. No state.
 */

const TOTAL_TROOPS = 100;
const NUM_BATTLEFIELDS = 5;

function validateDistribution(distribution) {
  if (!Array.isArray(distribution)) return "Distribution must be an array";
  if (distribution.length !== NUM_BATTLEFIELDS)
    return `Must have exactly ${NUM_BATTLEFIELDS} values`;
  if (distribution.some((n) => !Number.isInteger(n) || n < 0))
    return "All values must be non-negative integers";
  const total = distribution.reduce((a, b) => a + b, 0);
  if (total !== TOTAL_TROOPS)
    return `Troops must sum to ${TOTAL_TROOPS} (got ${total})`;
  return null;
}

function resolveMatchup(a, b) {
  let aWins = 0;
  let bWins = 0;
  const battlefields = [];

  for (let i = 0; i < NUM_BATTLEFIELDS; i++) {
    let winner = "tie";
    if (a[i] > b[i]) { winner = "a"; aWins++; }
    else if (b[i] > a[i]) { winner = "b"; bWins++; }
    battlefields.push({ aT: a[i], bT: b[i], winner });
  }

  const winner = aWins > bWins ? "a" : bWins > aWins ? "b" : "tie";
  return { aWins, bWins, battlefields, winner };
}

function resolveRound(players) {
  const matchups = [];
  const scores = {};
  for (const p of players) {
    scores[p.id] = { wins: 0, losses: 0, ties: 0, battlefieldWins: 0, battlefieldLosses: 0 };
  }

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i];
      const b = players[j];
      const result = resolveMatchup(a.distribution, b.distribution);

      matchups.push({ aId: a.id, bId: b.id, result });

      scores[a.id].battlefieldWins += result.aWins;
      scores[a.id].battlefieldLosses += result.bWins;
      scores[b.id].battlefieldWins += result.bWins;
      scores[b.id].battlefieldLosses += result.aWins;

      if (result.winner === "a") {
        scores[a.id].wins++;
        scores[b.id].losses++;
      } else if (result.winner === "b") {
        scores[b.id].wins++;
        scores[a.id].losses++;
      } else {
        scores[a.id].ties++;
        scores[b.id].ties++;
      }
    }
  }

  return { matchups, scores };
}

function updateCumulative(cumulative, roundScores) {
  const next = { ...cumulative };
  for (const [id, s] of Object.entries(roundScores)) {
    if (!next[id]) {
      next[id] = { wins: 0, losses: 0, ties: 0, battlefieldWins: 0, battlefieldLosses: 0 };
    }
    next[id] = {
      wins:              next[id].wins              + s.wins,
      losses:            next[id].losses            + s.losses,
      ties:              next[id].ties              + s.ties,
      battlefieldWins:   next[id].battlefieldWins   + s.battlefieldWins,
      battlefieldLosses: next[id].battlefieldLosses + s.battlefieldLosses,
    };
  }
  return next;
}

function buildLeaderboard(cumulative, nameMap) {
  return Object.entries(cumulative)
    .map(([id, s]) => ({ id, name: nameMap[id] || id, ...s }))
    .sort((x, y) => {
      if (y.wins !== x.wins) return y.wins - x.wins;
      if (y.battlefieldWins !== x.battlefieldWins) return y.battlefieldWins - x.battlefieldWins;
      return x.losses - y.losses;
    });
}

module.exports = {
  TOTAL_TROOPS,
  NUM_BATTLEFIELDS,
  validateDistribution,
  resolveMatchup,
  resolveRound,
  updateCumulative,
  buildLeaderboard,
};