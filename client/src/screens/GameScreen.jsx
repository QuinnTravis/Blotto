import { useState, useRef } from "react";

const TOTAL = 100;
const FIELDS = 5;
const FIELD_NAMES = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"];

export default function GameScreen({ room, emit, myId, isHost }) {
  const [troops, setTroops] = useState(Array(FIELDS).fill(0));
  const [submitted, setSubmitted] = useState(false);
  // Keep a snapshot of what we submitted so we can show it in the waiting screen
  const submittedTroops = useRef(null);

  if (!room) return null;

  const remaining = TOTAL - troops.reduce((a, b) => a + b, 0);
  const isValid = remaining === 0;
  const alreadySubmitted = room.players.find(p => p.id === myId)?.submitted;
  const submittedCount = room.players.filter(p => p.submitted).length;

  function adjust(i, delta) {
    setTroops(prev => {
      const next = [...prev];
      const newVal = next[i] + delta;
      if (newVal < 0) return prev;
      if (delta > 0 && remaining <= 0) return prev;
      next[i] = newVal;
      return next;
    });
  }

  function handleSubmit() {
    emit("submit", { code: room.code, distribution: troops });
    submittedTroops.current = [...troops];
    setSubmitted(true);
  }

  function handleReset() {
    setTroops(Array(FIELDS).fill(0));
  }

  const showWaiting = submitted || alreadySubmitted;
  const displayTroops = submittedTroops.current || troops;

  return (
    <div className="screen">
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 520 }}>
        <div className="corner-bracket tl" /><div className="corner-bracket tr" />
        <div className="corner-bracket bl" /><div className="corner-bracket br" />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "var(--vt)", fontSize: "2rem", color: "var(--amber)" }}>
              ROUND {room.currentRound} / {room.totalRounds}
            </div>
            <div style={{ color: "var(--text3)", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
              DEPLOY YOUR TROOPS
            </div>
          </div>
          {!showWaiting && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--vt)", fontSize: "2.2rem", color: remaining === 0 ? "var(--green3)" : "var(--amber)" }}>
                {remaining}
              </div>
              <div style={{ color: "var(--text3)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>REMAINING</div>
            </div>
          )}
        </div>

        <hr className="divider" />

        {!showWaiting ? (
          <>
            {FIELD_NAMES.map((name, i) => (
              <div key={i} style={{ marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <label className="label" style={{ margin: 0 }}>{name}</label>
                  <span style={{ fontFamily: "var(--vt)", fontSize: "1.3rem", color: "var(--green3)" }}>
                    {troops[i]}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button className="btn btn-ghost" style={{ padding: "0.3rem 0.8rem", fontSize: "1.1rem" }}
                    onClick={() => adjust(i, -10)}>-10</button>
                  <button className="btn btn-ghost" style={{ padding: "0.3rem 0.7rem", fontSize: "1.1rem" }}
                    onClick={() => adjust(i, -1)}>-</button>

                  <div style={{ flex: 1, height: "6px", background: "var(--bg2)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${troops[i]}%`,
                      background: `linear-gradient(90deg, var(--green2), var(--green3))`,
                      transition: "width 0.1s"
                    }} />
                  </div>

                  <button className="btn btn-ghost" style={{ padding: "0.3rem 0.7rem", fontSize: "1.1rem" }}
                    onClick={() => adjust(i, 1)}>+</button>
                  <button className="btn btn-ghost" style={{ padding: "0.3rem 0.8rem", fontSize: "1.1rem" }}
                    onClick={() => adjust(i, 10)}>+10</button>
                </div>
              </div>
            ))}

            <hr className="divider" />

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleReset}>↺ Reset</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: "center", opacity: isValid ? 1 : 0.4 }}
                onClick={handleSubmit}
                disabled={!isValid}
              >
                ⚔ COMMIT TROOPS
              </button>
            </div>
            {!isValid && (
              <div style={{ textAlign: "center", color: "var(--text3)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                {remaining > 0 ? `Assign ${remaining} more troops` : `Remove ${Math.abs(remaining)} troops`}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "1rem 0" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "var(--vt)", fontSize: "2rem", color: "var(--green3)", marginBottom: "0.5rem" }}>
                ✓ TROOPS COMMITTED
              </div>
              <div style={{ color: "var(--text3)", fontSize: "0.8rem" }}>
                <span className="blink">▋</span> Waiting for other commanders... ({submittedCount}/{room.players.length})
              </div>
            </div>

            {/* Show submitted distribution */}
            <div style={{ marginBottom: "1rem" }}>
              <label className="label">Your Deployment</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {FIELD_NAMES.map((name, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: "50px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "0.3rem" }}>
                      <div style={{
                        width: "80%",
                        height: `${Math.max((displayTroops[i] / TOTAL) * 100, displayTroops[i] > 0 ? 4 : 0)}%`,
                        background: "linear-gradient(180deg, var(--green3), var(--green2))",
                        borderRadius: "2px 2px 0 0",
                        minHeight: displayTroops[i] > 0 ? "4px" : "0",
                      }} />
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--green3)", fontFamily: "var(--vt)" }}>{displayTroops[i]}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text3)" }}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Player status */}
        <hr className="divider" />
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {room.players.map(p => (
            <span key={p.id} className={`tag ${p.submitted ? "tag-green" : "tag-amber"}`}>
              {p.submitted ? "✓" : "…"} {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
