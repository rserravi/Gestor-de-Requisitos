import { useState, useRef } from "react";
import {
  Paper, Box, Stack, Typography, IconButton, Button, Collapse, TextField
} from "@mui/material";
import {
  Send as SendIcon,
  UploadFile as UploadIcon,
  InsertDriveFile as FileTextIcon,
  AutoAwesome as SparklesIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";
import { getTranslations, type Language } from "../i18n";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatAreaProps {
  onGenerateRequirements: () => void;
  showFiles: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  language: Language;
}

export function ChatArea({
  onGenerateRequirements,
  showFiles,
  collapsed,
  onToggleCollapse,
  language,
}: ChatAreaProps) {
  const t = getTranslations(language);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t.aiInitialMessage,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: t.aiResponseMessage,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, mb: 1, p: 0, display: "flex", flexDirection: "column", height: collapsed ? "auto" : "100%" }}>
      {/* Header: siempre visible */}
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

      {/* Contenido expandible */}
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        <Box display="flex" flexDirection="row" gap={3} px={3} py={3} flex={1} minHeight={320}>
          {/* Chat Messages + Input (60%) */}
          <Box flex={3} minWidth={0} height="100%" display="flex" flexDirection="column">
            {/* Mensajes con scroll */}
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
            {/* Input siempre visible */}
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
          {/* Uploaded Files (40%) */}
          {showFiles && (
            <Box flex={2} minWidth={0} borderLeft={1} borderColor="divider" pl={3} height="100%">
              <Box mb={2}>
                <Typography fontWeight="medium" display="flex" alignItems="center" gap={1}>
                  <UploadIcon fontSize="small" />
                  {t.referenceFiles}
                </Typography>
              </Box>
              <Stack direction="column" spacing={1}>
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "grey.50",
                        boxShadow: 0.5,
                        mb: 0.5,
                        pr: 1
                      }}
                    >
                      <FileTextIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" noWrap sx={{ flex: 1, maxWidth: 120 }}>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        sx={{ ml: 1 }}
                        color="error"
                        title={t.removeFile || "Eliminar"}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    {t.noFilesUploaded}
                  </Typography>
                )}
                {/* Botón subir archivo al final */}
                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.doc,.docx,.pdf,.md"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    {t.addFileButton || "Subir archivo"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
