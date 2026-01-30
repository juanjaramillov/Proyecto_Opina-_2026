import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Role = "usuario" | "empresa";

function getRole(): Role {
    const v = localStorage.getItem("opina_role");
    return v === "empresa" ? "empresa" : "usuario";
}

type Props = {
    allow: Role;
    children: ReactNode;
};

export default function RoleGate({ allow, children }: Props) {
    const role = getRole();
    const navigate = useNavigate();

    if (role !== allow) {
        return (
            <div className="rounded-2xl border border-dashed border-stroke bg-surface p-10 text-center shadow-card">
                <div className="text-3xl mb-3">🚧</div>
                <h3 className="text-base font-semibold text-ink">
                    Esta vista no es para ti
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                    Estás navegando como <b>{role}</b>.
                    Esta sección está pensada para <b>{allow}</b>.
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lift"
                >
                    Volver al inicio
                </button>

                <div className="mt-3 text-xs text-text-muted">
                    No es censura. Es foco.
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
