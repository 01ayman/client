import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import { useAuth } from "../../context/AuthContext";

const MainPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(usuario ? path : "/login");
  };

  return (
    <div className="mainpage-container">
      <section className="mainpage-hero">
        <img
          src="/assets/rsz_logo_blanco.png"
          alt="ChessLearn Logo"
          className="mainpage-logo"
          loading="lazy"
        />
        <p className="mainpage-subtitle">Aprende. Juega. Mejora.</p>
        <button
          className="mainpage-btn mainpage-btn-primary"
          onClick={() => handleNavigation("/jugar")}
        >
          Comienza ya
        </button>
      </section>

      <section className="mainpage-section">
        <h2>
          JUEGA EN
          <br />
          TIEMPO REAL
        </h2>
        <button
          className="mainpage-btn"
          onClick={() => handleNavigation("/jugar")}
        >
          Jugar
        </button>
      </section>

      <section className="mainpage-section">
        <h2>
          LECCIONES POR
          <br />
          NIVELES
        </h2>
        <button
          className="mainpage-btn"
          onClick={() => handleNavigation("/lecciones")}
        >
          Aprender
        </button>
      </section>

      <section className="mainpage-section">
        <h2>
          RANKING Y<br />
          LOGROS
        </h2>
        <button
          className="mainpage-btn"
          onClick={() => handleNavigation("/ranking")}
        >
          Ver ranking
        </button>
      </section>
    </div>
  );
};

export default MainPage;
