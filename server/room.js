/**
 * Colonel Blotto — Room Manager
 * Handles game rooms: creation, joining, round lifecycle.
 */

const {
  resolveRound, updateCumulative, buildLeaderboard, validateDistribution
} = require("./game");
const { getBotDistribution, BOTS } = require("./bots");

const MAX_PLAYERS = 8;
const rooms = new Map();

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function generateBotId() {
  return "bot_" + Math.random().toString(36).slice(2, 8);
}

function createRoom(hostId, hostName, totalRounds = 5) {
  let code;
  do { code = generateCode(); } while (rooms.has(code));

  const room = {
    code,
    hostId,
    status: "lobby",
    players: new Map([[hostId, { id: hostId, name: hostName, isBot: false, socketId: hostId }]]),
    currentRound: 0,
    totalRounds: Math.min(Math.max(totalRounds, 1), 10),
    submissions: new Map(),
    roundHistory: [],
    cumulative: {},
  };

  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function joinRoom(code, playerId, playerName, socketId) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found" };
  if (room.status !== "lobby") return { error: "Game already in progress" };
  if (room.players.size >= MAX_PLAYERS) return { error: "Room is full" };
  if (room.players.has(playerId)) {
    room.players.get(playerId).socketId = socketId;
    return { room };
  }
  room.players.set(playerId, { id: playerId, name: playerName, isBot: false, socketId });
  return { room };
}

function addBot(code, botType) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found" };
  if (room.status !== "lobby") return { error: "Game already started" };
  if (room.players.size >= MAX_PLAYERS) return { error: "Room is full" };
  if (!BOTS[botType]) return { error: "Unknown bot type" };

  const botId = generateBotId();
  room.players.set(botId, {
    id: botId,
    name: BOTS[botType].name,
    isBot: true,
    botType,
    socketId: null,
  });
  return { room, botId };
}

function startGame(code, requesterId) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found" };
  if (room.hostId !== requesterId) return { error: "Only the host can start" };
  if (room.players.size < 2) return { error: "Need at least 2 players" };
  if (room.status !== "lobby") return { error: "Game already started" };

  room.status = "submitting";
  room.currentRound = 1;
  room.submissions = new Map();

  // Bots submit immediately
  for (const p of room.players.values()) {
    if (p.isBot) room.submissions.set(p.id, getBotDistribution(p.botType));
  }

  return { room };
}

function submitDistribution(code, playerId, distribution) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found" };
  if (room.status !== "submitting") return { error: "Not accepting submissions" };
  if (!room.players.has(playerId)) return { error: "Not in this room" };

  const err = validateDistribution(distribution);
  if (err) return { error: err };

  room.submissions.set(playerId, distribution);

  const allSubmitted = [...room.players.keys()].every(id => room.submissions.has(id));
  return { room, allSubmitted };
}

function resolveCurrentRound(code) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found" };

  room.status = "revealing";

  const players = [...room.players.values()].map((p) => ({
    id: p.id,
    distribution: room.submissions.get(p.id),
  }));

  const { matchups, scores } = resolveRound(players);

  const nameMap = {};
  for (const p of room.players.values()) nameMap[p.id] = p.name;

  room.cumulative = updateCumulative(room.cumulative, scores);
  const leaderboard = buildLeaderboard(room.cumulative, nameMap);

  const submissionsSnapshot = {};
  for (const [id, dist] of room.submissions.entries()) submissionsSnapshot[id] = dist;

  room.roundHistory.push({
    round: room.currentRound,
    submissions: submissionsSnapshot,
    matchups,
    roundScores: scores,
    leaderboard,
  });

  return { room, matchups, roundScores: scores, leaderboard, nameMap };
}

function advanceRound(code) {
  const room = rooms.get(code);
  if (!room) return { error: "Room not found" };

  if (room.currentRound >= room.totalRounds) {
    room.status = "finished";
    return { room, finished: true };
  }

  room.currentRound++;
  room.status = "submitting";
  room.submissions = new Map();

  for (const p of room.players.values()) {
    if (p.isBot) room.submissions.set(p.id, getBotDistribution(p.botType));
  }

  return { room, finished: false };
}

function serializeRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    players: [...room.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      isBot: p.isBot,
      botType: p.botType || null,
      submitted: room.submissions.has(p.id),
    })),
    roundHistory: room.roundHistory,
    cumulative: room.cumulative,
  };
}

module.exports = {
  createRoom, getRoom, joinRoom, addBot,
  startGame, submitDistribution, resolveCurrentRound,
  advanceRound, serializeRoom, MAX_PLAYERS,
  BOT_TYPES: Object.keys(BOTS),
};