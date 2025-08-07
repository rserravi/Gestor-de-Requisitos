import type { UserModel } from "../../models/user-model";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

interface SettingsUserSectionProps {
  user: UserModel;
  onUpdate?: (user: UserModel) => void;
}

export function SettingsUserSection({ user, onUpdate }: SettingsUserSectionProps) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  // ...avatar mock logic...

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Datos de Usuario</h2>
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{username[0]}</AvatarFallback>
        </Avatar>
        <div>
          {/* Upload avatar (como ya vimos antes) */}
          <input type="file" className="hidden" id="avatar-upload" />
          <label htmlFor="avatar-upload">
            <Button asChild>
              <span>Subir Imagen</span>
            </Button>
          </label>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <label className="block mb-1">
          Nombre
          <Input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label className="block mb-1">
          Email
          <Input value={email} onChange={e => setEmail(e.target.value)} />
        </label>
      </div>
      {/* Botón de guardar/cancelar cambios si quieres */}
    </div>
  );
}
