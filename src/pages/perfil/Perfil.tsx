import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";

const Perfil = () => {
  const { usuario, logout, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showReloginMessage, setShowReloginMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maskedEmail = () => {
    if (!usuario?.correo) return "";
    const [name, domain] = usuario.correo.split("@");
    return `${name[0]}******${name.slice(-1)}@${domain}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    if (!newName.trim()) {
      setNameError("El nombre no puede estar vacío");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUser("nombre", newName);
      if (result && result.success) {
        setSuccessMessage("Nombre actualizado correctamente");
        setShowReloginMessage(true);
        setShowNameModal(false);
      } else {
        setNameError("Error al actualizar el nombre");
      }
    } catch (error) {
      setNameError("Ocurrió un error al actualizar el nombre");
      console.error("Error al actualizar el nombre:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!newEmail.trim()) {
      setEmailError("El correo no puede estar vacío");
      return;
    }

    if (!currentPassword) {
      setEmailError("Debes ingresar tu contraseña actual");
      return;
    }

    if (newEmail === usuario?.correo) {
      setEmailError("El nuevo correo debe ser diferente al actual");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUser("correo", currentPassword, newEmail);
      if (result.ok) {
        setSuccessMessage(
          "Correo actualizado. Por favor verifica tu nuevo correo."
        );
        setShowReloginMessage(true);
        setShowEmailModal(false);
        setCurrentPassword("");
        setNewEmail("");
      } else {
        setEmailError(result.error || "Error al actualizar el correo");
      }
    } catch (error) {
      setEmailError("Ocurrió un error al actualizar el correo");
      console.error("Error al actualizar el correo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateUser("password", newPassword, currentPassword);
      if (result.success) {
        setSuccessMessage("Contraseña actualizada correctamente");
        setTimeout(() => setSuccessMessage(""), 3000);
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(result.error || "Error al actualizar la contraseña");
      }
    } catch (error) {
      setPasswordError("Ocurrió un error al actualizar la contraseña");
      console.error("Error al actualizar la contraseña:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      setNewName(usuario.nombre || "");
      setNewEmail(usuario.correo || "");
    }
  }, [usuario]);

  const handleLogoutWithMessage = async () => {
    await logout();
    navigate("/login", {
      state: {
        message:
          "Por favor inicia sesión nuevamente para completar los cambios",
      },
    });
  };

  return (
    <div className="profile-bg">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Mi Perfil</h1>
          <button
            onClick={handleLogout}
            className="logout-btn"
            disabled={loading}
          >
            Cerrar Sesión
          </button>
        </div>
        {successMessage && (
          <div className="success-message">
            {successMessage}
            <button
              onClick={() => setSuccessMessage("")}
              className="close-message-btn"
            >
              ×
            </button>
          </div>
        )}
        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-container">
              <img
                src={avatarPreview || usuario?.avatar || "https://res.cloudinary.com/dfiucj1to/image/upload/v1746995734/avatar_tuaroe.png"}
                alt="Avatar"
                className="profile-avatar"
              />
              <button
                onClick={triggerFileInput}
                disabled={loading}
                className="avatar-edit-btn"
              >
                Cambiar Avatar
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="profile-section">
            <h2>Información Personal</h2>

            <div className="profile-field">
              <label>Nombre:</label>
              <div className="view-field">
                <span>{usuario?.nombre || "No disponible"}</span>
                <button
                  onClick={() => setShowNameModal(true)}
                  disabled={loading}
                  className="field-btn"
                >
                  Cambiar
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label>Correo:</label>
              <div className="view-field">
                <span>{maskedEmail()}</span>
                <button
                  onClick={() => setShowEmailModal(true)}
                  disabled={loading}
                  className="field-btn"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Seguridad</h2>
            <div className="profile-field">
              <label>Contraseña:</label>
              <div className="view-field">
                <span>••••••••</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  disabled={loading}
                  className="field-btn"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        </div>
        {successMessage && (
          <div className="success-message">
            {successMessage}
            {showReloginMessage && (
              <div className="relogin-message">
                <p>Cierra e inicia sesión para completar la actualización</p>
                <button
                  onClick={handleLogoutWithMessage}
                  className="relogin-btn"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setSuccessMessage("");
                setShowReloginMessage(false);
              }}
              className="close-message-btn"
            >
              ×
            </button>
          </div>
        )}
      </div>
      {showNameModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cambiar Nombre</h3>
            <form onSubmit={handleNameSubmit}>
              <div className="input-group">
                <label>Nuevo nombre:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {nameError && <div className="error-message">{nameError}</div>}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="modal-btn secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-btn primary"
                  disabled={isSubmitting || !newName.trim()}
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cambiar Correo Electrónico</h3>
            <form onSubmit={handleEmailSubmit}>
              <div className="input-group">
                <label>Nuevo correo:</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="input-group">
                <label>Contraseña actual:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {emailError && <div className="error-message">{emailError}</div>}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailError("");
                    setCurrentPassword("");
                  }}
                  className="modal-btn secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-btn primary"
                  disabled={isSubmitting || !newEmail || !currentPassword}
                >
                  {isSubmitting ? "Actualizando..." : "Actualizar Correo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="input-group">
                <label>Contraseña actual:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="input-group">
                <label>Nueva contraseña:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="input-group">
                <label>Confirmar nueva contraseña:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                  }}
                  className="modal-btn secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-btn primary"
                  disabled={
                    isSubmitting ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
