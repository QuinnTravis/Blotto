import { useState } from "react";

const TOTAL = 100;
const FIELDS = 5;
const FIELD_NAMES = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"];

export default function GameScreen({ room, emit, myId, isHost }) {
  const [troops, setTroops] = useState(Array(FIELDS).fill(0));
  const [submitted, setSubmitted] = useState(false);

  if (!room) return null;

  const remaining = TOTAL - troops.reduce((a, b) => a + b, 0);
  const isValid = remaining === 0;
  const myPlayer = room.players.find(p => p.id === myId);
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
    setSubmitted(true);
  }

  function handleReset() {
    setTroops(Array(FIELDS).fill(0));
    setSubmitted(false);
  }

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
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--vt)", fontSize: "2.2rem", color: remaining === 0 ? "var(--green3)" : "var(--amber)" }}>
              {remaining}
            </div>
            <div style={{ color: "var(--text3)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>REMAINING</div>
          </div>
        </div>

        <hr className="divider" />

        {/* Battlefield sliders */}
        {!alreadySubmitted && !submitted ? (
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
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontFamily: "var(--vt)", fontSize: "2rem", color: "var(--green3)", marginBottom: "0.5rem" }}>
              ✓ TROOPS COMMITTED
            </div>
            <div style={{ color: "var(--text2)", marginBottom: "1.5rem" }}>
              Your distribution: [{troops.join(", ")}]
            </div>
            <div style={{ color: "var(--text3)", fontSize: "0.8rem" }}>
              <span className="blink">▋</span> Waiting for other commanders... ({submittedCount}/{room.players.length})
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