import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, Navigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import { Header } from "./components/Header";
import { SideMenu } from "./components/SideMenu";
import { ChatArea } from "./components/ChatArea";
import { RequirementsTable } from "./components/RequirementsTable";
import type { ProjectModel } from "./models/project-model";
import type { UserModel } from "./models/user-model";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { useStateMachine } from "./context/StateMachineContext";
import { getMe, logout } from "./services/auth-service";
import { listProjects, createProject } from "./services/project-service";
import { fetchProjectMessages, sendMessage } from "./services/chat-service";
import type { MessageModel } from "./models/message-model";
import { Dialog, DialogContent, CircularProgress, Typography, Backdrop } from "@mui/material";
import { addStateMachineEntry } from "./services/state-machine-service";

interface AppProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function App({ isDarkMode, onToggleDarkMode }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("es");
  const [user, setUser] = useState<UserModel | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectModel | null>(null);
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);

  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isReqsCollapsed, setIsReqsCollapsed] = useState(false);

  const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [errorChat, setErrorChat] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { state: smState, setState: setSmState } = useStateMachine();

  // Lógica de visibilidad
  const showFiles =
    smState === "software_questions" ||
    smState === "new_requisites" ||
    smState === "analyze_requisites" ||
    smState === "stall";

  const showRequirements = smState !== "init" && smState !== "software_questions";

  // Redirección automática si el token expira (evento disparado por interceptor global)
  useEffect(() => {
    const onExpired = () => {
      logout();
      setUser(null);
      setProjects([]);
      setActiveProject(null);
      setLoadingChat(false); // por si el modal estaba abierto
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [navigate]);

  // Recupera usuario al cargar App
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        logout(); // asegúrate de limpiar token
        setUser(null);
        navigate("/login", { replace: true });
      } finally {
        setLoadingUser(false);
      }
    };

    if (localStorage.getItem("access_token")) {
      fetchUser();
    } else {
      setLoadingUser(false);
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  // Recupera proyectos cuando hay usuario
  useEffect(() => {
    if (user) {
      listProjects()
        .then(projs => {
          setProjects(projs);
          setActiveProject(projs.length > 0 ? projs[projs.length - 1] : null); // último
          setOpenNewProjectModal(projs.length === 0); // abre modal si ninguno
        })
        .catch(() => {
          setProjects([]);
          setActiveProject(null);
        });
    } else {
      setProjects([]);
      setActiveProject(null);
    }
  }, [user]);

  // Carga mensajes cuando cambia el proyecto activo
  useEffect(() => {
    if (activeProject?.id) {
      reloadMessages();
    } else {
      setChatMessages([]);
    }
    // eslint-disable-next-line
  }, [activeProject?.id]);

  // Cargar mensajes de chat y sincronizar estado global
  const reloadMessages = async () => {
    setLoadingChat(true);
    setErrorChat(null);
    try {
      const messages = await fetchProjectMessages(
        activeProject!.id,
        setSmState // sincroniza state machine con último mensaje
      );
      setChatMessages(messages);
    } catch (e: any) {
      // Si fue 401, el interceptor ya navegó; aquí solo limpiamos estado local
      setChatMessages([]);
      setErrorChat("No se pudieron cargar los mensajes.");
    } finally {
      setLoadingChat(false);
    }
  };

  // Enviar mensaje y recargar/sincronizar
  const handleSendMessage = async (
    msg: Omit<MessageModel, "id" | "timestamp">,
    projectId: number
  ) => {
    setLoadingChat(true);
    setErrorChat(null);
    try {
      await sendMessage(msg);
      await reloadMessages(); // Esto también sincroniza el estado global
    } catch (e: any) {
      setErrorChat("No se pudo enviar el mensaje.");
    } finally {
      setLoadingChat(false);
    }
  };

  // Handler para Analizar con IA
  const handleAnalyzeWithAI = async () => {
    if (!activeProject?.id) return;
    setLoadingChat(true);            // <- muestra el Backdrop
    setErrorChat(null);
    try {
      // Cambia el estado en backend
      await addStateMachineEntry(activeProject.id, "analyze_requisites");
      // Opcional: reflejar inmediato en UI (el fetch también lo sincroniza)
      setSmState("analyze_requisites");
      // Recarga mensajes (esto también re-sincroniza el estado por el callback)
      await reloadMessages();
    } catch (e) {
      setErrorChat("No se pudo analizar con IA.");
    } finally {
      setLoadingChat(false);         // <- cierra el Backdrop
    }
  };

  // Handler para crear nuevo proyecto desde SideMenu
  const handleProjectCreated = async (name: string, description: string) => {
    await createProject({ name, description });
    const projs = await listProjects();
    setProjects(projs);
    setActiveProject(projs.length > 0 ? projs[projs.length - 1] : null);
    setOpenNewProjectModal(false);
  };

  if (loadingUser) return <Box>Loading...</Box>;

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", color: "text.primary" }}>
      {/* Header */}
      <Header
        activeProject={activeProject?.name || ""}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onToggleMenu={() => setIsMenuOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        projects={projects}
        activeProject={activeProject}
        onProjectChange={(project) => setActiveProject(project)}
        user={user ?? undefined}
        onLogout={() => {
          logout();
          setUser(null);
          setProjects([]);
          setActiveProject(null);
          setIsMenuOpen(false);
          navigate("/login", { replace: true });
        }}
        language={language as "en" | "es" | "ca"}
        onSettings={() => {
          setIsMenuOpen(false);
          navigate("/settings");
        }}
        onProjectCreated={handleProjectCreated}
        openNewProjectModal={openNewProjectModal}
        setOpenNewProjectModal={setOpenNewProjectModal}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          px: { xs: 1, sm: 3 },
          pt: { xs: 7, sm: 8 },
          pb: 2,
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        <Routes>
          {/* Login siempre accesible */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage />}
          />

          {/* Ruta principal, protegida */}
          <Route
            path="/"
            element={
              user ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0 }}>
                  {/* MODAL bloqueante SOLO dentro de zona protegida */}
                  <Backdrop
                    sx={{
                      color: "#fff",
                      zIndex: (theme) => theme.zIndex.drawer + 1,
                      flexDirection: "column",
                      textAlign: "center",
                    }}
                    open={loadingChat}
                  >
                    <CircularProgress color="inherit" sx={{ mb: 2 }} />
                    <Typography variant="h6">
                      Su respuesta está siendo procesada por la IA.
                    </Typography>
                    <Typography variant="body2" color="inherit" sx={{ mt: 1 }}>
                      Podría tardar hasta un minuto. Por favor, espere...
                    </Typography>
                  </Backdrop>

                  {/* ChatArea */}
                  <Box sx={{ flexShrink: 0, minHeight: 0 }}>
                    <ChatArea
                      chatMessages={chatMessages}
                      loading={loadingChat}
                      error={errorChat}
                      onSendMessage={handleSendMessage}
                      onGenerateRequirements={handleAnalyzeWithAI}
                      showFiles={showFiles}
                      collapsed={isChatCollapsed}
                      onToggleCollapse={() => setIsChatCollapsed((c) => !c)}
                      language={language as "en" | "es" | "ca"}
                      projectId={activeProject?.id || 0}
                    />
                  </Box>

                  {/* RequirementsTable */}
                  {showRequirements && activeProject && (
                    <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                      <RequirementsTable
                        collapsed={isReqsCollapsed}
                        onToggleCollapse={() => setIsReqsCollapsed((c) => !c)}
                        language={language as "en" | "es" | "ca"}
                        ownerId={user.id}
                        projectId={activeProject.id}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Ruta configuración, protegida */}
          <Route
            path="/settings"
            element={
              user ? (
                <SettingsPage
                  user={user}
                  onUpdate={() => { }}
                  language={language as "en" | "es" | "ca"}
                  onLanguageChange={setLanguage}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
