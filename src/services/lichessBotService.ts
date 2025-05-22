import { API_URL } from "../constants/GlobalConstants";
import { getAuthHeader } from "./userService";

interface GameSettings {
  level?: number;
  color?: "white" | "black" | "random";
  clock?: {
    limit: number;
    increment?: number;
  };
  variant?: "standard" | "chess960";
}

interface GameHandlers {
  onMessage: (event: GameEvent) => void;
  onError?: (error: Error | Event) => void;
  onEnd?: (reason: GameEndReason) => void;
}

type GameEndReason =
  | "timeout"
  | "resign"
  | "checkmate"
  | "draw"
  | "abandoned"
  | "unknown";

interface GameResponse {
  id: string;
  url: string;
  color: "white" | "black";
}

interface MoveResponse {
  ok: boolean;
}

export interface GameEvent {
  type: string;
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

const API_TOKEN = import.meta.env.VITE_LICHESS_TOKEN;

export async function createGame(
  settings: GameSettings
): Promise<GameResponse> {
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const params = new URLSearchParams();
  params.append("level", String(settings.level || 3));
  params.append("clock.limit", String(settings.clock?.limit || 180));
  params.append("clock.increment", String(settings.clock?.increment || 0));
  params.append("color", settings.color || "white");
  if (settings.variant) {
    params.append("variant", settings.variant);
  }

  try {
    const res = await fetch("https://lichess.org/api/challenge/ai", {
      method: "POST",
      headers,
      body: params,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Error al crear la partida: ${res.statusText}`
      );
    }
    return await res.json();
  } catch (error) {
    console.error("Error en createGame:", error);
    throw error;
  }
}

export async function makeMove(
  gameId: string,
  move: string
): Promise<MoveResponse> {
  try {
    const res = await fetch(
      `https://lichess.org/api/board/game/${gameId}/move/${move}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Error al realizar el movimiento: ${res.statusText}`
      );
    }
    const data = await res.json();
    // console.log(data);

    return data;
  } catch (error) {
    // console.log("Error en makeMove:", error);
    return { ok: false };
  }
}

export function streamGame(gameId: string, handlers: GameHandlers): () => void {
  const url = `${API_URL}lichess/stream/${gameId}`;
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // console.log(data);
      handlers.onMessage(data);
    } catch (error) {
      // console.log("Error parsing SSE message:", error);
    }
  };

  eventSource.onerror = (err) => {
    // console.log("SSE connection error:", err);
    const reason: GameEndReason =
      eventSource.readyState === EventSource.CLOSED ? "timeout" : "unknown";

    handlers.onEnd?.(reason);
    handlers.onError?.(err);

    eventSource.close();
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

export async function terminarPartida(
  gameId: string,
  reason: string,
  game: any,
  partida: any,
  movimientos: string[]
): Promise<any> {
  const lastPos = Object.keys(game._positionCount)[
    Object.keys(game._positionCount).length - 1
  ];

  const p: any = {
    id: partida.id,
    fecha_inicio: partida.fecha,
    fecha_final: new Date(),
    tiempo: Number(partida.tiempo) / 60,
    fen_final: lastPos,
    movimientos: movimientos.join(","),
    contra_maquina: true,
    nivel_maquina: partida.dificultad,
    creada_en: partida.fecha,
    resultado: "0-1",
  };
  const res = await fetch(`${API_URL}lichess/resign/${gameId}`);

  if (res.ok) {
    switch (reason) {
      case "abandono":
        p.resultado = "0-1";
        break;
      case "empate":
        p.resultado = "1-1";
        break;
      default:
        break;
    }
  }

  const ins = await fetch(`${API_URL}usuarios/insertar-partida`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ partida: p }),
  });
  const data = ins.ok;
  return data;
}
