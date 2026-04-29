import { useState } from "react";

export default function LandingScreen({ emit }) {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState(null); // "create" | "join"
  const [rounds, setRounds] = useState(5);

  function handleCreate() {
    if (!name.trim()) return;
    emit("create_room", { playerName: name.trim(), totalRounds: rounds });
  }

  function handleJoin() {
    if (!name.trim() || !joinCode.trim()) return;
    emit("join_room", { code: joinCode.trim().toUpperCase(), playerName: name.trim() });
  }

  return (
    <div className="screen">
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 420 }}>
        <div className="corner-bracket tl" />
        <div className="corner-bracket tr" />
        <div className="corner-bracket bl" />
        <div className="corner-bracket br" />

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--vt)", fontSize: "3.5rem", color: "var(--amber)", lineHeight: 1 }}>
            🪖 COLONEL BLOTTO
          </div>
          <div style={{ color: "var(--text3)", fontSize: "0.75rem", letterSpacing: "0.2em", marginTop: "0.5rem" }}>
            GAME THEORY · STRATEGY · DECEPTION
          </div>
        </div>

        <div style={{ marginBottom: "1.2rem" }}>
          <label className="label">Your Callsign</label>
          <input
            className="input"
            placeholder="Enter your name..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && mode === "create") handleCreate(); if (e.key === "Enter" && mode === "join") handleJoin(); }}
            maxLength={20}
          />
        </div>

        {!mode && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMode("create")}>
              + Create Room
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMode("join")}>
              Join Room
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="slide-in">
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="label">Number of Rounds</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[3, 5, 7, 10].map(r => (
                  <button
                    key={r}
                    className={`btn ${rounds === r ? "btn-amber" : "btn-ghost"}`}
                    style={{ flex: 1, padding: "0.5rem" }}
                    onClick={() => setRounds(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMode(null)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreate} disabled={!name.trim()}>
                Deploy Room
              </button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="slide-in">
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="label">Room Code</label>
              <input
                className="input"
                placeholder="e.g. ALPHA"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
                maxLength={5}
                style={{ letterSpacing: "0.3em", textAlign: "center", fontSize: "1.3rem" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMode(null)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleJoin} disabled={!name.trim() || !joinCode.trim()}>
                Infiltrate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}