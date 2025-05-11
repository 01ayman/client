import React, { useEffect, useState } from "react";
import "./Registro.css";
import { useNavigate } from "react-router-dom";
import { Message } from "../../components/Utils/Message";
import ChessError from "../../components/Utils/Error";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "../../components/Utils/Loader";

const Registro = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(
    () => localStorage.getItem("registro_nombre") || ""
  );
  const [email, setEmail] = useState(
    () => localStorage.getItem("registro_email") || ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); 
  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario) {
      navigate("/");
    }
  }, [usuario, navigate]);

  useEffect(() => {
    localStorage.setItem("registro_nombre", nombre);
  }, [nombre]);

  useEffect(() => {
    localStorage.setItem("registro_email", email);
  }, [email]);

  const url = "http://192.168.126.1:3001/api/auth/register";

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true); 

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false); 
      return;
    }

    const newUser = {
      nombre,
      correo: email,
      contrasena: password,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error en el registro");
        setLoading(false);
        return;
      }
      // console.log(data)
      if (data.code !== 200) {
        setError(data.message);
        setLoading(false);
        return;
      } else {
        setMessage(data.message);
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="registro-bg">
      <form className="registro-form-container" onSubmit={registrar}>
        <h2 className="registro-title">REGISTRO</h2>
        <input
          type="text"
          placeholder="nombre"
          className="registro-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={loading} 
        />
        <input
          type="email"
          placeholder="email"
          className="registro-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="contraseña"
          className="registro-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="confirmar contraseña"
          className="registro-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="registro-btn"
          disabled={loading} 
        >
          {loading ? <Loader size="small" /> : "Registrarse"}
        </button>
        <div className="registro-register">
          ¿Ya tienes una cuenta?{" "}
          <a
            href="#"
            className="registro-register-link"
            onClick={() => navigate("/login")}
          >
            Inicia sesión
          </a>
        </div>
        {error && <ChessError label={error} />}
        {message && <Message message={message} />}
      </form>
    </div>
  );
};

export default Registro;
