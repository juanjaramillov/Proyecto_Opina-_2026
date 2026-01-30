import React from "react";
import { computeAccountProfile, AccountTier } from "../../../auth/account";
import Paywall from "../../../components/common/Paywall";

export default function RequireEntitlement(props: {
    tier: AccountTier;
    profileCompleteness: number;
    hasCI: boolean;
    require: "insights" | "history" | "export";
    children: React.ReactNode;
}) {
    const account = computeAccountProfile({
        tier: props.tier,
        profileCompleteness: props.profileCompleteness,
        hasCI: props.hasCI,
    });

    const ok =
        (props.require === "insights" && account.canSeeInsights) ||
        (props.require === "history" && account.canSeeHistory) ||
        (props.require === "export" && account.canExport);

    if (ok) return <>{props.children}</>;

    // Bloqueo duro: no renderiza contenido
    // Usamos Paywall si es un requerimiento avanzado
    const title =
        props.require === "export" ? "Dashboard Empresas" :
            props.require === "history" ? "Histórico Completo" :
                "Acceso Reservado";

    return <Paywall title={title} />;
}
