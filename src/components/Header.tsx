import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { Menu as MenuIcon, Brightness7, Brightness4, Language as LanguageIcon } from "@mui/icons-material";
import { getTranslations, type Language } from "../i18n";

interface HeaderProps {
  activeProject: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleMenu: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function Header({
  activeProject,
  isDarkMode,
  onToggleDarkMode,
  onToggleMenu,
  language,
  onLanguageChange
}: HeaderProps) {
  const t = getTranslations(language);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* Botón menú lateral */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label={t.toggleMenu}
          onClick={onToggleMenu}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Título / Proyecto activo */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
        >
          {t.headerTitle
            ? t.headerTitle.replace("{activeProject}", activeProject)
            : activeProject}
        </Typography>

        {/* Selector de idioma */}
        <Box sx={{ minWidth: 120, mr: 2, display: "flex", alignItems: "center" }}>
          <LanguageIcon sx={{ mr: 1 }} fontSize="small" />
          <Select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            size="small"
            variant="standard"
            disableUnderline
            sx={{ fontWeight: 500, minWidth: 70 }}
            title={t.selectLanguage}
          >
            <MenuItem value="en">{t.languages.en}</MenuItem>
            <MenuItem value="es">{t.languages.es}</MenuItem>
            <MenuItem value="ca">{t.languages.ca}</MenuItem>
          </Select>
        </Box>

        {/* Switch modo claro/oscuro */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Brightness7 sx={{ mr: 1 }} />
          <Switch
            checked={isDarkMode}
            onChange={onToggleDarkMode}
            color="primary"
            inputProps={{ "aria-label": "toggle dark/light mode" }}
          />
          <Brightness4 sx={{ ml: 1 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
