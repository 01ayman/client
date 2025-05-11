import { API_URL } from "../constants/GlobalConstants";

export const login = async (correo: string, contrasena: string) => {
  const response = await fetch(`${API_URL}auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, contrasena }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error en el login");
  }
  const data = await response.json();
  // console.log(data);
  return data;
};

export const register = async (userData: {
  nombre: string;
  correo: string;
  contrasena: string;
}) => {
  const response = await fetch(`${API_URL}auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error en el registro");
  }

  return await response.json();
};

export const verifyEmail = async (token: string) => {
  const response = await fetch(`${API_URL}auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error verificando email");
  }

  return await response.json();
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${API_URL}auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error solicitando reset de contraseña"
    );
  }

  return await response.json();
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_URL}auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error reseteando contraseña");
  }

  return await response.json();
};
