import { useState } from "react";
import {
  Drawer, Box, Typography, IconButton, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  FolderOpen as FolderOpenIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { getTranslations, type Language } from "../i18n";
import type { ProjectModel } from "../models/project-model";
import type { UserModel } from "../models/user-model";
import { updateProject, deleteProject } from "../services/project-service";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectModel[];
  activeProject: ProjectModel | null;
  onProjectChange: (project: ProjectModel) => void;
  user?: UserModel | null;
  onLogout: () => void;
  language: Language;
  onSettings: () => void;
  onProjectCreated?: (name: string, desc: string) => Promise<void>;
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
}: SideMenuProps) {
  const t = getTranslations(language);

  // Modal de nuevo proyecto
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modal de editar proyecto
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editProjId, setEditProjId] = useState<number | null>(null);

  // Modal de borrar proyecto
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deleteProjId, setDeleteProjId] = useState<number | null>(null);

  // Handler de guardar proyecto (real)
  const handleAddProject = async () => {
    setError("");
    if (!projName.trim()) {
      setError("El nombre es obligatorio");
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
      setSaving(false);
      onClose();
    } catch (err: any) {
      setError("Error al crear el proyecto");
      setSaving(false);
    }
  };

  // Handler de editar proyecto
  const handleEditProject = async () => {
    setError("");
    if (!projName.trim() || editProjId == null) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      await updateProject(editProjId, { name: projName.trim(), description: projDesc.trim() });
      setProjName("");
      setProjDesc("");
      setEditProjectOpen(false);
      setSaving(false);
      onClose();
      // Recarga total desde App.tsx por props (o podrías hacer un callback)
      window.location.reload(); // O mejor, refrescar lista con un callback
    } catch (err: any) {
      setError("Error al editar el proyecto");
      setSaving(false);
    }
  };

  // Handler de borrar proyecto
  const handleDeleteProject = async () => {
    if (deleteProjId == null) return;
    setSaving(true);
    try {
      await deleteProject(deleteProjId);
      setDeleteProjectOpen(false);
      setSaving(false);
      onClose();
      window.location.reload(); // O mejor, refrescar lista y cambiar proyecto activo si corresponde
    } catch (err: any) {
      setError("Error al borrar el proyecto");
      setSaving(false);
    }
  };

  // Abrir modal de editar, rellenar nombre y desc
  const openEditModal = (project: ProjectModel) => {
    setEditProjId(project.id);
    setProjName(project.name);
    setProjDesc(project.description);
    setEditProjectOpen(true);
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
            <Avatar src={user.avatar || undefined} alt={user.username} sx={{ width: 40, height: 40 }} />
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
                <ListItem disablePadding key={project.id}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        aria-label="editar"
                        size="small"
                        onClick={() => openEditModal(project)}
                        title="Editar proyecto"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="borrar"
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeleteProjId(project.id);
                          setDeleteProjectOpen(true);
                        }}
                        title="Borrar proyecto"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  }
                >
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

      {/* Modal de editar proyecto */}
      <Dialog open={editProjectOpen} onClose={() => setEditProjectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Editar proyecto</DialogTitle>
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
          <Button onClick={() => setEditProjectOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleEditProject}
            variant="contained"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación de borrado */}
      <Dialog open={deleteProjectOpen} onClose={() => setDeleteProjectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar borrado</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas borrar este proyecto? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteProjectOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            disabled={saving}
          >
            {saving ? "Borrando..." : "Borrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
