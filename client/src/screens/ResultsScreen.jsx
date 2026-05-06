const FIELD_NAMES = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"];

export default function ResultsScreen({ room, result, emit, myId, isHost, isFinal, finalLeaderboard }) {
  if (!room) return null;

  const leaderboard = isFinal
    ? (finalLeaderboard || [])
    : (result?.leaderboard || []);

  const nameMap = result?.nameMap || {};

  return (
    <div className="screen">
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 620 }}>
        <div className="corner-bracket tl" /><div className="corner-bracket tr" />
        <div className="corner-bracket bl" /><div className="corner-bracket br" />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--vt)", fontSize: "2.5rem", color: "var(--amber)" }}>
            {isFinal ? "⚔ FINAL STANDINGS" : `ROUND ${result?.round} RESULTS`}
          </div>
          {!isFinal && (
            <div style={{ color: "var(--text3)", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
              ROUND {result?.round} OF {room.totalRounds}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label className="label">Leaderboard</label>
          {leaderboard.map((p, idx) => (
            <div key={p.id} className="slide-in" style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "0.6rem 0.75rem", marginBottom: "0.4rem",
              background: idx === 0 ? "rgba(245,166,35,0.08)" : "var(--bg2)",
              border: `1px solid ${idx === 0 ? "rgba(245,166,35,0.4)" : "var(--border)"}`,
              borderRadius: "2px"
            }}>
              <span style={{
                fontFamily: "var(--vt)", fontSize: "1.6rem",
                color: idx === 0 ? "var(--amber)" : idx === 1 ? "var(--text2)" : "var(--text3)",
                width: "2rem", textAlign: "center"
              }}>
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
              </span>
              <span style={{
                flex: 1, color: p.id === myId ? "var(--amber)" : "var(--text)",
                fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "0.05em"
              }}>
                {p.name} {p.id === myId && <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>(you)</span>}
              </span>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text2)" }}>
                <span><span style={{ color: "var(--green3)" }}>{p.wins}W</span> / {p.losses}L / {p.ties}T</span>
                <span style={{ color: "var(--text3)" }}>{p.battlefieldWins}bf</span>
              </div>
            </div>
          ))}
        </div>

        {/* Round matchups */}
        {!isFinal && result?.matchups && (
          <>
            <hr className="divider" />
            <label className="label">Matchups This Round</label>
            {result.matchups.map((m, i) => {
              const aName = nameMap[m.aId] || m.aId;
              const bName = nameMap[m.bId] || m.bId;
              return (
                <div key={i} style={{
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: "2px", padding: "0.75rem", marginBottom: "0.5rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: m.result.winner === "a" ? "var(--green3)" : "var(--text2)", fontWeight: 600 }}>
                      {aName} {m.result.winner === "a" && "✓"}
                    </span>
                    <span style={{ color: "var(--text3)", fontSize: "0.75rem" }}>
                      {m.result.aWins} — {m.result.bWins}
                    </span>
                    <span style={{ color: m.result.winner === "b" ? "var(--green3)" : "var(--text2)", fontWeight: 600 }}>
                      {m.result.winner === "b" && "✓"} {bName}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    {m.result.battlefields.map((bf, j) => (
                      <div key={j} style={{
                        flex: 1, textAlign: "center", padding: "0.3rem 0.2rem",
                        background: bf.winner === "a" ? "rgba(82,194,82,0.12)" : bf.winner === "b" ? "rgba(192,57,43,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${bf.winner === "a" ? "var(--green)" : bf.winner === "b" ? "var(--red)" : "var(--border)"}`,
                        borderRadius: "2px", fontSize: "0.65rem"
                      }}>
                        <div style={{ color: "var(--text3)", marginBottom: "0.2rem" }}>{FIELD_NAMES[j]}</div>
                        <div style={{ color: "var(--green3)" }}>{bf.aT}</div>
                        <div style={{ color: "var(--text3)" }}>vs</div>
                        <div style={{ color: "var(--red2)" }}>{bf.bT}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Distributions */}
        {!isFinal && result?.submissions && (
          <>
            <hr className="divider" />
            <label className="label">All Distributions This Round</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {Object.entries(result.submissions).map(([pid, dist]) => (
                <div key={pid} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.4rem 0.75rem", background: "var(--bg2)",
                  border: "1px solid var(--border)", borderRadius: "2px"
                }}>
                  <span style={{ width: "120px", color: pid === myId ? "var(--amber)" : "var(--text2)", fontSize: "0.8rem" }}>
                    {nameMap[pid] || pid}
                  </span>
                  <div style={{ display: "flex", gap: "0.3rem", flex: 1 }}>
                    {dist.map((v, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ height: "30px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                          <div style={{
                            width: "100%", height: `${v}%`,
                            background: "var(--green2)", borderRadius: "2px 2px 0 0",
                            minHeight: v > 0 ? "3px" : 0
                          }} />
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text3)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <hr className="divider" />
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          {!isFinal && isHost && (
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => emit("next_round", { code: room.code })}
            >
              {result?.round >= room.totalRounds ? "⚔ Final Standings" : "▶ Next Round"}
            </button>
          )}
          {!isFinal && !isHost && (
            <div style={{ color: "var(--text3)", fontSize: "0.85rem", textAlign: "center" }}>
              <span className="blink">▋</span> Waiting for host to advance...
            </div>
          )}
          {isFinal && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--vt)", fontSize: "1.8rem", color: "var(--green3)", marginBottom: "0.5rem" }}>
                🎖 BATTLE COMPLETE
              </div>
              <div style={{ color: "var(--text3)", fontSize: "0.8rem" }}>Refresh to play again</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
