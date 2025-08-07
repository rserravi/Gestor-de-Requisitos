import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import type { UserModel } from "../../models/user-model";
import { getTranslations, type Language } from "../../i18n";

interface SettingsPreferencesSectionProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
  language: Language;
  onLanguageChange: (lang: string) => void;
}

export function SettingsPreferencesSection({ user, onUpdate, language, onLanguageChange }: SettingsPreferencesSectionProps) {
  const [theme, setTheme] = useState(user.preferences.theme);
  const [timezone, setTimezone] = useState(user.preferences.timezone);
  const [notifications, setNotifications] = useState(user.preferences.notifications);
  const [isSaving, setIsSaving] = useState(false);
  const t = getTranslations(language);

  // Comprobar cambios para habilitar botón
  const hasChanges =
    language !== user.preferences.language ||
    theme !== user.preferences.theme ||
    timezone !== user.preferences.timezone ||
    notifications !== user.preferences.notifications;

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    await Promise.resolve(); // simula async
    onUpdate({
      ...user,
      preferences: { language, theme, timezone, notifications }
    });
    setIsSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 420 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {t.settingsPrefsTitle}
      </Typography>
      <Stack spacing={3}>
        <FormControl fullWidth size="small">
          <InputLabel id="language-label">{t.settingsPrefsLangLabel}</InputLabel>
          <Select
            labelId="language-label"
            value={language}
            label={t.settingsPrefsLangLabel}
            onChange={e => onLanguageChange(e.target.value)}
          >
            <MenuItem value="es">Español</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ca">Català</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="theme-label">{t.settingsPrefsThemeLabel}</InputLabel>
          <Select
            labelId="theme-label"
            value={theme}
            label={t.settingsPrefsThemeLabel}
            onChange={e => setTheme(e.target.value)}
          >
            <MenuItem value="light">{t.settingsPrefsThemeLight}</MenuItem>
            <MenuItem value="dark">{t.settingsPrefsThemeDark}</MenuItem>
            <MenuItem value="auto">{t.settingsPrefsThemeAuto}</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label={t.settingsPrefsTimezoneLabel}
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          size="small"
          fullWidth
        />

        <FormControlLabel
          control={
            <Switch
              checked={notifications}
              onChange={e => setNotifications(e.target.checked)}
              color="primary"
            />
          }
          label={t.settingsPrefsNotificationsLabel}
        />

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving ? t.settingsUserSaving : t.settingsPrefsSave}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
