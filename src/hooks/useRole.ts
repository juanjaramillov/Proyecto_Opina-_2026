import { useState } from 'react';

type Role = "usuario" | "empresa";

const STORAGE_KEY = "opina_role";

export function useRole() {
    // Initialize state lazily to avoid hydration mismatch if used with SSR (though this is client-side app)
    // and to read from localStorage only once on mount logic if needed, but here simple useState initializer works.
    const [role, setRoleState] = useState<Role>(() => {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === "empresa" ? "empresa" : "usuario";
    });

    const setRole = (newRole: Role) => {
        localStorage.setItem(STORAGE_KEY, newRole);
        setRoleState(newRole);
    };

    const toggleRole = () => {
        const next: Role = role === "empresa" ? "usuario" : "empresa";
        setRole(next);
    };

    return { role, setRole, toggleRole };
}
