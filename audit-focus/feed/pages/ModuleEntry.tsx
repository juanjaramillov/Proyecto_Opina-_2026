import { Navigate, useParams } from "react-router-dom";
import { MODULES } from "../modulesConfig";
import ComingSoonModule from "./ComingSoonModule";

export default function ModuleEntry() {
    const { slug } = useParams();

    const activeModule = MODULES.find((m) => m.slug === slug);

    if (!activeModule) {
        // Fallback robusto al hub si alguien tipea una URL loca
        return <Navigate to="/signals" replace />;
    }

    if (activeModule.status === "active") {
        // Redirige al hub de signals principal pasándole un state para abrir el sub-modo si fuera necesario
        // En tu arquitectura actual todos los activos viven dentro de /signals con una variable de estado
        // Aquí simplificaremos: enviamos al usuario al HUB para que clique el activo, o le pasamos el intent.

        switch (activeModule.key) {
            case "versus":
                return <Navigate to="/signals" state={{ nextBatch: 0 }} replace />;
            case "torneo":
                // Podrías pasarle state={{ mode: 'torneo' }} si el Hub lo soporta
                return <Navigate to="/signals" replace />;
            case "profundidad":
                return <Navigate to="/signals" replace />;
            default:
                return <Navigate to="/signals" replace />;
        }
    }

    // Es un módulo 'soon', mostramos el mockup
    return <ComingSoonModule module={activeModule} />;
}
