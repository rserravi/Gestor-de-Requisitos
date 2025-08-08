import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
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
  const { state: smState, setState: setSmState } = useStateMachine();

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
          setActiveProject(projs.length > 0 ? projs[projs.length - 1] : null); // Selecciona el último
          setOpenNewProjectModal(projs.length === 0); // Abre modal si ninguno
        })
        .catch(() => {
          setProjects([]);
          setActiveProject(null);
        });
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
          navigate("/login");
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
                      loading={loadingChat}
                      error={errorChat}
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
  );
}
