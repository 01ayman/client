import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateLessonProgress } from "../../services/leccionesService";
import Tablero from "../../components/Tablero/Tablero";
import "./Ejercicio.css";

export default function Ejercicio() {
  const location = useLocation();
  const { ejercicio, from } = location.state || {};
  const [game, setGame] = useState<Chess | null>(null);
  const [movimientosRealizados, setMovimientosRealizados] = useState<string[]>(
    []
  );
  const navigate = useNavigate();
  const [ejercicioCompletado, setEjercicioCompletado] = useState(false);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { usuario } = useAuth();

  useEffect(() => {
    if (ejercicio) {
      const nuevoJuego = new Chess(ejercicio.fenInicial);
      setGame(nuevoJuego);
      setMovimientosRealizados([]);
      setEjercicioCompletado(false);
      setMostrarSolucion(false);
      setFeedback("");
    }
  }, [ejercicio]);

  const makeAMove = async (move: {
    from: string;
    to: string;
    promotion?: string;
  }) => {
    if (!game || !ejercicio) return null;

    const movimientoActual = `${move.from}${move.to}`;
    const soluciones = ejercicio.movimientoSolucion
      .split(",")
      .map((m: string) => m.trim());

    if (soluciones.includes(movimientoActual)) {
      const moveResult = game.move(move);
      if (moveResult) {
        setMovimientosRealizados((prev) => [...prev, moveResult.san]);
        setFeedback("¡Correcto! Has encontrado la solución.");
        setEjercicioCompletado(true);
        await actualizarProgreso();
        return moveResult;
      }
    } else {
      setFeedback("Movimiento incorrecto. Intenta de nuevo.");
      return null;
    }
    return null;
  };

  const actualizarProgreso = async () => {
    if (!usuario || !ejercicio) return;

    try {
      // await updateLessonProgress(usuario.id!, ejercicio.id);
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
      setFeedback((prev) => prev + " (No se pudo guardar el progreso)");
    }
  };

  const resetExercise = () => {
    if (!ejercicio) return;
    setGame(new Chess(ejercicio.fenInicial));
    setMovimientosRealizados([]);
    setEjercicioCompletado(false);
    setMostrarSolucion(false);
    setFeedback("");
  };

  const showSolution = () => {
    if (!ejercicio) return;
    const [from, to] =
      ejercicio.movimientoSolucion
        .split(",")[0]
        .trim()
        .match(/.{1,2}/g) || [];
    if (from && to) {
      const tempGame = new Chess(ejercicio.fenInicial);
      tempGame.move({ from, to });
      setGame(tempGame);
      setMostrarSolucion(true);
      setFeedback("Esta es la solución correcta.");
    }
  };

  if (!ejercicio || !game) {
    return (
      <div className="error-message">
        <h2>No se ha seleccionado ningún ejercicio</h2>
        <button onClick={() => navigate(from || "/lecciones")}>
          Volver a lecciones
        </button>
      </div>
    );
  }

  return (
    <div className="ejercicio-container">
      <div className="opacity-container">
        <div className="ejercicio-header">
          <h2>{ejercicio.titulo}</h2>
          <button
            className="volver-btn"
            onClick={() => navigate(from || "/lecciones")}
          >
            &larr; Volver a lecciones
          </button>
        </div>

        <div className="ejercicio-content">
          <div className="chessboard-container">
            <Tablero
              game={game}
              makeAMove={makeAMove}
              waitingForAI={false}
              playerColor="w"
            />
          </div>

          <div className="ejercicio-info">
            <div className="ejercicio-descripcion">
              <h3>Descripción:</h3>
              <p>{ejercicio.descripcion}</p>
            </div>

            <div className="ejercicio-fen">
              <h3>Posición inicial (FEN):</h3>
              <code>{ejercicio.fenInicial}</code>
            </div>

            {movimientosRealizados.length > 0 && (
              <div className="movimientos-realizados">
                <h3>Movimientos:</h3>
                <ul>
                  {movimientosRealizados.map((mov, index) => (
                    <li key={index}>{mov}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback && (
              <div
                className={`feedback ${
                  ejercicioCompletado ? "correcto" : "incorrecto"
                }`}
              >
                {feedback}
              </div>
            )}

            <div className="ejercicio-controls">
              <button onClick={resetExercise} className="control-btn reiniciar">
                Reiniciar ejercicio
              </button>

              {!ejercicioCompletado && !mostrarSolucion && (
                <button onClick={showSolution} className="control-btn solucion">
                  Mostrar solución
                </button>
              )}

              {ejercicioCompletado && (
                <button className="control-btn completado" disabled>
                  Ejercicio completado
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
