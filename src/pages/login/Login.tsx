import React, { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate, useParams } from "react-router-dom";
import { Message } from "../../components/Utils/Message";
import ChessError from "../../components/Utils/Error";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "../../components/Utils/Loader"; 
import { API_URL, isProduction } from "../../constants/GlobalConstants";

const urlLogin = API_URL + "auth/login";
const urlEmail = API_URL + "auth/enviar-correo-verificacion";

const Login = () => {
  const { id, token } = useParams();
  const [user, setUser] = useState(
    () => localStorage.getItem("login_user") || ""
  );
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [loading, setLoading] = useState(false);
  const { usuario, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("login_user", user);
  }, [user]);

  const sendVerificationEmail = async () => {
    setError("");
    setVerifyMessage("");
    setLoading(true); 
    try {
      const response = await fetch(urlEmail, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: user, contrasena: password }),
      });
      const data = await response.json();
      // console.log(data);
      if (!response.ok) {
        setError(data.error || "Error en el login");
        return;
      }
      if (data.code !== 200) {
        setError(data.message);
        return;
      }
      setVerifyMessage(data.message);
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifyMessage("");
    setLoading(true); 
    // console.log(API_URL);
    // console.log(isProduction);
    if (!user || !password) {
      alert("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    const userLogin = {
      correo: user,
      contrasena: password,
    };

    try {
      const response = await fetch(urlLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userLogin),
      });

      const data = await response.json();
      // console.log(data);
      if (!response.ok) {
        setError(data.error || "Error en el login");
        return;
      }

      if (data.code && data.code !== 200) {
        setError(data.message);
        if (data.code === 403) {
          setIsVerified(false);
          return;
        }
        return;
      }

      if (remember) {
        localStorage.setItem("jwtToken", data.token);
      } else {
        sessionStorage.setItem("jwtToken", data.token);
      }
      login(data.token);
      navigate("/");
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (token && !usuario) {
      setLoading(true); 
      if (location.pathname.includes("verify")) {
        fetch(`${API_URL}auth/verify/${id}/${token}`)
          .then((res) => res.json())
          .then((data) => {
            // console.log(data);
            if (data === true) {
              setVerifyMessage(
                "¡Cuenta verificada correctamente! Ya puedes iniciar sesión."
              );
            } else {
              setError(
                "El enlace de verificación no es válido o ya fue usado."
              );
            }
          })
          .catch(() => setError("Error al verificar el token."))
          .finally(() => setLoading(false)); 
      }
    }
  }, [token]);

  return (
    <div className="login-bg">
      <form onSubmit={handleSubmit} className="login-form-container">
        <h2 className="login-title">INICIAR SESIÓN</h2>
        <input
          type="email"
          placeholder="correo"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="login-input"
          required
          disabled={loading}
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
          disabled={loading}
        />
        <button
          type="button"
          style={{
            border: "none",
            width: "fit-content",
            textAlign: "center",
            color: "white",
            fontSize: "1rem",
            marginBottom: "1rem",
            alignSelf: "center",
            borderRadius: "10px",
            backgroundColor: "black",
            padding: "0.4rem",
            cursor: "pointer",
          }}
          onClick={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        </button>
        <div className="login-options">
          <label className="login-checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: "#fff" }}
              disabled={loading}
            />
            Recordarme
          </label>
          <a
            href="#"
            style={{
              color: "#fff",
              textDecoration: "underline",
              fontSize: "1rem",
            }}
            onClick={(e) => {
              e.preventDefault();
              !loading && navigate("/cambiar-contrasena");
            }}
          >
            ¿Contraseña olvidada?
          </a>
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <Loader size="small" /> : "Iniciar sesión"}
        </button>
        <div className="login-register">
          ¿No tienes una cuenta?{" "}
          <a
            href="#"
            style={{
              color: "#fff",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
            onClick={(e) => {
              e.preventDefault();
              !loading && navigate("/registro");
            }}
          >
            Regístrate
          </a>
        </div>
        {verifyMessage && <Message message={verifyMessage} />}
        {error && <ChessError label={error} />}
        {!isVerified && (
          <button
            type="button"
            className="verify-btn"
            onClick={sendVerificationEmail}
            disabled={loading}
          >
            {loading ? <Loader size="small" /> : "Volver a verificar"}
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;
