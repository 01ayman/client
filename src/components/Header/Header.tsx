import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export const Header = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logo = "/assets/logo_blanco.png";

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="header-logo">
        <a onClick={() => handleNavigation("/")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="ChessLearn Logo" />
        </a>
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className={`header-nav ${isMenuOpen ? "open" : ""}`}>
        <a href="#" onClick={() => handleNavigation("/jugar")}>
          Jugar
        </a>
        <a href="#" onClick={() => handleNavigation("/lecciones")}>
          Lecciones
        </a>
        <a href="#" onClick={() => handleNavigation("/historial")}>
          Historial
        </a>
        <a href="#" onClick={() => handleNavigation("/ranking")}>
          Ranking
        </a>
      </nav>
      <div className="header-avatar">
        <a href="">
          <img
            src={usuario?.avatar ? usuario.avatar : "/assets/avatar.png"}
            alt="Avatar"
            className="avatar-image"
          />
        </a>
        <a onClick={logout} style={{ cursor: "pointer" }}>
          Cerrar sesión
        </a>
      </div>
    </header>
  );
};
