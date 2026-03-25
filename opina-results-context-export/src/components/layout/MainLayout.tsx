import { Outlet } from "react-router-dom";
import PageShell from "./PageShell";

export default function MainLayout() {

    // MainLayout now only provides the layout structure.
    // Authorization is handled by the Gate component in App.tsx.

    return (
        <PageShell>
            <Outlet />
        </PageShell>
    );
}
