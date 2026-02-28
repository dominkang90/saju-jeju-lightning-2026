/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAPI_SERVICE_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
