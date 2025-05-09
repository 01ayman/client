// import { useCallback, useEffect, useRef, useState } from "react";
// import { usePartida } from "../context/PartidaContext";

// interface StockfishWorker extends Worker {
//   postMessage(message: string): void;
// }

// export function useStockfish(onBestMove: (move: string) => void) {
//   const engineRef = useRef<StockfishWorker | null>(null);
//   const [isReady, setIsReady] = useState(false);
//   const [isCalculating, setIsCalculating] = useState(false);
//   const { partida } = usePartida();

//   useEffect(() => {
//     console.log("Initializing Stockfish engine...");
//     const engine = new Worker(
//       "/stockfish/stockfish-17-single.js"
//     ) as StockfishWorker;
//     engineRef.current = engine;

//     const handleMessage = (e: MessageEvent) => {
//       const line = e.data;
//       console.log("Stockfish says:", line);

//       if (line === "readyok") {
//         setIsReady(true);
//         console.log("Stockfish ready.");
//       }

//       if (typeof line === "string" && line.startsWith("bestmove")) {
//         const move = line.split(" ")[1];
//         console.log("Best move:", move);
//         if (move && move !== "(none)") {
//           setIsCalculating(false);
//           onBestMove(move);
//         }
//       }
//     };

//     engine.addEventListener("message", handleMessage);

//     // Enviar configuración inicial
//     const dif = partida?.dificultad ?? 10;
//     engine.postMessage("uci");
//     engine.postMessage(`setoption name Skill Level value ${dif}`);
//     engine.postMessage("isready");

//     return () => {
//       engine.removeEventListener("message", handleMessage);
//       engine.terminate();
//       setIsReady(false);
//       setIsCalculating(false);
//     };
//   }, [onBestMove]);

//   const setPositionAndGo = useCallback(
//     (fen: string) => {
//       const engine = engineRef.current;
//       if (!engine || !isReady) {
//         console.warn("Engine not ready");
//         return false;
//       }

//       console.log("Sending position:", fen);
//       setIsCalculating(true);
//       setIsReady(false); // Esperamos nuevo readyok

//       const listener = (e: MessageEvent) => {
//         if (e.data === "readyok") {
//           engine.removeEventListener("message", listener);
//           engine.postMessage("go movetime 4000");
//         }
//       };

//       engine.addEventListener("message", listener);

//       engine.postMessage("ucinewgame");
//       engine.postMessage(`position fen ${fen}`);
//       engine.postMessage("isready"); // Solo luego mandamos go

//       return true;
//     },
//     [isReady]
//   );

//   return {
//     setPositionAndGo,
//     isReady,
//     isCalculating,
//   };
// }
