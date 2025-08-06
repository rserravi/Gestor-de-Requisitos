import { Settings, LogOut, User, FolderOpen, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getTranslations, type Language } from "../i18n";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  projects: string[];
  activeProject: string;
  onProjectChange: (project: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  language: Language;
}

export function SideMenu({ 
  isOpen, 
  onClose, 
  projects, 
  activeProject, 
  onProjectChange,
  user,
  onLogout,
  language
}: SideMenuProps) {
  const t = getTranslations(language);
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>{t.sideMenuTitle}</SheetTitle>
          <SheetDescription>
            {t.sideMenuDescription}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col h-full py-6">
          {/* User Section */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-4">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Projects Section */}
          <div className="flex-1 py-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="font-medium">{t.projects}</h3>
              <Button variant="ghost" size="icon" title={t.addProject}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {projects.map((project) => (
                <Button
                  key={project}
                  variant={project === activeProject ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onProjectChange(project)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {project}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Settings and Actions */}
          <div className="space-y-2 pt-4">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              {t.settings}
            </Button>
            
            {user && (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}