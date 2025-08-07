import { useState } from "react";
import { SettingsUserSection } from "../components/settings/SettingsUserSection";
import { SettingsPreferencesSection } from "../components/settings/SettingsPreferencesSection";
import { SettingsExampleFilesSection } from "../components/settings/SettingsExampleFilesSection";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserModel } from "../models/user-model";

interface SettingsPageProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
}

const SECTIONS = [
  { id: "user", label: "Datos de Usuario" },
  { id: "preferences", label: "Preferencias" },
  { id: "exampleFiles", label: "Archivos de ejemplo" },
];

export function SettingsPage({ user, onUpdate }: SettingsPageProps) {
  const [section, setSection] = useState("user");
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 flex gap-10">
      {/* Panel lateral */}
      <aside className="w-56 flex-shrink-0">
        <button
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>
        <nav className="flex flex-col gap-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`rounded px-4 py-2 text-left transition ${
                section === s.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-muted"
              }`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Área de contenido */}
      <section className="flex-1 min-w-0">
        {section === "user" && (
          <SettingsUserSection user={user} onUpdate={onUpdate} />
        )}
        {section === "preferences" && (
          <SettingsPreferencesSection user={user} onUpdate={onUpdate} />
        )}
        {section === "exampleFiles" && (
          <SettingsExampleFilesSection user={user} onUpdate={onUpdate} />
        )}
      </section>
    </div>
  );
}
