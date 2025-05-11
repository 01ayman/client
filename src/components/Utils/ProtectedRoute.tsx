import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ReactNode, useEffect } from "react";
import EstadoPagina from "./EstadoPagina";

const ProtectedRoute = ({
  children,
  logged,
}: {
  children: ReactNode;
  logged: boolean;
}) => {
  const { usuario, loading } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!loading && logged && !usuario) {
      navigate("/login");
    } else if (!logged && usuario) {
      navigate("/");
    }
  }, [usuario, logged, navigate, loading]);

  if (loading) return <EstadoPagina tipo="loading"></EstadoPagina>;

  return children;
};

export default ProtectedRoute;
