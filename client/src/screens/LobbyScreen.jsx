export default function LobbyScreen({ room, emit, myId, isHost }) {
  if (!room) return null;

  const botTypes = ["RandomBot", "GreedyBot", "NashBot"];
  const botNames = { RandomBot: "🎲 RandomBot", GreedyBot: "💰 GreedyBot", NashBot: "🧮 NashBot" };

  return (
    <div className="screen">
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 500 }}>
        <div className="corner-bracket tl" /><div className="corner-bracket tr" />
        <div className="corner-bracket bl" /><div className="corner-bracket br" />

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--vt)", fontSize: "2.5rem", color: "var(--amber)" }}>
            🪖 WAR ROOM
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <span className="label">Room Code: </span>
            <span style={{ fontFamily: "var(--vt)", fontSize: "2rem", color: "var(--green3)", letterSpacing: "0.3em" }}>
              {room.code}
            </span>
          </div>
          <div style={{ color: "var(--text3)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {room.totalRounds} rounds · {room.players.length} / 8 players
          </div>
        </div>

        <hr className="divider" />

        <div style={{ marginBottom: "1.5rem" }}>
          <label className="label">Enlisted Soldiers</label>
          {room.players.map(p => (
            <div key={p.id} className="slide-in" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.5rem 0.75rem", marginBottom: "0.4rem",
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "2px"
            }}>
              <span style={{ color: p.id === myId ? "var(--amber)" : "var(--text)" }}>
                {p.name} {p.id === myId && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>(you)</span>}
              </span>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                {p.isBot && <span className="tag tag-amber">BOT</span>}
                {room.hostId === p.id && <span className="tag tag-green">HOST</span>}
              </div>
            </div>
          ))}
        </div>

        {isHost && (
          <>
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="label">Add AI Opponent</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {botTypes.map(b => (
                  <button
                    key={b}
                    className="btn btn-ghost"
                    style={{ flex: 1, fontSize: "0.7rem", padding: "0.5rem 0.25rem" }}
                    onClick={() => emit("add_bot", { code: room.code, botType: b })}
                    disabled={room.players.length >= 8}
                  >
                    {botNames[b]}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "0.8rem" }}
              onClick={() => emit("start_game", { code: room.code })}
              disabled={room.players.length < 2}
            >
              ⚔ DEPLOY — START GAME
            </button>
            {room.players.length < 2 && (
              <div style={{ textAlign: "center", color: "var(--text3)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                Need at least 2 players to start
              </div>
            )}
          </>
        )}

        {!isHost && (
          <div style={{ textAlign: "center", color: "var(--text2)", fontSize: "0.85rem" }}>
            <span className="blink">▋</span> Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}