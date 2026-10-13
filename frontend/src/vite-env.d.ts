/// <reference types="vite/client" />

// Variables de entorno que usa el frontend (tipadas, sin any)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
