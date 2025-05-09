// src/components/Game.tsx

import { useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import Tablero from "../Tablero/Tablero";
import PanelGame from "./PanelGame";
import {
  makeMove,
  streamGame,
} from "../../services/lichessBotService";
import "./Game.css";
import { usePartida } from "../../context/PartidaContext";

const Game = () => {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [waitingForAI, setWaitingForAI] = useState(false);
  const { partida } = usePartida();
  const [tBlancas, setTBlancas] = useState(
    // partida ? `${partida.tiempo / 60}:00` : "0:00"
    0
  );

  const [tNegras, setTNegras] = useState(
    // partida ? `${partida.tiempo / 60}:00` : "0:00"
    0
  );

  const reload = () => {
    setGame(new Chess());
    setGameId(null);
    setPlayerColor("w");
    setWaitingForAI(false);
  };

  useEffect(() => {
    if (!partida) {
      reload();
      return;
    }
    // setTBlancas(partida.tiempo);
    // setTNegras(partida.tiempo);
    console.log("entra");
    setGameId(partida.id);
    console.log("empieza la partida");
    console.log(partida.id);
    // const startGame = async () => {
    console.log("empezamos");
    // const cleanup =
    const cleanup = streamGame(partida.id, {
      onMessage: (event: any) => {
        console.log("Evento recibido:", event);
        // const myTime = `${playerColor}time`;
        if (
          (event.wtime = 0 && playerColor == "w") ||
          (event.btime = 0 && playerColor == "b")
        ) {
          return;
        }
        if (event.type === "gameFull") {
          // Actualizar el estado del juego
          if (event.initialFen == "startpos") {
            setGame(new Chess());
          } else {
            setGame(new Chess(event.initialFen));
          }
        }

        // Manejar movimientos
        if (event.type === "gameState" && event.moves) {
          const newGame = new Chess();
          event.moves.split(" ").forEach((move: any) => {
            try {
              // setTimeout(() => {
              newGame.move(move);
              // }, 3000);
            } catch (e) {
              console.error("Movimiento inválido:", move);
            }
          });

          setGame(newGame);
          setWaitingForAI(newGame.turn() !== playerColor);
          if (event.wtime && event.btime) {
            setTBlancas(event.wtime);
            setTNegras(event.btime);
          }
        }

        // Manejar fin de juego
        // if (event.type === "gameOver") {
        //   setGameState(
        //     `Juego terminado: ${
        //       event.winner
        //         ? event.winner === "white"
        //           ? "Blancas ganan"
        //           : "Negras ganan"
        //         : "Empate"
        //     }`
        //   );
        //   setWaitingForAI(false);
        // }
      },
      onError: (error: any) => {
        console.log("Error de conexión:", error);
      },
      onEnd: (reason) => {
        console.log(`Partida terminada por: ${reason}`);
        console.log(tNegras);
        console.log(tBlancas);
        // Ejemplo de manejo:
        // if (reason === "timeout") {
        //   setGameState("Se acabó el tiempo");
        //   alert("¡Se acabó el tiempo!");
        // } else if (reason === "checkmate") {
        //   alert("¡Jaque mate!");
        // }
      },
    });

    return () => {
      cleanup();
    };
  }, [partida]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (waitingForAI) return;
      if (game.turn() === "w") {
        setTBlancas((prev) => Math.max(0, prev - 1000));
        // console.log("a" + tBlancas);
      } else {
        setTNegras((prev) => Math.max(0, prev - 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, waitingForAI]);

  const makeAMove = useCallback(
    async (move: { from: string; to: string; promotion?: string }) => {
      if (!gameId) return null;

      const moveString = `${move.from}${move.to}${move.promotion || ""}`;
      try {
        const valid = await makeMove(gameId, moveString);
        if (valid.ok) setWaitingForAI(true);
        return move;
      } catch (error) {
        console.log("Error al realizar el movimiento:", error);
        return null;
      }
    },
    [gameId]
  );

  return (
    <div className="game-container">
      <PanelGame
        game={game}
        onReset={() => {
          reload();
        }}
        waitingForAI={waitingForAI}
        tBlancas={formatTime(tBlancas)}
        tNegras={formatTime(tNegras)}
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
