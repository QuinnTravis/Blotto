# 🪖 Colonel Blotto

A multiplayer game theory strategy game, built because I couldn't find a single playable version online.

## The Story

I first saw Colonel Blotto played at my university's quant club. It's a staple at trading and quantitative finance tournaments. I wanted to play it with friends online and couldn't find anything, so I built it.

## What is Colonel Blotto?

Colonel Blotto is a classical game theory problem dating back to 1921. Two commanders each distribute troops across the same set of battlefields simultaneously — without seeing the other's move. The commander who sends more troops to a battlefield wins it. Win the majority of battlefields, win the round.

In this version:
- You have **100 troops** to distribute across **5 battlefields**
- Every player submits their distribution **simultaneously** — no peeking
- You face **every other player 1v1** each round
- After each round, all distributions are revealed and matchups are calculated
- Most **matchup wins** across all rounds = tournament winner

The catch: there's no single dominant strategy. Stack all your troops on three fields and you dominate, until someone predicts you and counters. It's bluffing, game theory, and math all at once.

## Features

- 🌐 **Real-time multiplayer** via WebSockets — create a room, share the code, play instantly ( To be Implemeneted )
- 🤖 **AI bots** with three distinct strategies:
  - 🎲 **RandomBot** — pure random distribution
  - 💰 **GreedyBot** — concentrates troops on the minimum fields needed to win
  - 🧮 **NashBot** — approximates a Nash equilibrium using regret-matching
- 📊 **Live leaderboard** updated after every round
- 🎖️ **Full match history** — see every player's distribution after each round

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Socket.io
- **Game Engine**: Pure functional JS — deterministic, no side effects

## Running Locally

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start the server (terminal 1)
cd server && node index.js

# Start the client (terminal 2)
cd client && npm run dev
```

Then open http://localhost:5173

