import { useState, useRef } from "react";
import { Send, Upload, FileText, Sparkles, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

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
    <div className={`flex flex-col border border-border rounded-lg bg-card transition-all duration-200 ${collapsed ? "h-auto" : "h-full"}`}>
      {/* Main Header with Collapse/Expand */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted rounded-t-lg">
        <span className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {t.chatTitle}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title={collapsed ? t.expand : t.collapse}
          className="ml-2"
        >
          {collapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Only render content if expanded */}
      {!collapsed && (
        <div className="flex flex-row gap-2 px-4 py-4 flex-1 min-h-[320px]">
          {/* Chat Messages + Input (60%) */}
          <div className="flex flex-col flex-[3] min-w-0 h-full">
            {/* Mensajes con scroll */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <CardContent className="p-3">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {/* Input abajo, siempre visible */}
            <div className="pt-4 border-t border-border bg-card">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.textareaPlaceholder}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onGenerateRequirements}
                    title={t.analyzeWithAI}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Uploaded Files (40%) */}
          {showFiles && (
            <div className="flex-[2] min-w-0 border-l border-border pl-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {t.referenceFiles}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.doc,.docx,.pdf,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title={t.addFile}
                    className="flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">{t.addFileButton}</span>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {uploadedFiles.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {uploadedFiles.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 justify-between">
                      <FileText className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  {t.noFilesUploaded}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
