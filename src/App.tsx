import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./components/MainPage/MainPage";
import Login from "./pages/login/Login";
import Registro from "./pages/registro/Registro";
import ContrasenaOlvidada from "./pages/recordarContrasena/ContrasenaOlvidada";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/Utils/ProtectedRoute";
import Game from "./components/Game/Game";
import { PartidaProvider } from "./context/PartidaContext";
import CambiarContrasena from "./pages/recordarContrasena/CambiarContrasena";
import Lecciones from "./pages/lecciones/Lecciones";
import Ejercicio from "./pages/ejercicios/Ejercicio";
import EstadoPagina from "./components/Utils/EstadoPagina";
import Perfil from "./pages/perfil/Perfil";

function App() {
  return (
    <BrowserRouter>
      <PartidaProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<MainPage />}></Route>
              <Route
                path="/login"
                element={
                  <ProtectedRoute logged={false}>
                    <Login />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/verify/:id/:token"
                element={
                  <ProtectedRoute logged={false}>
                    <Login />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/cambiar-contrasena/:id/:token"
                element={
                  <ProtectedRoute logged={false}>
                    <CambiarContrasena />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/registro"
                element={
                  <ProtectedRoute logged={false}>
                    <Registro />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/cambiar-contrasena"
                element={
                  <ProtectedRoute logged={false}>
                    <ContrasenaOlvidada />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/jugar"
                element={
                  <ProtectedRoute logged={true}>
                    <Game />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/lecciones"
                element={
                  <ProtectedRoute logged={true}>
                    <Lecciones />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/ejercicio"
                element={
                  <ProtectedRoute logged={true}>
                    <Ejercicio />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute logged={true}>
                    <Perfil />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="*"
                element={
                  <ProtectedRoute logged={true}>
                    <EstadoPagina tipo="notFound" />
                  </ProtectedRoute>
                }
              ></Route>
            </Route>
          </Routes>
        </AuthProvider>
      </PartidaProvider>
    </BrowserRouter>
  );
}

export default App;
