declare module '@chrisoakman/chessboardjs' {
  type PositionType = 'start' | string; // 'start' o notación FEN
  type PieceCode = 'wK'|'wQ'|'wR'|'wB'|'wN'|'wP'|'bK'|'bQ'|'bR'|'bB'|'bN'|'bP';
  type Square = 
    'a1'|'a2'|'a3'|'a4'|'a5'|'a6'|'a7'|'a8'|
    'b1'|'b2'|'b3'|'b4'|'b5'|'b6'|'b7'|'b8'|
    'c1'|'c2'|'c3'|'c4'|'c5'|'c6'|'c7'|'c8'|
    'd1'|'d2'|'d3'|'d4'|'d5'|'d6'|'d7'|'d8'|
    'e1'|'e2'|'e3'|'e4'|'e5'|'e6'|'e7'|'e8'|
    'f1'|'f2'|'f3'|'f4'|'f5'|'f6'|'f7'|'f8'|
    'g1'|'g2'|'g3'|'g4'|'g5'|'g6'|'g7'|'g8'|
    'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'h7'|'h8';

  interface DropEvent {
    source: Square | 'spare';
    target: Square | 'offboard';
    piece: PieceCode;
    newPosition: Record<Square, PieceCode>;
    oldPosition: Record<Square, PieceCode>;
  }

  interface MoveEvent {
    source: Square;
    destination: Square;
    piece: PieceCode;
  }

  interface ChessboardConfig {
    draggable?: boolean;
    position?: PositionType | Record<Square, PieceCode>;
    orientation?: 'white' | 'black';
    showNotation?: boolean;
    onDragStart?: (
      source: Square | 'spare',
      piece: PieceCode,
      currentPosition: Record<Square, PieceCode>,
      orientation: 'white' | 'black'
    ) => boolean | void;
    onDrop?: (
      source: Square | 'spare',
      target: Square | 'offboard',
      piece: PieceCode,
      newPosition: Record<Square, PieceCode>,
      oldPosition: Record<Square, PieceCode>,
      orientation: 'white' | 'black'
    ) => 'snapback' | 'trash' | void;
    onSnapEnd?: (source: Square | 'spare', target: Square, piece: PieceCode) => void;
    onSnapbackEnd?: (
      piece: PieceCode,
      square: Square,
      position: Record<Square, PieceCode>,
      orientation: 'white' | 'black'
    ) => void;
    onMoveEnd?: (
      oldPosition: Record<Square, PieceCode>,
      newPosition: Record<Square, PieceCode>
    ) => void;
    sparePieces?: boolean;
    pieceTheme?: string | ((piece: PieceCode) => string);
    appearSpeed?: number | 'fast' | 'slow';
    moveSpeed?: number | 'fast' | 'slow';
    snapbackSpeed?: number | 'fast' | 'slow';
    snapSpeed?: number | 'fast' | 'slow';
    trashSpeed?: number | 'fast' | 'slow';
    dropOffBoard?: 'snapback' | 'trash';
    dragThrottleRate?: number;
    showErrors?: boolean | 'console' | 'alert' | ((code: number, message: string, obj?: any) => void);
    onChange?: (
      oldPosition: Record<Square, PieceCode>,
      newPosition: Record<Square, PieceCode>
    ) => void;
    onMouseoverSquare?: (
      square: Square,
      piece: PieceCode | false,
      position: Record<Square, PieceCode>,
      orientation: 'white' | 'black'
    ) => void;
    onMouseoutSquare?: (
      square: Square,
      piece: PieceCode | false,
      position: Record<Square, PieceCode>,
      orientation: 'white' | 'black'
    ) => void;
    onDragMove?: (
      newLocation: Square | 'offboard',
      oldLocation: Square | 'offboard',
      source: Square | 'spare',
      piece: PieceCode,
      position: Record<Square, PieceCode>,
      orientation: 'white' | 'black'
    ) => void;
  }

  interface ChessboardInstance {
    clear(useAnimation?: boolean): void;
    destroy(): void;
    fen(): string;
    flip(): 'white' | 'black';
    move(...moves: (string | false)[]): Record<Square, PieceCode>;
    orientation(): 'white' | 'black';
    orientation(newOrientation: 'white' | 'black' | 'flip'): 'white' | 'black';
    position(): Record<Square, PieceCode>;
    position(newPosition: PositionType | Record<Square, PieceCode>, useAnimation?: boolean): void;
    position(format: 'fen'): string;
    resize(): void;
    start(useAnimation?: boolean): void;
  }

  function Chessboard(container: string | HTMLElement, config?: ChessboardConfig): ChessboardInstance;

  function fenToObj(fen: string): Record<Square, PieceCode> | false;
  function objToFen(obj: Record<Square, PieceCode>): string | false;

  export = Chessboard;
}