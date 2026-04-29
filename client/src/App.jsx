import { useState, useEffect, useCallback } from "react";
import { socket } from "./socket";
import LandingScreen from "./screens/LandingScreen";
import LobbyScreen from "./screens/LobbyScreen";
import GameScreen from "./screens/GameScreen";
import ResultsScreen from "./screens/ResultsScreen";
import "./index.css";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [room, setRoom] = useState(null);
  const [myId, setMyId] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [finalLeaderboard, setFinalLeaderboard] = useState(null);

  useEffect(() => {
    socket.on("connect", () => setMyId(socket.id));

    socket.on("room_update", (updatedRoom) => {
      setRoom(updatedRoom);
      setError(null);
      if (updatedRoom.status === "lobby") setScreen("lobby");
      if (updatedRoom.status === "submitting") { setLastResult(null); setScreen("game"); }
      if (updatedRoom.status === "finished") setScreen("gameover");
    });

    socket.on("round_result", (result) => {
      setLastResult(result);
      setScreen("results");
    });

    socket.on("game_over", ({ leaderboard }) => {
      setFinalLeaderboard(leaderboard);
      setScreen("gameover");
    });

    socket.on("error", ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    });

    return () => {
      socket.off("connect");
      socket.off("room_update");
      socket.off("round_result");
      socket.off("game_over");
      socket.off("error");
    };
  }, []);

  const emit = useCallback((event, data) => socket.emit(event, data), []);
  const isHost = room?.hostId === myId;

  return (
    <div>
      {error && (
        <div style={{
          position: "fixed", top: "1rem", left: "50%", transform: "translateX(-50%)",
          background: "rgba(192,57,43,0.95)", color: "#fff", padding: "0.6rem 1.5rem",
          border: "1px solid #e74c3c", borderRadius: "2px", zIndex: 10000,
          fontFamily: "var(--mono)", fontSize: "0.85rem", letterSpacing: "0.05em",
        }}>
          ⚠ {error}
        </div>
      )}
      {screen === "landing"  && <LandingScreen emit={emit} myId={myId} />}
      {screen === "lobby"    && <LobbyScreen room={room} emit={emit} myId={myId} isHost={isHost} />}
      {screen === "game"     && <GameScreen room={room} emit={emit} myId={myId} isHost={isHost} />}
      {screen === "results"  && <ResultsScreen room={room} result={lastResult} emit={emit} myId={myId} isHost={isHost} isFinal={false} />}
      {screen === "gameover" && <ResultsScreen room={room} result={lastResult} emit={emit} myId={myId} isHost={isHost} isFinal={true} finalLeaderboard={finalLeaderboard || room?.roundHistory?.slice(-1)[0]?.leaderboard} />}
    </div>
  );
}