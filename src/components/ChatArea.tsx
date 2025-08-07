import { useState, useRef } from "react";
import {
  Paper, Box, Stack, Typography, IconButton, Button, Collapse, TextField
} from "@mui/material";
import {
  Send as SendIcon,
  UploadFile as UploadIcon,
  AutoAwesome as SparklesIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";
import { getTranslations, type Language } from "../i18n";
import type { MessageModel } from "../models/message-model";
import { messageMock } from "../mock/message-mock";

interface ChatAreaProps {
  onGenerateRequirements: () => void;
  showFiles: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  language: Language;
  projectId: number;
}

export function ChatArea({
  onGenerateRequirements,
  showFiles,
  collapsed,
  onToggleCollapse,
  language,
  projectId
}: ChatAreaProps) {
  const t = getTranslations(language);
  const [messages, setMessages] = useState<MessageModel[]>(messageMock as MessageModel[]);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock de archivos de configuración subidos
  const uploadedConfigFilesMock = [
    { id: 1, name: "requisitos_api.docx" },
    { id: 2, name: "ejemplo_requisitos.md" }
  ];
  const [selectedConfigFile, setSelectedConfigFile] = useState<number | "">("");
  const [exampleRequirementsText, setExampleRequirementsText] = useState<string>("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: MessageModel = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      state: "init",
      project_id: projectId
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Simula respuesta de la IA
    setTimeout(() => {
      const aiResponse: MessageModel = {
        id: (Date.now() + 1).toString(),
        content: t.aiResponseMessage,
        sender: 'ai',
        timestamp: new Date(),
        state: "init",
        project_id: projectId
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            <Box flex={1} minHeight={0} maxHeight="45vh" overflow="auto" mb={1}>
              <Stack spacing={2}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    display="flex"
                    justifyContent={message.sender === 'user' ? "flex-end" : "flex-start"}
                  >
                    <Paper
                      sx={{
                        maxWidth: "80%",
                        px: 2,
                        py: 1.5,
                        bgcolor: message.sender === 'user'
                          ? "primary.main"
                          : "background.default",
                        color: message.sender === 'user'
                          ? "primary.contrastText"
                          : "text.primary",
                        borderRadius: 2
                      }}
                      elevation={message.sender === 'user' ? 3 : 1}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{message.content}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, display: "block", mt: 1 }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Stack>
            </Box>
            {/* Input */}
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
              />
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onGenerateRequirements}
                  title={t.analyzeWithAI}
                  size="small"
                >
                  <SparklesIcon fontSize="small" />
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                  size="small"
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Stack>
            </Box>
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
