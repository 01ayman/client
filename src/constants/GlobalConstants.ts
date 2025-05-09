const isProduction = import.meta.env?.VITE_ENVIRONMENT === "production";
const API_URL = isProduction
  ? "https://server-production-2fed.up.railway.app/api/"
  : "http://localhost:3001/api/";

export { isProduction, API_URL };
