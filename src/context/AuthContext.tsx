import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constants/GlobalConstants";

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  avatar: string;
  elo: number;
};

type AuthContextType = {
  usuario: Partial<Usuario> | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Partial<Usuario> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(usuario);

  useEffect(() => {
    const stored =
      localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
    if (stored) {
      setToken(stored);
      fetchUser(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (jwtToken: string) => {
    try {
      const res = await fetch(API_URL + "usuarios/me", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!res.ok) throw new Error("Token inválido");

      const data = await res.json();
      console.log(data);
      setUsuario(data);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      localStorage.removeItem("jwtToken");
      sessionStorage.removeItem("jwtToken");
      setToken(null);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (jwtToken: string) => {
    localStorage.setItem("jwtToken", jwtToken);
    setToken(jwtToken);
    await fetchUser(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");
    setToken(null);
    setUsuario(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};
