import { useState, useEffect } from "react";
import {
  Drawer, Box, Typography, IconButton, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  FolderOpen as FolderOpenIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { getTranslations, type Language } from "../i18n";
import type { ProjectModel } from "../models/project-model";
import type { UserModel } from "../models/user-model";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectModel[];
  activeProject: ProjectModel | null;
  onProjectChange: (project: ProjectModel) => void;
  user?: UserModel;
  onLogout: () => void;
  language: Language;
  onSettings: () => void;
  onProjectCreated?: (name: string, desc: string) => Promise<void>;
  openNewProjectModal: boolean;
  setOpenNewProjectModal: (open: boolean) => void;
}

export function SideMenu({
  isOpen,
  onClose,
  projects,
  activeProject,
  onProjectChange,
  user,
  onLogout,
  language,
  onSettings,
  onProjectCreated,
  openNewProjectModal,
  setOpenNewProjectModal,
}: SideMenuProps) {
  const t = getTranslations(language);

  // Modal de nuevo proyecto
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Abre modal si lo indica la prop global
  useEffect(() => {
    if (openNewProjectModal) setNewProjectOpen(true);
  }, [openNewProjectModal]);

  // Handler de guardar proyecto
  const handleAddProject = async () => {
    setError("");
    if (!projName.trim()) {
      setError(t.errorProjectNameRequired);
      return;
    }
    setSaving(true);
    try {
      if (onProjectCreated) {
        await onProjectCreated(projName.trim(), projDesc.trim());
      }
      setProjName("");
      setProjDesc("");
      setNewProjectOpen(false);
      setOpenNewProjectModal(false);
      onClose(); // Cierra SideMenu
    } catch (err: any) {
      setError(t.errorCreateProject);
    } finally {
      setSaving(false);
    }
  };

  // Cuando el usuario cancela
  const handleCancelNewProject = () => {
    setNewProjectOpen(false);
    setOpenNewProjectModal(false);
  };

  return (
    <>
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 320,
            bgcolor: "background.paper",
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            zIndex: (theme) => theme.zIndex.drawer + 2
          }
        }}
        ModalProps={{
          keepMounted: true,
          sx: { zIndex: (theme) => theme.zIndex.drawer + 2 }
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 0 }}>
          <Typography variant="h6" fontWeight="bold">
            {t.sideMenuTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t.sideMenuDescription}
          </Typography>
        </Box>
        {/* User Section */}
        {user && (
          <Box display="flex" alignItems="center" gap={2} px={3} py={3}>
            <Avatar src={user.avatar} alt={user.username} sx={{ width: 40, height: 40 }} />
            <Box flex={1}>
              <Typography fontWeight="medium">{user.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Divider />

        {/* Projects Section */}
        <Box sx={{ flex: 1, minHeight: 0, py: 2, display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" px={3} mb={2}>
            <Typography variant="subtitle1" fontWeight="medium">{t.projects}</Typography>
            <IconButton
              color="primary"
              size="small"
              title={t.addProject}
              onClick={() => setNewProjectOpen(true)}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1 }}>
            <List dense>
              {projects.map((project) => (
                <ListItem disablePadding key={project.id}>
                  <ListItemButton
                    selected={project.id === activeProject?.id}
                    onClick={() => {
                      onProjectChange(project);
                      onClose();
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <FolderOpenIcon color={project.id === activeProject?.id ? "primary" : "disabled"} fontSize="small" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={project.name}
                      primaryTypographyProps={{
                        fontWeight: project.id === activeProject?.id ? "bold" : "medium",
                        color: project.id === activeProject?.id ? "primary.main" : undefined,
                        fontSize: 15
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
        <Divider />

        {/* Settings and Actions */}
        <Stack spacing={1} direction="column" sx={{ p: 3, pb: 3 }}>
          <Button
            startIcon={<SettingsIcon />}
            variant="text"
            color="inherit"
            onClick={() => {
              onClose();
              onSettings();
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none" }}
          >
            {t.settings}
          </Button>
          {user && (
            <Button
              startIcon={<LogoutIcon />}
              variant="text"
              color="error"
              onClick={onLogout}
              sx={{ justifyContent: "flex-start", textTransform: "none" }}
            >
              {t.logout}
            </Button>
          )}
        </Stack>
      </Drawer>

      {/* Modal de añadir nuevo proyecto */}
      <Dialog
        open={newProjectOpen}
        onClose={handleCancelNewProject}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t.newProjectTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label={t.newProjectNameLabel}
              value={projName}
              onChange={e => setProjName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label={t.newProjectDescriptionLabel}
              value={projDesc}
              onChange={e => setProjDesc(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelNewProject} disabled={saving}>
            {t.newProjectCancel}
          </Button>
          <Button
            onClick={handleAddProject}
            variant="contained"
            disabled={saving}
          >
            {saving ? t.newProjectSaving : t.newProjectCreate}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
