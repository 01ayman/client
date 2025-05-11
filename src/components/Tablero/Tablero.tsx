import { useState, useRef, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import "./Tablero.css";

interface Props {
  game: Chess;
  makeAMove: (move: {
    from: string;
    to: string;
    promotion?: string;
  }) => any | null;
  waitingForAI: boolean;
  playerColor?: "w" | "b";
}

export default function Tablero({
  game,
  makeAMove,
  waitingForAI,
  playerColor = "w",
}: Props) {
  const [highlightSquares, setHighlightSquares] = useState<{
    [square: string]: React.CSSProperties;
  }>({});
  const [isInvalidMove, setIsInvalidMove] = useState(false);
  const [boardSize, setBoardSize] = useState(500);
  const boardRef = useRef<HTMLDivElement>(null);

  const isPlayerTurn = game.turn() === playerColor && !waitingForAI;

  useEffect(() => {
    if (isInvalidMove) {
      const timer = setTimeout(() => setIsInvalidMove(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isInvalidMove]);

  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        const containerWidth = boardRef.current.offsetWidth;
        const newSize = Math.min(containerWidth, 500);
        setBoardSize(newSize);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onDrop(
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ): boolean {
    if (!isPlayerTurn) return false;

    const promotion = shouldPromote(piece, targetSquare) ? "q" : undefined;

    makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion,
    })
      .then((move: any) => {
        if (!move) {
          setIsInvalidMove(true);
        }
        game.move(move);
      })
      .catch((error: any) => {
        setIsInvalidMove(true);
      });
    return true;
  }

  function shouldPromote(piece: string, targetSquare: string): boolean {
    return (
      piece[1].toLowerCase() === "p" &&
      (targetSquare[1] === "8" || targetSquare[1] === "1")
    );
  }

  function onPieceClick(piece: string, square: Square) {
    if (!isPlayerTurn || piece[0] !== playerColor) {
      return;
    }

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setHighlightSquares({});
      return;
    }

    const highlights: { [square: string]: React.CSSProperties } = {};
    moves.forEach((move) => {
      highlights[move.to] = {
        background: "radial-gradient(circle, #2f9b2b66 36%, transparent 40%)",
        borderRadius: "50%",
      };
    });
    highlights[square] = {
      background: "#2f9b2b66",
    };
    setHighlightSquares(highlights);
  }

  const boardOrientation = playerColor === "w" ? "white" : "black";

  return (
    <div className="chess-container" ref={boardRef}>
      <div
        className={`chessboard-wrapper ${isInvalidMove ? "invalid-move" : ""}`}
      >
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onPieceClick={onPieceClick}
          boardWidth={boardSize}
          customSquareStyles={highlightSquares}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
          }}
          customDarkSquareStyle={{ backgroundColor: "#815426" }}
          customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
          areArrowsAllowed={true}
          animationDuration={200}
          boardOrientation={boardOrientation}
          id="responsive-chessboard"
        />
      </div>
    </div>
  );
}
