import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import type { UserModel } from "../../models/user-model";

// Utilidad para mostrar nombre legible a partir de ID (ajusta según tu backend)
const fileNameById = (id: string) => `Ejemplo_${id.slice(-5)}.pdf`;

interface SettingsExampleFilesSectionProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
}

export function SettingsExampleFilesSection({ user, onUpdate }: SettingsExampleFilesSectionProps) {
  const [files, setFiles] = useState(user.exampleFiles?.files ?? []);
  const [prefered, setPrefered] = useState(user.exampleFiles?.prefered ?? "");

  // Mock: subir archivo (sólo añade ID local)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newId = `file_${Date.now()}`;
    setFiles(prev => [...prev, newId]);
    if (files.length === 0) setPrefered(newId);
    // Aquí harías la subida real y actualización de backend
  };

  // Mock: eliminar archivo
  const handleFileDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f !== id));
    if (prefered === id) {
      setPrefered(files.find(f => f !== id) || "");
    }
    // Actualiza backend si hace falta
  };

  const handleSetPrefered = (id: string) => {
    setPrefered(id);
    // Actualiza backend si hace falta
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Archivos de ejemplo</h2>
      <div className="space-y-2 max-w-md">
        {files.length === 0 && (
          <div className="text-muted-foreground italic">
            No hay archivos de ejemplo subidos aún.
          </div>
        )}
        {files.map(f => (
          <div key={f} className="flex items-center gap-3">
            <Checkbox
              checked={prefered === f}
              onCheckedChange={() => handleSetPrefered(f)}
            />
            <span>{fileNameById(f)}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFileDelete(f)}
            >
              Eliminar
            </Button>
          </div>
        ))}
        {files.length < 5 && (
          <>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileUpload}
              id="example-file-upload"
              className="hidden"
            />
            <label htmlFor="example-file-upload">
              <Button className="mt-2" asChild>
                <span>Subir nuevo archivo</span>
              </Button>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
