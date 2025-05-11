import { API_URL } from "../constants/GlobalConstants";

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

interface GameEvent {
  type: string;
  [key: string]: any;
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

export async function terminarPartida(gameId: string): Promise<boolean> {
  const res = await fetch(`${import.meta.env.API_URL}lichess/resign/${gameId}`);
  const data = res.ok;
  return data;
}
