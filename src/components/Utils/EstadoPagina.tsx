import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./EstadoPagina.css"; // Nuevo archivo CSS para estos estados

type EstadoPaginaProps = {
  tipo: "loading" | "error" | "notFound" | "noData";
  mensaje?: string;
  mostrarBotonVolver?: boolean;
  children?: ReactNode;
};

export default function EstadoPagina({
  tipo,
  mensaje,
  mostrarBotonVolver = true,
  children = <></>,
}: EstadoPaginaProps) {
  const navigate = useNavigate();

  const contenido = {
    loading: {
      icono: "⏳",
      titulo: "Cargando...",
      mensajePredeterminado: "Por favor espera mientras cargamos los datos.",
    },
    error: {
      icono: "❌",
      titulo: "Error",
      mensajePredeterminado: "Ocurrió un error al cargar los datos.",
    },
    notFound: {
      icono: "🔍",
      titulo: "NOT FOUND",
      mensajePredeterminado: "La página que buscas no se encuentra disponible",
    },
    noData: {
      icono: "📭",
      titulo: "Sin datos",
      mensajePredeterminado: "No hay datos disponibles en este momento.",
    },
  };

  const { icono, titulo, mensajePredeterminado } = contenido[tipo];

  return (
    <div className="estado-pagina-container">
      <div className="estado-pagina-contenido">
        <div className="estado-pagina-icono">{icono}</div>
        <h1 className="estado-pagina-titulo">{titulo}</h1>
        <p className="estado-pagina-mensaje">
          {mensaje || mensajePredeterminado}
        </p>
        <div>{children}</div>

        {mostrarBotonVolver && (
          <button className="estado-pagina-boton" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        )}
      </div>
    </div>
  );
}
