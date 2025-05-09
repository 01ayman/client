import React, { useState } from "react";
import "./CambiarContrasena.css";
import { useNavigate, useParams } from "react-router-dom";

const urlEmail = import.meta.env.VITE_API_URL + "auth/cambiar-contrasena";

const CambiarContrasena = () => {
  const { id, token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    setMessage("");
    e.preventDefault();
    if (newPassword === confirmPassword) {
      console.log(newPassword);
      try {
        const response = await fetch(urlEmail, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id,
            token: token,
            contrasena: newPassword,
          }),
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          setMessage("Ha ocurrido un error, intente de nuevo");
          return;
        }
        if (data == true) {
          navigate("/login");
        } else {
          setMessage("Token no válido, solicite uno de nuevo");
        }
      } catch (err) {
        setMessage("Ha ocurrido un error, intente de nuevo");
        return;
      }
    } else {
      setMessage("las contraseñas no coinciden");
    }
  };

  return (
    <div className="contrasena-bg">
      <form className="contrasena-form-container" onSubmit={handleSubmit}>
        <h2 className="contrasena-title">CAMBIAR CONTRASEÑA</h2>
        <input
          type="password"
          placeholder="nueva contraseña"
          className="contrasena-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="confirmar nueva contraseña"
          className="contrasena-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="contrasena-btn" onClick={handleSubmit}>
          Cambiar contraseña
        </button>
        {message && <div className="contrasena-message">{message}</div>}
      </form>
    </div>
  );
};

export default CambiarContrasena;
