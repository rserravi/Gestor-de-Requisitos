import { useState } from "react";
import { SettingsUserSection } from "../components/settings/SettingsUserSection";
import { SettingsPreferencesSection } from "../components/settings/SettingsPreferencesSection";
import { SettingsExampleFilesSection } from "../components/settings/SettingsExampleFilesSection";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { UserModel } from "../models/user-model";
import { getTranslations, type Language } from "../i18n";

interface SettingsPageProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function SettingsPage({ user, onUpdate, language, onLanguageChange }: SettingsPageProps) {
  const [section, setSection] = useState("user");
  const navigate = useNavigate();
  const t = getTranslations(language);

  const SECTIONS = [
    { id: "user", label: t.settingsSectionUser },
    { id: "preferences", label: t.settingsSectionPreferences },
    { id: "exampleFiles", label: t.settingsSectionExampleFiles },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        minHeight: "60vh",
      }}
    >
      {/* Sidebar permanente */}
      <Paper
        elevation={2}
        sx={{
          width: 240,
          minWidth: 200,
          maxWidth: 280,
          height: "100vh",
          borderRadius: 0,
          p: 3,
          pt: 4,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIosNewIcon />}
          onClick={() => navigate("/")}
          sx={{
            mb: 3,
            alignSelf: "flex-start",
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          {t.settingsBack}
        </Button>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t.settingsTitle}
        </Typography>
        <List component="nav" sx={{ gap: 0.5, p: 0 }}>
          {SECTIONS.map((s) => (
            <ListItem key={s.id} disablePadding>
              <ListItemButton
                selected={section === s.id}
                onClick={() => setSection(s.id)}
                sx={{
                  borderRadius: 1,
                  fontWeight: section === s.id ? "bold" : "medium",
                  bgcolor: section === s.id ? "action.selected" : "transparent",
                  color: "inherit",
                  mb: 0.5,
                }}
              >
                <ListItemText primary={s.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Área de contenido */}
      <Box flex={1} minWidth={0} px={{ xs: 2, sm: 5 }} py={4}>
        {section === "user" && (
          <SettingsUserSection user={user} onUpdate={onUpdate} language={language} />
        )}
        {section === "preferences" && (
          <SettingsPreferencesSection
            user={user}
            onUpdate={onUpdate}
            language={language}
            onLanguageChange={onLanguageChange}
          />
        )}
        {section === "exampleFiles" && (
          <SettingsExampleFilesSection
            user={user}
            onUpdate={onUpdate}
            language={language}
          />
        )}
      </Box>
    </Box>
  );
}
