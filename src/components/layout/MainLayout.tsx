import { Outlet } from "react-router-dom";
import PageShell from "./PageShell";

export default function MainLayout() {
    return (
        <PageShell>
            <Outlet />
        </PageShell>
    );
}
