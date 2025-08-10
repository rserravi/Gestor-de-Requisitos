# Gestor de Requisitos – Frontend

Este repositorio contiene la interfaz web del **Gestor de Requisitos**, una aplicación pensada para capturar, analizar y mejorar requisitos de software con asistencia de IA.

## 💡 Características

- Formulario para capturar requisitos y enviarlos al backend.
- Visualización y edición de requisitos existentes.
- Análisis automático de requisitos utilizando modelos de IA.
- Autenticación de usuarios mediante JWT.
- Integración con el [backend del proyecto](https://github.com/rserravi/Gestor-de-Requisitos-Back).

## 🛠️ Requisitos para el desarrollo

- [Node.js](https://nodejs.org/) 18 o superior.
- [pnpm](https://pnpm.io/) o npm como administrador de paquetes.
- Backend en ejecución desde el repositorio [Gestor-de-Requisitos-Back](https://github.com/rserravi/Gestor-de-Requisitos-Back).

## 📁 Configuración del entorno

1. Clona este repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone https://github.com/rserravi/Gestor-de-Requisitos.git
   cd Gestor-de-Requisitos
   ```

2. Instala las dependencias del frontend:

   ```bash
   pnpm install
   ```

   > Puedes usar `npm install` si no tienes `pnpm`.

3. Copia el archivo de variables de entorno de ejemplo y ajústalo:

   ```bash
   cp .env.example .env
   ```

   - Establece la URL base del backend, por ejemplo:

     ```env
     VITE_API_BASE_URL=http://localhost:8000
     ```

4. Inicia la aplicación en modo desarrollo:

   ```bash
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:5173` por defecto.

5. Asegúrate de que el backend está ejecutándose localmente siguiendo las instrucciones del repositorio [Gestor-de-Requisitos-Back](https://github.com/rserravi/Gestor-de-Requisitos-Back).

## 💾 Scripts disponibles

- `pnpm dev`: Ejecuta el servidor de desarrollo con recarga automática.
- `pnpm build`: Genera la versión de producción del frontend.
- `pnpm preview`: Sirve localmente el build de producción para pruebas.
- `pnpm lint`: Ejecuta ESLint para mantener un estilo de código consistente.
- `pnpm test`: Ejecuta la suite de pruebas con Vitest.

## 🧪 Ejecución de tests

Para correr los tests en modo consola:

```bash
pnpm test
```

> Puedes usar `npm test` si no tienes `pnpm`.

## ♻️ Formato y estilo de código

Este proyecto utiliza [Prettier](https://prettier.io/) para formateo y [ESLint](https://eslint.org/) para detección de problemas en el código. Antes de enviar cambios:

```bash
npx prettier . --write
pnpm lint
```

## 📝 Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).
