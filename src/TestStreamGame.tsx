import { useEffect, useState } from "react";

const TestStreamGame = ({ gameId }: { gameId: string }) => {
  // const [ws, setWs] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    const socket = new WebSocket(
      `wss://lichess.org/api/board/game/stream/${gameId}`
    );

    socket.onopen = () => {
      console.log("Conexión WebSocket establecida para el juego:", gameId);
    };

    socket.onmessage = (event) => {
      console.log("📨 Evento recibido:", event.data);

      try {
        const eventData = JSON.parse(event.data);
        console.log("📦 Datos parseados:", eventData);

        if (eventData.type === "gameState") {
          setGameState(eventData);
          // Aquí puedes procesar los movimientos, por ejemplo:
          if (eventData.moves) {
            console.log("Movimientos recibidos:", eventData.moves);
          }
        }
      } catch (err) {
        console.error("❌ Error al parsear evento:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ Error en WebSocket:", error);
    };

    socket.onclose = () => {
      console.log("Conexión WebSocket cerrada");
    };

    // setWs(socket);

    // Cleanup: cerrar WebSocket cuando el componente se desmonte
    return () => {
      socket.close();
    };
  }, [gameId]);

  return (
    <div>
      <h2>Estado del juego</h2>
      {gameState ? (
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      ) : (
        <p>Cargando estado del juego...</p>
      )}
    </div>
  );
};

export default TestStreamGame;
