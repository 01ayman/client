import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Header = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const logo = "/assets/logo_blanco.png";
  return (
    <header>
      <a
        onClick={() => {
          navigate("/");
        }}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="" />
      </a>
      <div>
        <a href="#" onClick={() => navigate("/jugar")}>
          Jugar
        </a>
        <a href="#" onClick={() => navigate("/lecciones")}>
          Lecciones
        </a>
        <a href="#" onClick={() => navigate("/jugar")}>
          Historial
        </a>
        <a href="#" onClick={() => navigate("/jugar")}>
          Ranking
        </a>
        <a href="#" onClick={() => navigate("/jugar")}>
          Informes
        </a>
      </div>
      <div className="header-avatar">
        <a href="">
          <img
            src={usuario?.avatar ? usuario.avatar : "/assets/avatar.png"}
            alt="Avatar"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
        </a>
        <a onClick={logout} style={{ cursor: "pointer" }}>
          Cerrar sesión
        </a>
      </div>
    </header>
  );
};
