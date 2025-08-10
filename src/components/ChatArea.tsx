import { useState, useRef, useEffect } from "react";
import {
  Paper, Box, Stack, Typography, IconButton, Button, Collapse, TextField, Alert, MenuItem, Menu
} from "@mui/material";
import {
  Send as SendIcon,
  UploadFile as UploadIcon,
  AutoAwesome as SparklesIcon,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ReactMarkdown from "react-markdown";
import { getTranslations, type Language } from "../i18n";
import type { MessageModel } from "../models/message-model";
import { useStateMachine } from "../context/StateMachineContext";
import type { ChatMessageCreatePayload } from "../services/chat-service";

interface ChatAreaProps {
  chatMessages: MessageModel[];
  loading: boolean; // lo usa App para Backdrop; aquí solo deshabilitamos inputs
  error: string | null;
  onSendMessage: (msg: ChatMessageCreatePayload, projectId: number) => Promise<void>;
  onGenerateRequirements: () => void;
  showFiles: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  language: Language;
  projectId: number;
}

export function ChatArea({
  chatMessages,
  loading,
  error,
  onSendMessage,
  onGenerateRequirements,
  showFiles,
  collapsed,
  onToggleCollapse,
  language,
  projectId
}: ChatAreaProps) {
  const t = getTranslations(language);
  const [inputValue, setInputValue] = useState("");
  const { state: smState } = useStateMachine();

  // scroll solo del área de mensajes
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  // Mock combo archivos configuración
  const uploadedConfigFilesMock = [
    { id: 1, name: "requisitos_api.docx" },
    { id: 2, name: "ejemplo_requisitos.md" }
  ];
  const [selectedConfigFile, setSelectedConfigFile] = useState<number | "">("");
  const [exampleRequirementsText, setExampleRequirementsText] = useState<string>("");

  // === Helpers ===
  const shouldAttachExamples =
    smState === "new_requisites" || smState === "analyze_requisites";

  const parseExamples = (raw: string): string[] => {
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .map((l) => l.replace(/^[-*]\s+/, ""))          // bullets
      .map((l) => l.replace(/^\d+[.)]\s+/, ""))       // n.) o n)
      .filter((l) => l.length > 0);
  };

  // === Envío de mensaje ===
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const payload: ChatMessageCreatePayload = {
      content: inputValue,
      sender: "user",
      project_id: projectId,
      state: smState,
      // language lo añade el service si no se pasa
    };

    if (shouldAttachExamples) {
      const examples = parseExamples(exampleRequirementsText);
      if (examples.length > 0) {
        payload.example_samples = examples;
      }
    }

    await onSendMessage(payload, projectId);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // === Botón con menú para No Funcionales (mismo look & feel que el otro botón) ===
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Paper elevation={3} sx={{
      borderRadius: 2, mb: 1, p: 0,
      display: "flex", flexDirection: "column",
      height: collapsed ? "auto" : "100%"
    }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1.5} sx={{
        bgcolor: "background.paper",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottom: 1,
        borderColor: "divider"
      }}>
        <Typography variant="subtitle1" fontWeight="bold" display="flex" alignItems="center" gap={1.5}>
          <SparklesIcon fontSize="small" />
          {t.chatTitle}
        </Typography>
        <IconButton
          onClick={onToggleCollapse}
          title={collapsed ? t.expand : t.collapse}
          aria-label={collapsed ? t.expand : t.collapse}
          size="small"
          sx={{ ml: 1 }}
        >
          {collapsed ? <ExpandMore /> : <ExpandLess />}
        </IconButton>
      </Box>

      {/* Contenido */}
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        <Box display="flex" flexDirection="row" gap={3} px={3} py={3} flex={1} minHeight={320}>
          {/* Chat (60%) */}
          <Box flex={3} minWidth={0} height="100%" display="flex" flexDirection="column">
            {/* Mensajes */}
            <Box
              ref={messagesContainerRef}
              flex={1}
              minHeight={0}
              maxHeight="45vh"
              overflow="auto"
              mb={1}
            >
              {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

              <Stack spacing={2}>
                {chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    display="flex"
                    justifyContent={message.sender === "user" ? "flex-end" : "flex-start"}
                  >
                    <Paper
                      sx={{
                        maxWidth: "80%",
                        px: 2,
                        py: 1.5,
                        bgcolor: message.sender === "user"
                          ? "primary.main"
                          : "background.default",
                        color: message.sender === "user"
                          ? "primary.contrastText"
                          : "text.primary",
                        borderRadius: 2
                      }}
                      elevation={message.sender === "user" ? 3 : 1}
                    >
                      <ReactMarkdown
                        children={message.content}
                        components={{
                          p: (props) => <Typography variant="body2" sx={{ mb: 0.5 }}>{props.children}</Typography>,
                          ul: (props) => <ul style={{ paddingLeft: "1.2em", margin: 0 }}>{props.children}</ul>,
                          ol: (props) => <ol style={{ paddingLeft: "1.2em", margin: 0 }}>{props.children}</ol>,
                          li: (props) => <li><Typography variant="body2" component="span">{props.children}</Typography></li>,
                          code: (props) => <code style={{ background: "#eee", borderRadius: 4, padding: "0 4px" }}>{props.children}</code>
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.6, display: "block", mt: 1 }}>
                        {message.timestamp instanceof Date
                          ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Área de entrada o botón de análisis según estado */}
            {smState === "new_requisites" ? (
              <Box pt={2} pb={1} display="flex" width="100%" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={onGenerateRequirements}
                  startIcon={<SparklesIcon />}
                  sx={{ py: 2, fontSize: 18, fontWeight: 500 }}
                  disabled={loading}
                >
                  {t.analyzeWithAI}
                </Button>
              </Box>
            ) : (
              <>
                {/* fila input + acciones */}
                <Box display="flex" alignItems="end" gap={2} pt={2} pb={1}>
                  <TextField
                    multiline
                    minRows={2}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.textareaPlaceholder}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ bgcolor: "background.paper" }}
                    disabled={loading}
                  />
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={onGenerateRequirements}
                      title={t.analyzeWithAI}
                      size="small"
                      disabled={loading}
                    >
                      <SparklesIcon fontSize="small" />
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSend}
                      size="small"
                      disabled={loading || !inputValue.trim()}
                    >
                      <SendIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Box>

                {/* Acciones extra SOLO en modo STALL */}
                {smState === "stall" && (
                  <Box pb={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        disabled={loading}
                        onClick={() => console.log("Añadir R. Funcionales")}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Añadir R. Funcionales
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        endIcon={<ArrowDropDownIcon />}
                        onClick={handleOpenMenu}
                        disabled={loading}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Añadir R. No Funcionales
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleCloseMenu}
                        MenuListProps={{ dense: true }}
                      >
                        <MenuItem onClick={() => { console.log("performance"); handleCloseMenu(); }}>Performance</MenuItem>
                        <MenuItem onClick={() => { console.log("usability"); handleCloseMenu(); }}>Usability</MenuItem>
                        <MenuItem onClick={() => { console.log("security"); handleCloseMenu(); }}>Security</MenuItem>
                        <MenuItem onClick={() => { console.log("technical"); handleCloseMenu(); }}>Technical</MenuItem>
                      </Menu>
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Lateral: archivos config + requisitos ejemplo (40%) */}
          {showFiles && (
            <Box flex={2} minWidth={0} borderLeft={1} borderColor="divider" pl={3} height="100%" display="flex" flexDirection="column">
              {/* Combo de archivos subidos (mock) */}
              <Box mb={2}>
                <Typography fontWeight="medium" display="flex" alignItems="center" gap={1} mb={1}>
                  <UploadIcon fontSize="small" />
                  {t.referenceFiles}
                </Typography>
                <TextField
                  select
                  value={selectedConfigFile}
                  onChange={e => setSelectedConfigFile(e.target.value as number | "")}
                  SelectProps={{ native: true }}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <option value="">{t.selectFilePlaceholder}</option>
                  {uploadedConfigFilesMock.map(f =>
                    <option key={f.id} value={f.id}>{f.name}</option>
                  )}
                </TextField>
              </Box>

              {/* Campo de texto multilinea para ejemplos de requisitos */}
              <Box flex={1} display="flex" flexDirection="column">
                <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                  {t.exampleRequirementsTitle}
                </Typography>
                <TextField
                  multiline
                  minRows={7}
                  maxRows={14}
                  fullWidth
                  variant="outlined"
                  placeholder={t.exampleRequirementsPlaceholder}
                  value={exampleRequirementsText}
                  onChange={e => setExampleRequirementsText(e.target.value)}
                  sx={{ flex: 1, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {t.exampleRequirementsNote}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
