import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography, Stack, Link
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getTranslations, type Language } from "../i18n";
import { login, register } from "../services/auth-service";

// Detecta el idioma del navegador y lo mapea a los soportados
function getBrowserLanguage(): Language {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('ca')) return 'ca';
  return 'en'; // fallback por defecto
}

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [language] = useState<Language>(getBrowserLanguage());
  const t = getTranslations(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        if (!username) { setError(t.errorUsernameRequired); return; }
        if (!email || !password) { setError(t.errorEmailPasswordRequired); return; }
        await register({ username, email, password });
        setMode("login");
        setError(""); // Registro OK, cambia a login
      } else {
        if (!username || !password) { setError(t.errorUserPasswordRequired); return; }
        await login({ username, password });
        setError("");
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
    >
      <Paper elevation={4} sx={{ p: 5, minWidth: 340, maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {mode === "login" ? t.loginTitle : t.registerTitle}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {mode === "register" ? (
              <>
                <TextField
                  label={t.usernameLabelRegister}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label={t.emailLabel}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label={t.passwordLabel}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  fullWidth
                />
              </>
            ) : (
              <>
                <TextField
                  label={t.usernameLabelLogin}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
                <TextField
                  label={t.passwordLabel}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  fullWidth
                />
              </>
            )}
            {error && (
              <Typography color="error" variant="body2">{error}</Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              {mode === "login" ? t.loginButton : t.registerButton}
            </Button>
          </Stack>
        </form>
        <Box mt={3} textAlign="center">
          <Typography variant="body2">
            {mode === "login" ? (
              <>
                {t.noAccountPrompt}{" "}
                <Link component="button" onClick={() => setMode("register")}>
                  {t.registerLink}
                </Link>
              </>
            ) : (
              <>
                {t.hasAccountPrompt}{" "}
                <Link component="button" onClick={() => setMode("login")}>
                  {t.loginLink}
                </Link>
              </>
            )}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
