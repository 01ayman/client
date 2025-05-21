import { API_URL } from "../constants/GlobalConstants";

const getToken = () => {
  return localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
};

export const getAuthHeader = () => {
  const token = getToken();
  // console.log(token);
  if (!token) throw new Error("No autenticado");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}usuarios/me`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Error obteniendo perfil");
  return await response.json();
};

export const updateProfile = async (data: {
  nombre?: string;
  avatar?: File;
}) => {
  const token = getToken();
  if (!token) throw new Error("No autenticado");

  const formData = new FormData();
  if (data.nombre) formData.append("nombre", data.nombre);
  if (data.avatar) formData.append("avatar", data.avatar);

  const response = await fetch(`${API_URL}users/update-profile`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error("Error actualizando perfil");
  return await response.json();
};

export const updateEmail = async (
  currentPassword: string,
  newEmail: string
) => {
  try {
    const response = await fetch(`${API_URL}usuarios/update-email`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify({
        currentPassword: currentPassword,
        newEmail: newEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar el email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateEmail:", error);
    throw error;
  }
};

export const updateName = async (name: string) => {
  // console.log(name);
  // console.log(getAuthHeader());
  const response = await fetch(`${API_URL}usuarios/update-name`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  // console.log(data);
  if (!response.ok) throw new Error("Error actualizando email");
  return data;
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await fetch(`${API_URL}users/update-password`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) throw new Error("Error actualizando contraseña");
  return await response.json();
};

export const getUserStats = async () => {
  const response = await fetch(`${API_URL}users/stats`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) throw new Error("Error obteniendo estadísticas");
  return await response.json();
};

export const getGameHistory = async (limit: number = 10) => {
  const response = await fetch(`${API_URL}users/game-history?limit=${limit}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) throw new Error("Error obteniendo historial");
  return await response.json();
};

export const uploadImage = async (file: File): Promise<string> => {
  const token = getToken();
  if (!token) throw new Error("No autenticado");

  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}usuarios/update-avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) throw new Error("Error subiendo imagen");
  const data = await response.json();
  console.log(data);
  return data.url;
};

export const getHistory = async () => {
  try {
    const res = await fetch(`${API_URL}usuarios/obtener-partidas`, {
      headers: getAuthHeader(),
    });
    const partidas = await res.json();
    return partidas;
  } catch (err: any) {
    console.log(err);
  }
};
