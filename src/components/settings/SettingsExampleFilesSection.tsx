import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Stack,
    Button,
    IconButton,
    Paper
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import type { UserModel } from "../../models/user-model";
import { getTranslations, type Language } from "../../i18n";

// Utilidad para mostrar nombre legible a partir de ID (ajusta según tu backend)
const fileNameById = (id: string) => `Ejemplo_${id.slice(-5)}.pdf`;

interface SettingsExampleFilesSectionProps {
    user: UserModel;
    onUpdate?: (user: UserModel) => void;
    language: Language;
}

export function SettingsExampleFilesSection({ user, onUpdate, language }: SettingsExampleFilesSectionProps) {
    const [files, setFiles] = useState(user.exampleFiles?.files ?? []);
    const [prefered, setPrefered] = useState(user.exampleFiles?.prefered ?? "");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = getTranslations(language);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const newId = `file_${Date.now()}`;
        setFiles(prev => [...prev, newId]);
        if (files.length === 0) setPrefered(newId);
        e.target.value = "";
    };

    const handleFileDelete = (id: string) => {
        const newFiles = files.filter(f => f !== id);
        setFiles(newFiles);
        if (prefered === id) {
            setPrefered(newFiles[0] || "");
        }
        // Actualiza backend si hace falta
    };
    const handleSetPrefered = (id: string) => {
        setPrefered(id);
        // Actualiza backend si hace falta
    };

    return (
        <Box sx={{ maxWidth: 440 }}>
            <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h5" fontWeight="bold">
                    {t.settingsFilesTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {t.settingsFilesCount.replace('{count}', String(files.length))}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
                {t.settingsFilesDescription}
            </Typography>
            <Stack spacing={2}>
                {files.length === 0 && (
                    <Typography color="text.secondary" fontStyle="italic">
                        {t.settingsFilesNoFiles}
                    </Typography>
                )}
                {files.map(f => (
                    <Paper
                        key={f}
                        elevation={1}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 1.2,
                            pl: 2,
                            bgcolor: prefered === f ? "action.selected" : "background.paper"
                        }}
                    >
                        <IconButton
                            color={prefered === f ? "warning" : "default"}
                            onClick={() => setPrefered(f)}
                            title={t.settingsFilesMarkFavorite}
                            size="small"
                            sx={{ mr: 1 }}
                        >
                            {prefered === f ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {fileNameById(f)}
                        </Typography>
                        <IconButton
                            color="error"
                            onClick={() => handleFileDelete(f)}
                            title={t.settingsFilesDelete}
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Paper>
                ))}

                {/* Subir archivo, solo si hay menos de 5 */}
                {files.length < 5 && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.md"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ mt: 1, alignSelf: "flex-start" }}
                        >
                            {t.settingsFilesUploadNew}
                        </Button>
                    </>
                )}
            </Stack>
        </Box>
    );
}
