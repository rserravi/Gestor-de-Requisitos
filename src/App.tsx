import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
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
import { getTranslations } from "./i18n";

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

  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isReqsCollapsed, setIsReqsCollapsed] = useState(false);

  const [chatMessages, setChatMessages] = useState<MessageModel[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [iaIsLoading, setIaIsLoading] = useState(false);

  const navigate = useNavigate();
  const { state: smState } = useStateMachine();
  const t = getTranslations(language as "en" | "es" | "ca");

  // Lógica de visibilidad
  const showFiles =
    smState === "software_questions" ||
    smState === "new_requisites" ||
    smState === "analyze_requisites" ||
    smState === "stall";

  const showRequirements =
    smState !== "init" && smState !== "software_questions";

  // Recupera usuario al cargar App
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const userData = await getMe();
        setUser(userData);
        setLoadingUser(false);
      } catch {
        setUser(null);
        setLoadingUser(false);
        navigate("/login");
      }
    };
    if (localStorage.getItem("access_token")) fetchUser();
    else {
      setLoadingUser(false);
      navigate("/login");
    }
    // eslint-disable-next-line
  }, []);

  // Recupera proyectos cuando hay usuario
  useEffect(() => {
    if (user) {
      listProjects()
        .then(projs => {
          setProjects(projs);
          setActiveProject(projs[0] || null);
        })
        .catch(() => {
          setProjects([]);
          setActiveProject(null);
        });
    }
  }, [user]);

  // Recupera mensajes cuando cambia el proyecto
  useEffect(() => {
    if (activeProject?.id) {
      setChatLoading(true);
      fetchProjectMessages(activeProject.id)
        .then(setChatMessages)
        .catch(() => setChatError("No se pudieron cargar los mensajes"))
        .finally(() => setChatLoading(false));
    } else {
      setChatMessages([]);
    }
  }, [activeProject]);

  // Handler para crear nuevo proyecto desde SideMenu
  const handleProjectCreated = async (name: string, description: string) => {
    const newProj = await createProject({ name, description });
    const projs = await listProjects();
    setProjects(projs);
    setActiveProject(newProj);
  };

  // Handler para enviar mensaje de usuario
  const handleSendMessage = async (userMessage: Omit<MessageModel, "id" | "timestamp">, projectId: number) => {
    try {
      setIaIsLoading(true);
      await sendMessage({ ...userMessage, project_id: projectId }); // Post
      // Tras el post, vuelve a pedir el array actualizado
      const messages = await fetchProjectMessages(projectId);
      setChatMessages(messages);
    } catch (err: any) {
      setChatError(err.message || "Error enviando mensaje");
    } finally {
      setIaIsLoading(false);
    }
  };

  if (loadingUser) return <Box>Loading...</Box>;

  return (
    <>
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
          user={user}
          onLogout={() => {
            logout();
            setUser(null);
            setProjects([]);
            setActiveProject(null);
            setIsMenuOpen(false);
            navigate("/login");
          }}
          language={language as "en" | "es" | "ca"}
          onSettings={() => {
            setIsMenuOpen(false);
            navigate("/settings");
          }}
          onProjectCreated={handleProjectCreated}
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
              element={
                user
                  ? <Navigate to="/" replace />
                  : <LoginPage />
              }
            />
            {/* Ruta principal, protegida */}
            <Route
              path="/"
              element={
                user ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0 }}>
                    {/* ChatArea */}
                    <Box sx={{ flexShrink: 0, minHeight: 0 }}>
                      <ChatArea
                        chatMessages={chatMessages}
                        loading={chatLoading}
                        error={chatError}
                        onSendMessage={handleSendMessage}
                        onGenerateRequirements={() => { }}
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
            {/* Fallback: redirige a login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </Box>

      {/* Backdrop bloqueante mientras responde la IA */}
      <Backdrop
        open={iaIsLoading}
        sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 999 }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2, textAlign: "center" }}>
            {t.iaWaitingMessage ||
              "Su respuesta está siendo procesada por la IA. Podría tardar un minuto."}
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
}
