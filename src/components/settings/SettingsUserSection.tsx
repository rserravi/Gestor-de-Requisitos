import type { UserModel } from "../../models/user-model";
import { useState, useRef } from "react";
import {
  Box,
  Avatar,
  Button,
  TextField,
  Stack,
  Typography
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SaveIcon from "@mui/icons-material/Save";
import { getTranslations, type Language } from "../../i18n";

interface SettingsUserSectionProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
  language: Language;
}

export function SettingsUserSection({ user, onUpdate, language }: SettingsUserSectionProps) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslations(language);

  // Mock de upload (solo preview, real lo hace backend)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Detectar si hay cambios
  const hasChanges =
    username !== user.username ||
    email !== user.email ||
    avatar !== user.avatar;

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    // Puedes hacer aquí un fetch/axios PUT real al backend si quieres
    // Por ahora solo mock:
    const updatedUser: UserModel = {
      ...user,
      username,
      email,
      avatar
    };
    await Promise.resolve(); // Mock async
    onUpdate(updatedUser);
    setIsSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 460 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t.settingsUserTitle}
      </Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        <Avatar src={avatar} sx={{ width: 80, height: 80, fontSize: 38 }}>
          {username ? username[0].toUpperCase() : "?"}
        </Avatar>
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarUpload}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t.settingsUserUpload}
          </Button>
        </Box>
      </Stack>
      <Stack spacing={3} mt={4}>
        <TextField
          label={t.settingsUserName}
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label={t.settingsUserEmail}
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
        />
      </Stack>
      <Stack direction="row" justifyContent="flex-end" mt={4}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? t.settingsUserSaving : t.settingsUserSave}
        </Button>
      </Stack>
    </Box>
  );
}
