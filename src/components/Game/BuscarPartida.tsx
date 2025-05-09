import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

const socket = io("http://localhost:3001");

const BuscarPartida = () => {
  // const [mensaje, setMensaje] = useState('🔎 Buscando partida...');
  const { state } = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    socket.emit("buscar_partida", {
      nombre: usuario?.nombre,
      elo: usuario?.elo,
      modo: state?.modo,
      tiempo: state?.tiempo,
    });

    socket.on("partida_encontrada", (data) => {
      console.log("✅ Partida encontrada:", data);
      navigate(`/partida/${data.partidaId}`, { state: data });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{/*mensaje*/}</h2>
    </div>
  );
};

export default BuscarPartida;
