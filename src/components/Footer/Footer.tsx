import "./Footer.css";
const Footer = () => {
  return (
    <footer>
      <p className="footer-title">Aprende. Juega. Mejora.</p>
      <p className="footer-desc">
        Somos una plataforma creada para el aprendizaje y entrenamiento.
        Disfruta con miles de partidas, retos y lecciones para todos los
        niveles. ¡Únete a nuestra comunidad y mejora tu ajedrez!
      </p>
      <div className="footer-links">
        <button>Inicio</button>
        <button>Contacto</button>
      </div>
      <p className="footer-copy">
        © 2024 ChessLearn. Todos los derechos reservados.
      </p>
      <div className="footer-social">
        {/* Aquí puedes poner iconos de redes sociales si lo deseas */}
        <img
          src="./../../../public/logo_blanco.png"
          alt="ChessLearn Logo"
          className="footer-logo"
        />
      </div>
    </footer>
  );
};

export default Footer;
