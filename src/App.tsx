import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider } from "./features/auth";
import AccessGatePage from "./features/access/pages/AccessGate";
import Gate from "./features/access/components/Gate";
import { MotionConfig } from "framer-motion";
import MainLayout from "./components/layout/MainLayout";
import { GlobalErrorBoundary } from "./components/ui/GlobalErrorBoundary";
import { ModuleErrorBoundary } from "./components/ui/ModuleErrorBoundary";

// Core Pages (Synchronous for fast first render)
import Home from "./features/home/pages/Home";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";

// Lazy Loaded Pages
const SignalsHub = lazy(() => import("./features/feed/pages/SignalsHub"));
const ModuleEntry = lazy(() => import("./features/feed/pages/ModuleEntry"));
const Profile = lazy(() => import("./features/profile/pages/Profile"));
const BattlePage = lazy(() => import("./features/signals/pages/BattlePage"));
const Results = lazy(() => import("./features/results/pages/Results"));
const IntelligenceLanding = lazy(() => import("./features/results/pages/IntelligenceLanding"));
const ForgotPassword = lazy(() => import("./features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./features/auth/pages/ResetPassword"));
const ProfileWizard = lazy(() => import("./features/auth/components/ProfileWizard"));
const AdminSystemOverview = lazy(() => import("./features/admin/pages/AdminSystemOverview"));
const OverviewB2B = lazy(() => import("./features/b2b/pages/OverviewB2B"));
const BenchmarkB2B = lazy(() => import("./features/b2b/pages/BenchmarkB2B"));
const AlertsB2B = lazy(() => import("./features/b2b/pages/AlertsB2B"));
const DeepDiveB2B = lazy(() => import("./features/b2b/pages/DeepDiveB2B"));
const ReportsB2B = lazy(() => import("./features/b2b/pages/ReportsB2B"));
const B2BLayout = lazy(() => import("./features/b2b/layouts/B2BLayout"));

// Admin pages
const AdminInvites = lazy(() => import("./features/admin/pages/AdminInvites"));
const AdminHealth = lazy(() => import("./features/admin/pages/AdminHealth"));
const AdminAntifraud = lazy(() => import("./features/admin/pages/AdminAntifraud"));
const AdminActualidad = lazy(() => import("./features/admin/pages/AdminActualidad"));
const AdminActualidadEditor = lazy(() => import("./features/admin/pages/AdminActualidadEditor"));
const AdminUsers = lazy(() => import("./features/admin/pages/AdminUsers"));
const AdminSignals = lazy(() => import("./features/admin/pages/AdminSignals"));
const AdminEntities = lazy(() => import("./features/admin/pages/AdminEntities"));
const AdminTrafficDashboard = lazy(() => import("./features/admin/pages/AdminTrafficDashboard"));
const AdminAnalytics = lazy(() => import("./features/admin/pages/AdminAnalytics"));
const AdminResults = lazy(() => import("./features/admin/pages/AdminResults"));
const AdminMathEngine = lazy(() => import("./features/admin/pages/AdminMathEngine"));
const AdminDemoLaunchpad = lazy(() => import("./features/admin/pages/AdminDemoLaunchpad"));
const AdminSectionLayout = lazy(() => import("./features/admin/layouts/AdminSectionLayout"));

const AboutUs = lazy(() => import("./pages/static/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/static/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/static/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { SessionProvider } from './features/analytics/providers/SessionProvider';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const to = ce?.detail?.to;
      if (typeof to === 'string' && to.length > 0) {
        navigate(to);
      }
    };

    window.addEventListener('opina:navigate', handler as EventListener);
    return () => window.removeEventListener('opina:navigate', handler as EventListener);
  }, [navigate]);

  return (
    <AuthProvider>
      <SessionProvider>
        <MotionConfig reducedMotion="user">
        <GlobalErrorBoundary>
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/access" element={<AccessGatePage />} />
          <Route path="/admin-login" element={<Login />} />
          <Route element={<MainLayout />}>
            {/* 1. PUBLIC ROUTES (No session required, No gate) */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/intelligence" element={<IntelligenceLanding />} />
            
            {/* 2. AUTH ROUTES (Public) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-login" element={<Login />} />

            {/* 3. PROTECTED ROUTES - SIGNALS (Users/Admin) */}
            {/* [CANONICAL] Módulo central interactivo (Reemplaza a Experience) */}
            <Route path="/signals" element={<Gate module="signals"><SignalsHub /></Gate>} />
            
            {/* [LEGACY] Ruta antigua mantenida solo por compatibilidad de deep links */}
            <Route path="/experience" element={<Navigate to="/signals" replace />} />
            
            {/* [CANONICAL] Entry point genérico para submódulos de gamificación (ej. m/versus, m/torneo, m/pulso) */}
            <Route path="/m/:slug" element={<Gate module="signals"><ModuleEntry /></Gate>} />
            
            {/* [LEGACY] Visor aislado de una sola batalla. Se mantiene por enlaces externos compartidos de la V13/V14 */}
            <Route path="/battle/:battleSlug" element={<Gate module="signals"><BattlePage /></Gate>} />
            <Route path="/results" element={<Gate module="signals"><Results /></Gate>} />
            <Route path="/profile" element={<Gate module="signals"><Profile /></Gate>} />
            <Route path="/complete-profile" element={<Gate module="signals"><ProfileWizard /></Gate>} />
            
            {/* 4. PROTECTED ROUTES - B2B INTELLIGENCE (B2B/Admin) */}
            <Route path="/b2b" element={<Gate module="b2b_dashboard"><B2BLayout /></Gate>}>
                <Route path="overview" element={<OverviewB2B />} />
                <Route path="benchmark" element={<BenchmarkB2B />} />
                <Route path="alerts" element={<AlertsB2B />} />
                <Route path="deep-dive" element={<DeepDiveB2B />} />
                <Route path="reports" element={<ReportsB2B />} />
            </Route>
            <Route path="/intelligence-dashboard" element={<Navigate to="/b2b" replace />} />

            {/* 5. PROTECTED ROUTES - ADMIN ONLY */}
            {/* 5.1 Analytics & Rendimiento */}
            <Route path="/admin/analytics" element={<Gate module="admin"><AdminSectionLayout title="Analytics & Rendimiento" description="Visión global del negocio y comportamiento de los usuarios" tabs={[{label: "System Overview", path: "/admin/analytics/system", icon: "data_usage"}, {label: "Tráfico y Usuarios", path: "/admin/analytics/traffic", icon: "monitoring"}, {label: "Insights Analítica", path: "/admin/analytics/insights", icon: "bar_chart"}]} /></Gate>}>
              <Route index element={<Navigate to="system" replace />} />
              <Route path="system" element={<AdminSystemOverview />} />
              <Route path="traffic" element={<AdminTrafficDashboard />} />
              <Route path="insights" element={<AdminAnalytics />} />
            </Route>

            {/* 5.2 Usuarios & Comunidad */}
            <Route path="/admin/users-community" element={<Gate module="admin"><AdminSectionLayout title="Usuarios & Comunidad" description="Directorio CRM y gestión de accesos al piloto" tabs={[{label: "Usuarios CRM", path: "/admin/users-community/crm", icon: "group"}, {label: "Invitaciones", path: "/admin/users-community/invites", icon: "vpn_key"}]} /></Gate>}>
              <Route index element={<Navigate to="crm" replace />} />
              <Route path="crm" element={<AdminUsers />} />
              <Route path="invites" element={<AdminInvites />} />
            </Route>

            {/* 5.3 Catálogo y Contenido */}
            <Route path="/admin/content" element={<Gate module="admin"><AdminSectionLayout title="Catálogo y Contenido" description="Administración del catálogo de entidades y actualidad" tabs={[{label: "Entidades (Base)", path: "/admin/content/entities", icon: "stars"}, {label: "Catálogo General", path: "/admin/content/signals", icon: "database"}, {label: "Mesa Editorial", path: "/admin/content/actualidad", icon: "newspaper"}]} /></Gate>}>
              <Route index element={<Navigate to="entities" replace />} />
              <Route path="actualidad" element={<AdminActualidad />} />
              <Route path="actualidad/:id" element={<AdminActualidadEditor />} />
              <Route path="entities" element={<AdminEntities />} />
              <Route path="signals" element={<AdminSignals />} />
            </Route>

            {/* 5.4 Seguridad & Operaciones */}
            <Route path="/admin/security" element={<Gate module="admin"><AdminSectionLayout title="Seguridad & Operaciones" description="Auditoría técnica, salud del sistema y algoritmos" tabs={[{label: "Antifraude", path: "/admin/security/antifraud", icon: "local_police"}, {label: "Motor Matemático", path: "/admin/security/math-engine", icon: "calculate"}, {label: "Health Checks", path: "/admin/security/health", icon: "monitor_heart"}, {label: "Resultados", path: "/admin/security/results", icon: "rule"}]} /></Gate>}>
              <Route index element={<Navigate to="antifraud" replace />} />
              <Route path="antifraud" element={<AdminAntifraud />} />
              <Route path="math-engine" element={<AdminMathEngine />} />
              <Route path="health" element={<AdminHealth />} />
              <Route path="results" element={<AdminResults />} />
            </Route>

            {/* 5.5 Pilot Launchpad */}
            <Route path="/admin/demo" element={<Gate module="admin"><ModuleErrorBoundary moduleName="Pilot Launchpad"><AdminDemoLaunchpad /></ModuleErrorBoundary></Gate>} />

            {/* 6. FALLBACK */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
        </GlobalErrorBoundary>
      </MotionConfig>
      </SessionProvider>
    </AuthProvider>
  );
}
