import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useEntitlements } from '../../../hooks/useEntitlements';

export default function EntitlementGate({
  allow,
  redirectTo = '/profile',
  children,
}: {
  allow: (e: ReturnType<typeof useEntitlements>) => boolean;
  redirectTo?: string;
  children: ReactNode;
}) {
  const ent = useEntitlements();
  if (!allow(ent)) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
