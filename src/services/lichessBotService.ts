import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useEffect, useState } from "react";

// src/services/lichessService.ts
interface GameSettings {
  level?: number; // 1-8
  color?: "white" | "black" | "random";
  clock?: {
    limit: number; // segundos
    increment?: number; // segundos
  };
  variant?: "standard" | "chess960";
}

interface GameHandlers {
  onMessage: (event: GameEvent) => void;
  onError?: (error: Error | Event) => void;
  onEnd?: (reason: GameEndReason) => void; // Usamos string literal type
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
    console.log(data);

    return data;
  } catch (error) {
    console.log("Error en makeMove:", error);
    return { ok: false };
  }
}

export function streamGame(gameId: string, handlers: GameHandlers): () => void {
  const url = `${import.meta.env.VITE_API_URL}lichess/stream/${gameId}`;
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(data);
      handlers.onMessage(data);
    } catch (error) {
      console.log("Error parsing SSE message:", error);
    }
  };

  eventSource.onerror = (err) => {
    console.log("SSE connection error:", err);
    const reason: GameEndReason =
      eventSource.readyState === EventSource.CLOSED ? "timeout" : "unknown";

    handlers.onEnd?.(reason);
    handlers.onError?.(err);

    eventSource.close();
    eventSource.close(); // optional: auto-close on error
  };

  // Cleanup function
  return () => {
    eventSource.close();
  };
  // const controller = new AbortController();
  // const signal = controller.signal;

  // const streamUrl = `${import.meta.env.VITE_API_URL}lichess/stream/${gameId}`;

  // fetch(streamUrl, {
  //   method: "GET",
  //   headers: {
  //     Authorization: `Bearer ${import.meta.env.VITE_LICHESS_TOKEN}`,
  //     Accept: "text/event-stream",
  //   },
  //   signal,
  // })
  //   .then(async (res) => {
  //     const reader = res.body?.getReader();
  //     const decoder = new TextDecoder("utf-8");

  //     let buffer = "";

  //     while (true) {
  //       const { done, value } = await reader!.read();
  //       if (done) break;

  //       buffer += decoder.decode(value, { stream: true });

  //       const parts = buffer.split("\n\n");

  //       for (const part of parts.slice(0, -1)) {
  //         const lines = part.split("\n").filter((l) => l.startsWith("data: "));
  //         const data = lines.map((l) => l.replace(/^data:\s*/, "")).join("");
  //         if (data) {
  //           try {
  //             const parsed = JSON.parse(data);
  //             console.log(parsed);
  //             setMessages((prev) => [...prev, parsed]);
  //           } catch (err) {
  //             console.error("❌ JSON malformado:", data);
  //           }
  //         }
  //       }

  //       buffer = parts[parts.length - 1]; // mantiene lo que no terminó en \n\n
  //     }
  //   })
  //   .catch((err) => {
  //     console.error("❌ Error en stream SSE:", err);
  //   });

  // return () => controller.abort(); // limpieza al desmontar
}

export async function terminarPartida(gameId: string): Promise<boolean> {
  const res = await fetch(`${import.meta.env.API_URL}lichess/resign/${gameId}`);
  const data = res.ok;
  return data;
}
