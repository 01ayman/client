import React, { useState } from "react";
import "./CambiarContrasena.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constants/GlobalConstants";

const urlEmail = API_URL + "auth/enviar-correo-contrasena";

const ContrasenaOlvidada = () => {
  const [email, setEmail] = useState(localStorage.getItem("login_user") ?? "");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    setMessage("");
    e.preventDefault();
    if (email) {
      try {
        const response = await fetch(urlEmail, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo: email }),
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          return;
        }
        if (data.code !== 200) {
          setMessage(data?.message);
          return;
        }
        setMessage("Verifique el correo para cambiar la contraseña");
      } catch (err) {
        setMessage("Ha ocurrido un error, intente de nuevo en unos minutos");
        return;
      }
    }
  };

  return (
    <div className="contrasena-bg">
      <form className="contrasena-form-container" onSubmit={handleSubmit}>
        <h2 className="contrasena-title">RECUPERAR CONTRASEÑA</h2>
        <input
          type="email"
          placeholder="email"
          className="contrasena-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="contrasena-btn" onClick={handleSubmit}>
          Enviar correo verificación
        </button>
        {message && <div className="contrasena-message">{message}</div>}
        <a
          href=""
          style={{ color: "white", textAlign: "center" }}
          onClick={() => navigate("/login")}
        >
          Volver al inicio
        </a>
      </form>
    </div>
  );
};

export default ContrasenaOlvidada;
