import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";
import { Message } from "../../components/Utils/Message";
import ChessError from "../../components/Utils/Error";

const Perfil = () => {
  const { user, updateProfile, updateEmail, updatePassword, loading } =
    useAuth();

  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.nombre,
        email: user.correo,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setAvatarPreview(user.avatar || "/assets/avatar.png");
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleEditMode = (field: keyof typeof editMode) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (field: keyof typeof editMode) => {
    setError("");
    setMessage("");

    try {
      if (field === "name" && editMode.name) {
        await updateProfile({ nombre: formData.name });
        setMessage("Nombre actualizado correctamente");
      }

      if (field === "email" && editMode.email) {
        await updateEmail(formData.currentPassword, formData.email);
        setMessage("Correo actualizado correctamente");
      }

      if (field === "password" && editMode.password) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
        await updatePassword(formData.currentPassword, formData.newPassword);
        setMessage("Contraseña actualizada correctamente");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      if (avatarFile) {
        await updateProfile({ avatar: avatarFile });
        setMessage((msg) => msg + " Avatar actualizado correctamente.");
        setAvatarFile(null);
      }

      toggleEditMode(field);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el perfil"
      );
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="profile-container">
      <h1 className="profile-title">Mi Perfil</h1>

      {message && <Message message={message} />}
      {error && <ChessError label={error} />}

      <div className="profile-section">
        <div className="avatar-container">
          <img src={avatarPreview} alt="Avatar" className="profile-avatar" />
          <button onClick={triggerFileInput} disabled={loading}>
            Cambiar
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-info">
          {/* Nombre */}
          <div className="profile-field">
            <label>Nombre de usuario</label>
            {editMode.name ? (
              <div className="edit-field">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button onClick={() => handleSubmit("name")} disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => toggleEditMode("name")}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="view-field">
                <span>{formData.name}</span>
                <button onClick={() => toggleEditMode("name")}>Editar</button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="profile-field">
            <label>Correo electrónico</label>
            {editMode.email ? (
              <div className="edit-field">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Contraseña actual"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <button
                  onClick={() => handleSubmit("email")}
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => toggleEditMode("email")}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="view-field">
                <span>{formData.email}</span>
                <button onClick={() => toggleEditMode("email")}>Editar</button>
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div className="profile-field">
            <label>Contraseña</label>
            {editMode.password ? (
              <div className="edit-password">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Contraseña actual"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Nueva contraseña"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar nueva contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <div className="password-actions">
                  <button
                    onClick={() => handleSubmit("password")}
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => toggleEditMode("password")}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="view-field">
                <span>••••••••</span>
                <button onClick={() => toggleEditMode("password")}>
                  Cambiar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="profile-stats">
        <h2>Estadísticas</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{user?.elo ?? 1200}</span>
            <span className="stat-label">ELO</span>
          </div>
          {/* Puedes añadir más estadísticas si las traes desde getUserStats() */}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
