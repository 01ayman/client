import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./socket";
import { usePartida } from "../../context/PartidaContext";
import "./PanelGame.css";
import { useAuth } from "../../context/AuthContext";
import { Chess } from "chess.js";
import { createGame, terminarPartida } from "../../services/lichessBotService";

interface PanelGameProps {
  game: Chess;
  onReset: () => void;
  waitingForAI?: boolean;
  tBlancas: string;
  tNegras: string;
  color: string;
}

const PanelGame = ({
  game,
  onReset,
  waitingForAI,
  tBlancas = "0:00",
  tNegras = "0:00",
  color = "w",
}: PanelGameProps) => {
  const [modo, setModo] = useState("Contra jugador");
  const [tiempo, setTiempo] = useState("5");
  const [dificultad, setDificultad] = useState(5);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [juegoTerminado, setJuegoTerminado] = useState<boolean>(false);
  const [movimientos, setMovimientos] = useState<string[]>([]);
  const { setPartida, setJugadores, partida } = usePartida();
  const [gameState, setGameState] = useState<string | null>(null);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (juegoTerminado) {
      setMovimientos([]);
    }
  }, [juegoTerminado]);

  const reset = () => {
    setMovimientos([]);
    setJuegoTerminado(false);
    setGameState(null);
  };

  const handleRematch = async () => {
    buscarPartida();
  };

  useEffect(() => {
    if (game) {
      if (game.history().length > movimientos.length) {
        const newMove = game.history().slice(-1)[0];
        setMovimientos((prev) => [...prev, newMove]);
      }
    }
  }, [game, movimientos.length]);

  useEffect(() => {
    const handlePartidaEncontrada = (data: any) => {
      setPartida(data.partida);
      setJugadores(data.jugadores);
      navigate("/partida");
      setBuscando(false);
    };

    const handleError = (error: string) => {
      alert(`Error: ${error}`);
      setBuscando(false);
    };

    socket.on("partida_encontrada", handlePartidaEncontrada);
    socket.on("error_partida", handleError);

    return () => {
      socket.off("partida_encontrada", handlePartidaEncontrada);
      socket.off("error_partida", handleError);
    };
  }, [navigate, setPartida, setJugadores]);

  const buscarPartida = async () => {
    reset();
    if (modo === "Contra máquina") {
      const response = await createGame({
        level: dificultad,
        clock: {
          limit: Number(tiempo.split(" ")[0]) * 60,
          increment: 0,
        },
        color: "white",
      });

      const jugador = {
        nombre: usuario!.nombre,
        elo: usuario!.elo,
        color: "blanco",
        id: usuario?.id,
      };

      const maquina = {
        nombre: `IA`,
        nivel: dificultad,
        color: "negro",
      };
      const partida = {
        id: response.id,
        tiempo: Number(tiempo.split(" ")[0]) * 60,
        dificultad,
        jugador_b: jugador,
        jugador_n: maquina,
        fecha: new Date(),
      };
      onReset();
      setPartida(partida);
      setJugadores([jugador, maquina]);
      navigate("/jugar");
    } else {
      if (!buscando) {
        if (socket.connect()) {
          socket.emit("buscar_partida", {
            nombre: usuario?.nombre || "Anónimo",
            elo: usuario?.elo || 800,
            modo,
            tiempo,
          });
        }
        setBuscando(true);
      }
    }
  };

  const renderizarMovimientos = () => {
    const pairs = [];
    for (let i = 0; i < movimientos.length; i += 2) {
      pairs.push(
        <div key={i} className="movimiento-par">
          <span className="numero-movimiento">{i / 2 + 1}.</span>
          <span className="movimiento-blanco">{movimientos[i]}</span>
          {movimientos[i + 1] && (
            <span className="movimiento-negro">{movimientos[i + 1]}</span>
          )}
        </div>
      );
    }
    return pairs;
  };

  if (!partida) {
    return (
      <div className="panel-game">
        <div className="panel-section">
          <label className="panel-label" htmlFor="modo-select">
            MODO DE JUEGO
          </label>
          <select
            id="modo-select"
            className="panel-select"
            value={modo}
            onChange={(e) => setModo(e.target.value)}
          >
            <option value="Contra máquina">Contra máquina</option>
            <option value="Contra jugador">Contra jugador</option>
          </select>
        </div>

        {modo === "Contra máquina" && (
          <div className="panel-section">
            <label className="panel-label" htmlFor="dificultad-input">
              DIFICULTAD (1-8)
            </label>
            <input
              type="range"
              id="dificultad-input"
              className="panel-range"
              min="1"
              max="8"
              value={dificultad}
              onChange={(e) => setDificultad(parseInt(e.target.value))}
            />
            <div className="dificultad-value">{dificultad}</div>
          </div>
        )}

        <div className="panel-section">
          <label className="panel-label" htmlFor="tiempo-select">
            TIEMPO
          </label>
          <select
            id="tiempo-select"
            className="panel-select"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
          >
            <option value="1">1 MIN</option>
            <option value="3">3 MIN</option>
            <option value="5">5 MIN</option>
            <option value="10">10 MIN</option>
            <option value="30">30 MIN</option>
          </select>
        </div>

        <button
          className={`panel-buscar ${buscando ? "buscando" : ""}`}
          onClick={buscarPartida}
          disabled={buscando}
        >
          {buscando ? "Buscando..." : "JUGAR"}
        </button>

        {buscando && (
          <button
            className="panel-cancelar"
            onClick={() => {
              socket.emit("cancelar_busqueda");
              setBuscando(false);
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    );
  }

  function resign(color: "w" | "b") {
    const winner = color === "w" ? "negras" : "blancas";
    terminarPartida(
      partida.id,
      "abandono",
      game,
      partida,
      movimientos
    );
    setJuegoTerminado(true);
    setGameState(`El jugador se ha rendido. Ganan las ${winner}.`);
  }

  function draw() {
    const winner = game.turn() === "w" ? "blancas" : "negras";
    terminarPartida(partida.id, "empate", game, partida, movimientos);
    setJuegoTerminado(true);
    setGameState(`El jugador de las ${winner} ofreció tablas`);
    onReset();
  }

  return (
    <div className="panel-game">
      <div className="panel-titulo">
        <h2>MODO: {partida.modo}</h2>
        {partida.modo === "Contra máquina" && (
          <span className="panel-dificultad">Nivel: {partida.dificultad}</span>
        )}
      </div>

      <div className="panel-reloj">
        <div className={`reloj-jugador ${game.turn() === "w" ? "activo" : ""}`}>
          <div className="nombre-jugador">Tú</div>
          <div className="tiempo-jugador">{tBlancas}</div>
        </div>
        <div className={`reloj-jugador ${game.turn() === "b" ? "activo" : ""}`}>
          <div className="nombre-jugador">
            {partida.modo === "Contra máquina" ? "Máquina" : "Oponente"}
          </div>
          <div className="tiempo-jugador">{tNegras}</div>
        </div>
      </div>

      <div className="movimientos-container">
        <h2>MOVIMIENTOS</h2>
        <div className="panel-movimientos">
          {movimientos.length === 0 ? (
            <span className="panel-movimientos-vacio">
              No hay movimientos aún
            </span>
          ) : (
            renderizarMovimientos()
          )}
        </div>
        <div className="panel-estado">
          {waitingForAI && (
            <div className="ia-pensando">
              <div className="spinner"></div>
              <span>La máquina está pensando...</span>
            </div>
          )}
          {game.inCheck() && (
            <div className="ia-pensando">
              <span>Jaque</span>
            </div>
          )}
        </div>
      </div>

      {(game.isGameOver() || juegoTerminado) && (
        <div className="container-resultado">
          <div className="resultado-partida">
            <h3>¡Partida terminada!</h3>
            <p>
              {game.isCheckmate()
                ? `¡Jaque mate! Ganan las ${
                    game.turn() === "w" ? "negras" : "blancas"
                  }`
                : game.isDraw()
                ? "Tablas"
                : `${gameState}`}
            </p>
            <button className="btn-resultado" onClick={handleRematch}>
              Volver a jugar
            </button>
            <button
              className="btn-resultado"
              onClick={() => {
                onReset();
                setPartida(null);
                reset();
              }}
            >
              Volver atrás
            </button>
          </div>
        </div>
      )}

      <div className="panel-botones">
        <button
          className="panel-boton"
          disabled={game.turn() !== color}
          onClick={() => {
            onReset();
            draw();
          }}
        >
          <span>½</span> TABLAS
        </button>
        <button
          className="panel-boton"
          onClick={() => {
            onReset();
            resign("w");
          }}
        >
          <span className="material-symbols-outlined">flag</span> RENDIRSE
        </button>
      </div>
    </div>
  );
};

export default PanelGame;
