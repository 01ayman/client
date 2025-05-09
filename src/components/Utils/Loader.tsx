// components/Utils/Loader.tsx
import React from "react";
import "./Loader.css"; // Estilos para el loader

interface LoaderProps {
  size?: "small" | "medium" | "large";
}

export const Loader: React.FC<LoaderProps> = ({ size = "medium" }) => {
  return (
    <div className={`loader ${size}`}>
      <div className="loader-spinner"></div>
    </div>
  );
};
