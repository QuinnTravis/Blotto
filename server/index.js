/**
 * Colonel Blotto — Server
 * Express + Socket.io
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const {
  createRoom, getRoom, joinRoom, addBot,
  startGame, submitDistribution, resolveCurrentRound,
  advanceRound, serializeRoom, BOT_TYPES,
} = require("./room");
const { BOTS } = require("./bots");
const { TOTAL_TROOPS, NUM_BATTLEFIELDS } = require("./game");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/config", (_req, res) =>
  res.json({
    TOTAL_TROOPS,
    NUM_BATTLEFIELDS,
    BOT_TYPES,
    BOTS: Object.entries(BOTS).map(([k, v]) => ({
      id: k, name: v.name, description: v.description
    }))
  })
);

function broadcast(code, event, data) {
  io.to(code).emit(event, data);
}

io.on("connection", (socket) => {
  console.log(`connected: ${socket.id}`);

  socket.on("create_room", ({ playerName, totalRounds = 5 }) => {
    if (!playerName?.trim()) return socket.emit("error", { message: "Name required" });
    const room = createRoom(socket.id, playerName.trim(), totalRounds);
    socket.join(room.code);
    socket.emit("room_update", serializeRoom(room));
    console.log(`room created: ${room.code} by ${playerName}`);
  });

  socket.on("join_room", ({ code, playerName }) => {
    if (!code || !playerName?.trim())
      return socket.emit("error", { message: "Code and name required" });
    const result = joinRoom(code.toUpperCase(), socket.id, playerName.trim(), socket.id);
    if (result.error) return socket.emit("error", { message: result.error });
    socket.join(code.toUpperCase());
    broadcast(code.toUpperCase(), "room_update", serializeRoom(result.room));
  });

  socket.on("add_bot", ({ code, botType }) => {
    const room = getRoom(code);
    if (!room) return socket.emit("error", { message: "Room not found" });
    if (room.hostId !== socket.id)
      return socket.emit("error", { message: "Only host can add bots" });
    const result = addBot(code, botType);
    if (result.error) return socket.emit("error", { message: result.error });
    broadcast(code, "room_update", serializeRoom(result.room));
  });

  socket.on("start_game", ({ code }) => {
    const result = startGame(code, socket.id);
    if (result.error) return socket.emit("error", { message: result.error });
    broadcast(code, "room_update", serializeRoom(result.room));
  });

  socket.on("submit", ({ code, distribution }) => {
    const result = submitDistribution(code, socket.id, distribution);
    if (result.error) return socket.emit("error", { message: result.error });
    broadcast(code, "room_update", serializeRoom(result.room));

    if (result.allSubmitted) {
      const resolution = resolveCurrentRound(code);
      if (resolution.error)
        return broadcast(code, "error", { message: resolution.error });

      const lastHistory = resolution.room.roundHistory.slice(-1)[0];

      broadcast(code, "round_result", {
        round: resolution.room.currentRound,
        submissions: lastHistory.submissions,
        matchups: resolution.matchups,
        roundScores: resolution.roundScores,
        leaderboard: resolution.leaderboard,
        nameMap: resolution.nameMap,
      });
      broadcast(code, "room_update", serializeRoom(resolution.room));
    }
  });

  socket.on("next_round", ({ code }) => {
    const room = getRoom(code);
    if (!room) return socket.emit("error", { message: "Room not found" });
    if (room.hostId !== socket.id)
      return socket.emit("error", { message: "Only host can advance" });
    const result = advanceRound(code);
    if (result.error) return socket.emit("error", { message: result.error });
    broadcast(code, "room_update", serializeRoom(result.room));
    if (result.finished) {
      broadcast(code, "game_over", {
        leaderboard: result.room.roundHistory.slice(-1)[0]?.leaderboard || []
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🪖 Blotto server running on http://localhost:${PORT}`);
});