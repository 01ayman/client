export interface GameState {
  type: "gameState"; // Tipo de mensaje (estado del juego)
  moves: string; // Lista de movimientos en formato UCI, separados por espacios
  wtime: number; // Tiempo restante para las blancas (en milisegundos)
  btime: number; // Tiempo restante para las negras (en milisegundos)
  winc: number; // Incremento por movimiento de blancas (en milisegundos)
  binc: number; // Incremento por movimiento de negras (en milisegundos)
  status:
    | "started"
    | "aborted"
    | "mate"
    | "resign"
    | "stalemate"
    | "draw"
    | "timeout"
    | string;
}
