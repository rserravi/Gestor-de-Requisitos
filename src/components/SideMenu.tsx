import { useState } from "react";
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
  activeProject: string;
  onProjectChange: (project: ProjectModel) => void;
  user?: UserModel
  onLogout: () => void;
  language: Language;
  onSettings: () => void;
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
}: SideMenuProps) {
  const t = getTranslations(language);

  // Modal de nuevo proyecto
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Mock handler de guardar proyecto
  const handleAddProject = async () => {
    setError("");
    if (!projName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    // Mock de llamada a backend: genera ID y owner_id
    const newProject: ProjectModel = {
      id: 2,
      name: projName.trim(),
      description: projDesc.trim(),
      owner_id: user?.id || 1 // mock si no hay user
      // ...otros campos si tu modelo tiene más
    };
    // Aquí llamarías al backend real y obtendrías el nuevo proyecto
    await new Promise(res => setTimeout(res, 400)); // Simula retardo
    setProjName("");
    setProjDesc("");
    setSaving(false);
    setNewProjectOpen(false);
    onClose(); // Cierra SideMenu
    // Selecciona el nuevo proyecto
    onProjectChange(newProject);
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
                    selected={project.name === activeProject}
                    onClick={() => {
                      onProjectChange(project);
                      onClose();
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <FolderOpenIcon color={project.name === activeProject ? "primary" : "disabled"} fontSize="small" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={project.name}
                      primaryTypographyProps={{
                        fontWeight: project.name === activeProject ? "bold" : "medium",
                        color: project.name === activeProject ? "primary.main" : undefined,
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
      <Dialog open={newProjectOpen} onClose={() => setNewProjectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Añadir nuevo proyecto</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre del proyecto"
              value={projName}
              onChange={e => setProjName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Descripción"
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
          <Button onClick={() => setNewProjectOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddProject}
            variant="contained"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Crear proyecto"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
