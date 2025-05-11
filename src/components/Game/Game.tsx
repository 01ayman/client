import { useEffect, useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import Tablero from "../Tablero/Tablero";
import PanelGame from "./PanelGame";
import { makeMove, streamGame } from "../../services/lichessBotService";
import "./Game.css";
import { usePartida } from "../../context/PartidaContext";

const Game = () => {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [waitingForAI, setWaitingForAI] = useState(false);
  const { partida } = usePartida();
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  const reload = () => {
    setGame(new Chess());
    setGameId(null);
    setPlayerColor("w");
    setWaitingForAI(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = () => {
    stopTimer();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current; // Diferencia en ms
      lastUpdateRef.current = now;

      if (game.isGameOver()) return;

      if (game.turn() === "w") {
        setWhiteTime((prev) => {
          const newTime = prev - delta;
          if (newTime <= 0) handleTimeOut("w");
          return Math.max(0, newTime);
        });
      } else {
        setBlackTime((prev) => {
          const newTime = prev - delta;
          if (newTime <= 0) handleTimeOut("b");
          return Math.max(0, newTime);
        });
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeOut = (color: "w" | "b") => {
    stopTimer();
    console.log(color);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!partida) {
      reload();
      return;
    }
    setGameId(partida.id);
    const initialTime = partida.tiempo * 1000; // Convertir a ms
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    lastUpdateRef.current = Date.now();
    startTimer();
    const cleanup = streamGame(partida.id, {
      onMessage: (event: any) => {
        if (
          (event.wtime = 0 && playerColor == "w") ||
          (event.btime = 0 && playerColor == "b")
        ) {
          return;
        }
        if (event.type === "gameFull") {
          if (event.initialFen == "startpos") {
            setGame(new Chess());
          } else {
            setGame(new Chess(event.initialFen));
          }
        }

        if (event.type === "gameState" && event.moves) {
          const newGame = new Chess();
          event.moves.split(" ").forEach((move: any) => {
            try {
              newGame.move(move);
            } catch (e) {
              console.error("Movimiento inválido:", move);
            }
          });

          setGame(newGame);
          setWaitingForAI(newGame.turn() !== playerColor);

          if (event.wtime && event.btime) {
            setWhiteTime(event.wtime);
            setBlackTime(event.btime);
            lastUpdateRef.current = Date.now();
          }
        }
      },
      onError: (error: any) => {
        console.error("Error de conexión:", error);
        stopTimer();
      },
      onEnd: (reason) => {
        console.error(`Partida terminada por: ${reason}`);
        stopTimer();
      },
    });

    return () => {
      cleanup();
      stopTimer();
    };
  }, [partida]);

  const makeAMove = useCallback(
    async (move: { from: string; to: string; promotion?: string }) => {
      if (!gameId) return null;

      const moveString = `${move.from}${move.to}${move.promotion || ""}`;
      try {
        const valid = await makeMove(gameId, moveString);
        if (valid.ok) {
          setWaitingForAI(true);
          lastUpdateRef.current = Date.now();
        }
        return move;
      } catch (error) {
        console.error("Error al realizar el movimiento:", error);
        return null;
      }
    },
    [gameId]
  );

  useEffect(() => {
    if (!game.isGameOver()) {
      startTimer();
    }
    return () => stopTimer();
  }, [game.turn()]);

  useEffect(() => {
    if (whiteTime <= 0 || blackTime <= 0) {
      stopTimer();
    }
  }, [whiteTime, blackTime]);

  return (
    <div className="game-container">
      <PanelGame
        game={game}
        onReset={() => {
          reload();
        }}
        waitingForAI={waitingForAI}
        tBlancas={formatTime(whiteTime)}
        tNegras={formatTime(blackTime)}
        color={playerColor}
      />
      <Tablero
        game={game}
        makeAMove={makeAMove}
        waitingForAI={waitingForAI}
        playerColor={playerColor}
      />
    </div>
  );
};

export default Game;
