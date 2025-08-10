import { useEffect, useState } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import App from "../App";

interface RootRouterProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function RootRouter(props: RootRouterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token")
  );

  useEffect(() => {
    const handleAuthChanged = () => {
      setToken(localStorage.getItem("access_token"));
    };

    window.addEventListener("storage", handleAuthChanged);
    window.addEventListener("auth:changed", handleAuthChanged);
    window.addEventListener("auth:expired", handleAuthChanged);
    return () => {
      window.removeEventListener("storage", handleAuthChanged);
      window.removeEventListener("auth:changed", handleAuthChanged);
      window.removeEventListener("auth:expired", handleAuthChanged);
    };
  }, []);

  useEffect(() => {
    // Si no hay token y no estamos en /login, redirige a login
    if (!token && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
    // Si hay token y estamos en /login, redirige a raíz
    if (token && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [token, location, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<App {...props} />} />
    </Routes>
  );
}
