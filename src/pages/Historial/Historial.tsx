import React, { useEffect, useState } from "react";
import "./Historial.css";
import { getHistory } from "../../services/userService";
import { Chessboard } from "react-chessboard";

export default function Historial() {
  const [partidas, setPartidas] = useState<any>([]);

  useEffect(() => {
    const fetchPartidas = async () => {
      const p = await getHistory();
      setPartidas(p);
      console.log(p);
    };
    fetchPartidas();
  }, []);

  return (
    <div className="bg-container">
      <div className="historial-container">
        <h2>Historial de Partidas</h2>
        <div className="historial-lista">
          {partidas.length === 0 ? (
            <div className="historial-vacio">No hay partidas registradas.</div>
          ) : (
            partidas.map((partida: any) => (
              <div className="historial-item" key={partida.id}>
                <div>
                  <div className="historial-fecha">
                    <b>Fecha:</b> {partida.creada_en}
                  </div>
                  <div>
                    <b>Tiempo:</b> {partida.tiempo} min
                  </div>
                  <div>
                    <b>Modo:</b>{" "}
                    {partida.contra_maquina
                      ? "Contra máquina"
                      : "Contra jugador"}
                  </div>
                  {partida.contra_maquina && (
                    <div>
                      <b>Nivel máquina:</b> {partida.nivel_maquina}
                    </div>
                  )}
                  <div className="movimientos-container-historial">
                    <b>Movimientos:</b> <p>{partida.movimientos}</p>
                  </div>
                  <div
                    className={`resultado-container ${
                      partida.resultado === "1-0"
                        ? "victoria"
                        : partida.resultado === "0-1"
                        ? "derrota"
                        : "empate"
                    }`}
                  >
                    <b>Resultado:</b> {partida.resultado}
                  </div>
                </div>
                <Chessboard
                  position={partida.fen_final}
                  boardWidth={200}
                  arePiecesDraggable={false}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
