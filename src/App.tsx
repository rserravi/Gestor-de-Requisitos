import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Header } from "./components/Header";
import { SideMenu } from "./components/SideMenu";
import { ChatArea } from "./components/ChatArea";
import { RequirementsTable } from "./components/RequirementsTable";
import type { ProjectModel } from "./models/project-model";
import type { UserModel } from "./models/user-model.ts";

// mocks
import { projectsMock } from "./mock/projects-mock.ts";
import { usermock } from "./mock/user-mock.ts";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { useStateMachine } from "./context/StateMachineContext";

interface AppProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function App({ isDarkMode, onToggleDarkMode }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("es");
  const [activeProject, setActiveProject] = useState(projectsMock[0]); // Asume que el primer proyecto es el activo
  const navigate = useNavigate();

  // Estados de colapso
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isReqsCollapsed, setIsReqsCollapsed] = useState(false);

  // Mocks
  const projects: ProjectModel[] = projectsMock;
  const user: UserModel = usermock;

  // === StateMachine global ===
  const { state: smState } = useStateMachine();

  // Lógica de visibilidad
  const showFiles =
    smState === "software_questions" ||
    smState === "new_requisites" ||
    smState === "analyze_requisites" ||
    smState === "stall";

  const showRequirements =
    smState !== "init" && smState !== "software_questions";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default", color: "text.primary" }}>
      {/* Header */}
      <Header
        activeProject={activeProject.name}
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
        onProjectChange={(project) => {
          setActiveProject(project);
          setIsMenuOpen(false);
        }}
        onSettings={() => {
          setIsMenuOpen(false);
          navigate("/settings");
        }}
        user={user}
        onLogout={() => setIsMenuOpen(false)}
        language={language as "en" | "es" | "ca"}
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
          <Route
            path="/"
            element={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0 }}>
                {/* ChatArea: nunca más del 70% vertical */}
                <Box sx={{ flexShrink: 0, minHeight: 0 }}>
                  <ChatArea
                    onGenerateRequirements={() => { }}
                    showFiles={showFiles}
                    collapsed={isChatCollapsed}
                    onToggleCollapse={() => setIsChatCollapsed((c) => !c)}
                    language={language as "en" | "es" | "ca"}
                    projectId={activeProject.id}
                  />
                </Box>
                {/* RequirementsTable ocupa el resto, con scroll propio */}
                {showRequirements && (
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
            }
          />
          {/* Ruta configuración */}
          <Route
            path="/settings"
            element={
              <SettingsPage
                user={user}
                onUpdate={() => {}}
                language={language as "en" | "es" | "ca"}
                onLanguageChange={setLanguage}
              />
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}
