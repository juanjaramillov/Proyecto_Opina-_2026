/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEMO_MODE: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
