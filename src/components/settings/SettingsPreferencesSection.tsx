import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import type { UserModel } from "../../models/user-model";

interface SettingsPreferencesSectionProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
}

export function SettingsPreferencesSection({ user, onUpdate }: SettingsPreferencesSectionProps) {
  // Estados locales para edición (mock)
  const [language, setLanguage] = useState(user.preferences.language);
  const [theme, setTheme] = useState(user.preferences.theme);
  const [timezone, setTimezone] = useState(user.preferences.timezone);
  const [notifications, setNotifications] = useState(user.preferences.notifications);

  // Ejemplo de guardar cambios (simulado)
  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...user,
        preferences: {
          language,
          theme,
          timezone,
          notifications,
        },
      });
    }
    // feedback visual...
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Preferencias</h2>
      <div className="space-y-4 max-w-md">
        <label className="block mb-1">
          Idioma
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ca">Català</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="block mb-1">
          Tema
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="auto">Automático</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="block mb-1">
          Zona horaria
          <Input value={timezone} onChange={e => setTimezone(e.target.value)} />
        </label>
        <div className="flex items-center gap-2 mt-2">
          <label>Notificaciones</label>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
        <button
          className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
          onClick={handleSave}
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
