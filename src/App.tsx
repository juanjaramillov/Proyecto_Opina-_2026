import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider } from "./features/auth";
import AccessGatePage from "./features/access/pages/AccessGate";
import Gate from "./features/access/components/Gate";
import { MotionConfig } from "framer-motion";
import MainLayout from "./components/layout/MainLayout";
import { GlobalErrorBoundary } from "./components/ui/GlobalErrorBoundary";

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
const AdminBrands = lazy(() => import("./features/admin/pages/AdminBrands"));

const AboutUs = lazy(() => import("./pages/static/AboutUs"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { Analytics } from '@vercel/analytics/react';
import { useSessionTracker } from './hooks/useSessionTracker';

export default function App() {
  // Mount the global session tracker
  useSessionTracker();

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
      <MotionConfig reducedMotion="user">
        <Analytics />
        <GlobalErrorBoundary>
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#07051A]"><div className="w-12 h-12 border-4 border-[#3D37F0] border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/access" element={<AccessGatePage />} />
          <Route path="/admin-login" element={<Login />} />
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<Gate module="public"><ProfileWizard /></Gate>} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/intelligence" element={<IntelligenceLanding />} />

            {/* Protected Routes (Experience Module) */}
            <Route path="/signals" element={<Gate module="experience"><SignalsHub /></Gate>} />
            <Route path="/experience" element={<Navigate to="/signals" replace />} />
            <Route path="/m/:slug" element={<Gate module="experience"><ModuleEntry /></Gate>} />
            <Route path="/battle/:battleSlug" element={<Gate module="experience"><BattlePage /></Gate>} />
            <Route path="/results" element={<Gate module="experience"><Results /></Gate>} />
            <Route path="/profile" element={<Gate module="experience"><Profile /></Gate>} />
            
            {/* New B2B Intelligence Suite Router */}
            <Route path="/b2b" element={<Gate module="b2b_dashboard"><B2BLayout /></Gate>}>
                <Route path="overview" element={<OverviewB2B />} />
                <Route path="benchmark" element={<BenchmarkB2B />} />
                <Route path="alerts" element={<AlertsB2B />} />
                <Route path="deep-dive" element={<DeepDiveB2B />} />
                <Route path="reports" element={<ReportsB2B />} />
            </Route>
            
            {/* Legacy routes redirect to B2B architecture */}
            <Route path="/intelligence-dashboard" element={<Navigate to="/b2b" replace />} />

            <Route path="/admin/system" element={<Gate module="admin"><AdminSystemOverview /></Gate>} />
            <Route path="/admin/invitaciones" element={<Gate module="admin"><AdminInvites /></Gate>} />
            <Route path="/admin/health" element={<Gate module="admin"><AdminHealth /></Gate>} />
            <Route path="/admin/antifraude" element={<Gate module="admin"><AdminAntifraud /></Gate>} />
            <Route path="/admin/actualidad" element={<Gate module="admin"><AdminActualidad /></Gate>} />
            <Route path="/admin/actualidad/:id" element={<Gate module="admin"><AdminActualidadEditor /></Gate>} />
            <Route path="/admin/users" element={<Gate module="admin"><AdminUsers /></Gate>} />
            <Route path="/admin/signals" element={<Gate module="admin"><AdminSignals /></Gate>} />
            <Route path="/admin/brands" element={<Gate module="admin"><AdminBrands /></Gate>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
        </GlobalErrorBoundary>
      </MotionConfig>
    </AuthProvider>
  );
}
