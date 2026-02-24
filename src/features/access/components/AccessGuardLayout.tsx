import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { accessGate } from '../services/accessGate';

export default function AccessGuardLayout() {
    const location = useLocation();

    if (!accessGate.isEnabled()) return <Outlet />;

    if (!accessGate.hasAccess()) {
        const next = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/access?next=${next}`} replace />;
    }

    return <Outlet />;
}
