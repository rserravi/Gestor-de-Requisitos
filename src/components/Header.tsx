import { Menu, Sun, Moon, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getTranslations, type Language } from "../i18n";

interface HeaderProps {
  activeProject: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleMenu: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export function Header({
  activeProject,
  isDarkMode,
  onToggleDarkMode,
  onToggleMenu,
  language,
  onLanguageChange
}: HeaderProps) {
  const t = getTranslations(language as Language);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggleMenu} title={t.toggleMenu}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">{t.headerTitle.replace('{activeProject}', activeProject)}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-32" title={t.selectLanguage}>
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="ca">Català</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2" title="Toggle dark/light theme">
          <Sun className="h-4 w-4" />
          <Switch
            checked={isDarkMode}
            onCheckedChange={onToggleDarkMode}
          />
          <Moon className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}