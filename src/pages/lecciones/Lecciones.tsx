import React, { useEffect, useState } from "react";
import "./Lecciones.css";
import { useNavigate } from "react-router-dom";
import {
  getProgresoLeccion,
  loadCompleteLeccionesData,
} from "../../services/leccionesService";
import EstadoPagina from "../../components/Utils/EstadoPagina";

export default function Lecciones() {
  const [leccionesData, setLeccionesData] = useState<any>(null);
  const [nivel, setNivel] = useState<
    "principiante" | "intermedio" | "avanzado"
  >((localStorage.getItem("nivel") as any) || "principiante");
  const [leccionSeleccionada, setLeccionSeleccionada] = useState<any>(
    (JSON.parse(localStorage.getItem("leccion")!) as any) || null
  );
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progresoPorLeccion, setProgresoPorLeccion] = useState<{
    [key: number]: any;
  }>({});

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadCompleteLeccionesData();
        setLeccionesData(data);

        const usuarioId = parseInt(localStorage.getItem("usuario_id") || "0");
        if (usuarioId && data?.lessons) {
          await cargarProgresos(usuarioId, data.lessons);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cargarProgresos = async (usuarioId: number, lecciones: any[]) => {
    const progresos: { [key: number]: any } = {};

    for (const leccion of lecciones) {
      const data = await getProgresoLeccion(usuarioId, leccion.id);
      if (data) {
        progresos[leccion.id] = data;
      }
    }

    setProgresoPorLeccion(progresos);
  };

  const leccionesFiltradas = leccionesData
    ? leccionesData.lessons.filter((l: any) => l.nivel === nivel)
    : [];

  const handleNivelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoNivel = e.target.value as
      | "principiante"
      | "intermedio"
      | "avanzado";
    localStorage.setItem("nivel", nuevoNivel);
    setNivel(nuevoNivel);
    setLeccionSeleccionada(null);
    setEjercicioSeleccionado(null);
  };

  const handleLeccionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const leccionId = parseInt(e.target.value);
    const leccion =
      leccionesFiltradas.find((l: any) => l.id === leccionId) || null;
    localStorage.setItem("leccion", JSON.stringify(leccion));
    setLeccionSeleccionada(leccion);
    setEjercicioSeleccionado(null);
  };

  const handleEjercicioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ejercicioId = parseInt(e.target.value);
    const ejercicio =
      leccionSeleccionada?.ejercicios.find((e: any) => e.id === ejercicioId) ||
      null;
    localStorage.setItem("ejercicio", JSON.stringify(ejercicio));
    setEjercicioSeleccionado(ejercicio);
  };

  if (loading) return <EstadoPagina tipo="loading" />;
  if (error) return <EstadoPagina tipo="error">{error}</EstadoPagina>;
  if (!leccionesData)
    return <EstadoPagina tipo="error">No hay datos disponibles</EstadoPagina>;

  return (
    <div className="bg-lecciones">
      <div className="panel-niveles">
        <h2 className="panel-titulo">Lecciones de Ajedrez</h2>

        <div className="panel-control">
          <label className="panel-label">Nivel:</label>
          <select
            value={nivel}
            onChange={handleNivelChange}
            className="panel-select"
          >
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>

        <div className="panel-control">
          <label className="panel-label">Lección:</label>
          <select
            value={leccionSeleccionada?.id || ""}
            onChange={handleLeccionChange}
            className="panel-select"
          >
            <option value="">Selecciona una lección</option>
            {leccionesFiltradas.map((leccion: any) => {
              const progreso = progresoPorLeccion[leccion.id];
              const completados = progreso?.completados ?? 0;
              const total = progreso?.total ?? leccion.ejercicios.length;
              return (
                <option key={leccion.id} value={leccion.id}>
                  {leccion.titulo} ( {completados} ejercicios de {total}{" "}
                  completados)
                </option>
              );
            })}
          </select>
        </div>

        {leccionSeleccionada && leccionSeleccionada.ejercicios.length > 0 && (
          <div className="panel-control">
            <label className="panel-label">Ejercicio:</label>
            <select
              value={ejercicioSeleccionado?.id || ""}
              onChange={handleEjercicioChange}
              className="panel-select"
            >
              <option value="">Selecciona un ejercicio</option>
              {leccionSeleccionada.ejercicios.map((ejercicio: any) => (
                <option key={ejercicio.id} value={ejercicio.id}>
                  {ejercicio.titulo}
                </option>
              ))}
            </select>
          </div>
        )}

        {ejercicioSeleccionado && (
          <div className="panel-detalles-ejercicio">
            <h3>{ejercicioSeleccionado.titulo}</h3>
            <p>{ejercicioSeleccionado.descripcion}</p>
            <div className="panel-fen">
              <strong>FEN inicial:</strong> {ejercicioSeleccionado.fenInicial}
            </div>
            <button
              className="panel-boton-empezar"
              onClick={() =>
                navigate("/ejercicio", {
                  state: {
                    ejercicio: ejercicioSeleccionado,
                    from: `/lecciones?nivel=${nivel}`,
                  },
                })
              }
            >
              Empezar Ejercicio ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
