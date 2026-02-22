
const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },

    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },

    error: (...args: unknown[]) => {
        // Los errores SIEMPRE se registran
        console.error(...args);
    },
};
