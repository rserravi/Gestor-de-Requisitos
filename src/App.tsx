import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SideMenu } from "./components/SideMenu";
import { ChatArea } from "./components/ChatArea";
import { RequirementsTable } from "./components/RequirementsTable";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRequirements, setShowRequirements] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const [language, setLanguage] = useState("es");
  const [activeProject, setActiveProject] = useState("E-Commerce Platform");

  // NUEVO: Estados de colapso
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isReqsCollapsed, setIsReqsCollapsed] = useState(false);

  const projects = [
    "E-Commerce Platform",
    "Mobile Banking App",
    "Healthcare Portal",
    "Inventory Management"
  ];

  const user = {
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com"
  };

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGenerateRequirements = () => {
    setShowRequirements(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      // Requirements table will appear
    }, 500);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logging out...");
    setIsMenuOpen(false);
  };

  // CLASES dinámicas para cada panel
  const getPanelClass = (collapsedA: boolean, collapsedB: boolean, thisCollapsed: boolean, main = false) => {
    if (collapsedA && collapsedB) return "h-auto";
    if (thisCollapsed) return "h-auto";
    if (collapsedA || collapsedB) return "flex-1 min-h-0";
    // Ambos abiertos: aplica basis según el main (chat) o no (tabla)
    return main ? "flex-1 min-h-0 basis-[70%]" : "flex-1 min-h-0 basis-[20%]";
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header
        activeProject={activeProject}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
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
        user={user}
        onLogout={handleLogout}
        language={language as "en" | "es" | "ca"}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 gap-4 px-4">
        {/* Chat Area */}
        <div
          className={getPanelClass(isChatCollapsed, isReqsCollapsed, isChatCollapsed, true)}
        >
          <ChatArea
            onGenerateRequirements={handleGenerateRequirements}
            showFiles={showFiles}
            collapsed={isChatCollapsed}
            onToggleCollapse={() => setIsChatCollapsed((c) => !c)}
            language={language as "en" | "es" | "ca"}
          />
        </div>

        {/* Requirements Table */}
        {showRequirements && (
          <div
            className={getPanelClass(isReqsCollapsed, isChatCollapsed, isReqsCollapsed, false)}
          >
            <RequirementsTable
              collapsed={isReqsCollapsed}
              onToggleCollapse={() => setIsReqsCollapsed((c) => !c)}
              language={language as "en" | "es" | "ca"}
            />
          </div>
        )}
      </main>
    </div>
  );
}
