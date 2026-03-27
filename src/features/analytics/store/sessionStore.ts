import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SessionState {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: 'opina-session-storage',
      storage: createJSONStorage(() => sessionStorage), // Usamos sessionStorage para que el ID dure lo que dura la ventana/pestaña
    }
  )
);
