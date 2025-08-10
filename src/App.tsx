import { useState, useEffect, useRef } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Header } from "./components/Header";
import { SideMenu } from "./components/SideMenu";
import { ChatArea } from "./components/ChatArea";
import { RequirementsTable } from "./components/RequirementsTable";
import { getTranslations, type Language } from "./i18n";
import type { ProjectModel } from "./models/project-model";
import type { UserModel } from "./models/user-model";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { useStateMachine } from "./context/StateMachineContext";
import { getMe, logout } from "./services/auth-service";
import { listProjects, createProject } from "./services/project-service";
import { fetchProjectMessages, sendMessage, type ChatMessageCreatePayload } from "./services/chat-service";
import type { MessageModel } from "./models/message-model";
import { CircularProgress, Typography, Backdrop } from "@mui/material";
import { addStateMachineEntry } from "./services/state-machine-service";
import { generateRequirement } from "./services/requirements-service";

interface AppProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function App({ isDarkMode, onToggleDarkMode }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("es");
  const t = getTranslations(language);

  const [user, setUser] = useState<UserModel | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectModel | null>(null);
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);

  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isReqsCollapsed, setIsReqsCollapsed] = useState(false);
  const [requirementsReloadTrigger, setRequirementsReloadTrigger] = useState(0);

  const themePrefRef = useRef<string | null>(null);

  const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [errorChat, setErrorChat] = useState<string | null>(null);

  const navigate = useNavigate();
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
      } catch (err: unknown) {
        const status = (
          err as { response?: { status?: number } }
        )?.response?.status;
        if (status === 401 || status === 403) {
          logout(); // asegúrate de limpiar token
          setUser(null);
          navigate("/login", { replace: true });
        } else {
          console.error(err);
          alert("Error loading user");
        }
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

  // Ajusta idioma y tema según preferencias del usuario al iniciar sesión
  useEffect(() => {
    if (!user?.preferences) return;

    // Ajustar idioma
    setLanguage(user.preferences.language);

    // Solo aplicar tema si la preferencia cambió y aún no se aplicó
    if (user.preferences.theme !== themePrefRef.current) {
      let shouldBeDark = isDarkMode;
      const prefTheme = user.preferences.theme;
      if (prefTheme === "dark") shouldBeDark = true;
      else if (prefTheme === "light") shouldBeDark = false;
      else if (prefTheme === "auto") {
        shouldBeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      if (shouldBeDark !== isDarkMode) {
        onToggleDarkMode();
      }

      themePrefRef.current = user.preferences.theme;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    } catch {
      // Si fue 401, el interceptor ya navegó; aquí solo limpiamos estado local
      setChatMessages([]);
      setErrorChat(t.errorLoadMessages);
    } finally {
      setLoadingChat(false);
    }
  };

  // Enviar mensaje y recargar/sincronizar
  const handleSendMessage = async (
    msg: ChatMessageCreatePayload,
    projectId: number
  ) => {
    setLoadingChat(true);
    setErrorChat(null);
    try {
      if (msg.project_id !== projectId) {
        msg.project_id = projectId;
      }
      await sendMessage(msg);
      await reloadMessages();
    } catch {
      setErrorChat(t.errorSendMessage);

    } finally {
      setLoadingChat(false);
    }
  };


  // Handler para Analizar con IA
  const handleAnalyzeWithAI = async () => {
    if (!activeProject?.id) return;
    setLoadingChat(true);
    setErrorChat(null);
    try {
      // Deriva a código corto (es, en, ca, ...)
      const langShort = (language || "es").split("-")[0];

      await addStateMachineEntry(activeProject.id, "analyze_requisites", {
        language: langShort,
      });

      // Opcional: reflejar de inmediato
      setSmState("analyze_requisites");

      // Recarga mensajes (sincroniza state también)
      await reloadMessages();
    } catch {
      setErrorChat(t.errorAnalyzeAI);
    } finally {
      setLoadingChat(false);
    }
  };

  // Handler para generar requisito con IA
  const handleGenerateRequirement = async (
    category: string,
    examples?: string[]
  ) => {
    if (!activeProject?.id) return;
    setLoadingChat(true);
    setErrorChat(null);
    try {
      await generateRequirement(
        activeProject.id,
        category,
        language,
        examples && examples.length > 0 ? examples : undefined
      );
      await reloadMessages();
      // Trigger reload of requirements table to include the new requirement
      setRequirementsReloadTrigger((v) => v + 1);
    } catch {
      setErrorChat(t.errorCreateRequirement);
    } finally {
      setLoadingChat(false);
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
        language={language}
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
                      {t.processingResponse}
                    </Typography>
                    <Typography variant="body2" color="inherit" sx={{ mt: 1 }}>
                      {t.processingWait}
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
                      onAddRequirement={handleGenerateRequirement}
                      showFiles={showFiles}
                      collapsed={isChatCollapsed}
                      onToggleCollapse={() => setIsChatCollapsed((c) => !c)}
                      language={language}
                      projectId={activeProject?.id || 0}
                      onError={setErrorChat}
                    />
                  </Box>

                  {/* RequirementsTable */}
                  {showRequirements && activeProject && (
                    <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                      <RequirementsTable
                        collapsed={isReqsCollapsed}
                        onToggleCollapse={() => setIsReqsCollapsed((c) => !c)}
                        language={language}
                        ownerId={user.id}
                        projectId={activeProject.id}
                        reloadTrigger={requirementsReloadTrigger}
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
                  language={language}
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
