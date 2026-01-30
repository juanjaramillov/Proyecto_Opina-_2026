import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

// Core
import Home from "./features/home/pages/Home";
import Profile from "./features/user/pages/Profile";

import NotFound from "./pages/NotFound";
import Verification from "./features/auth/pages/Verification";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";

// Existing pages
// ... imports
import Versus from "./features/signals/pages/Versus";

// ... inside Routes


import Results from "./features/feed/pages/Results"; // Moved to feature
import Radiografia from "./features/analytics/pages/Radiografia"; // Moved to feature
import Radiografias from "./features/analytics/pages/Radiografias";
import ConsumerReview from "./features/feed/pages/ConsumerReview";
import ProductDetail from "./features/signals/pages/ProductDetail";
import SignalDetail from "./features/signals/pages/SignalDetail";
import Monetization from "./pages/static/Monetization";
import Contact from "./pages/static/Contact";
import Cookies from "./pages/static/Cookies";
import MySignal from "./features/user/pages/MySignal";

// Dashboards (usuario/empresa)
import DashboardUsuarios from "./features/user/pages/DashboardUsuarios";
import EnterpriseDashboard from "./features/b2b/pages/EnterpriseDashboard"; // Moved to feature

// Señales (hub y módulos)
import Signals from "./features/signals/pages/Signals";
import Places from "./features/signals/pages/Places";
import Products from "./features/signals/pages/Products";
import AboutUs from "./pages/static/AboutUs";
import Surveys from "./features/signals/pages/Surveys";

// Páginas Base
import FAQ from "./pages/static/FAQ";
import Legal from "./pages/static/Legal";
import Privacy from "./pages/static/Privacy";

// Gate (lo mantenemos solo en lo que ya estaba protegido)
import RequireVerified from "./features/auth/components/RequireVerified";

// Pitch Page
import Pitch from "./features/pitch/pages/Pitch";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Base */}
        <Route path="/" element={<Home />} />

        {/* Pitch Deck */}
        <Route path="/pitch" element={<Pitch />} />

        {/* =========================
            CANÓNICO: Señales (HUB)
        ========================== */}
        <Route path="/senales" element={<Signals />} />
        <Route path="/versus" element={<Versus />} />
        <Route path="/senales/versus" element={<Navigate to="/versus" replace />} />
        <Route path="/senales/insights" element={<Surveys />} />
        <Route path="/senales/lugares-servicios" element={<Places />} />
        <Route path="/senales/productos" element={<Products />} />
        <Route path="/signal/:id" element={<SignalDetail />} />

        {/* =========================
            PROTEGIDOS (como ya estaban)
        ========================== */}
        <Route
          path="/review"
          element={
            <RequireVerified>
              <ConsumerReview />
            </RequireVerified>
          }
        />
        <Route
          path="/product/:id"
          element={
            <RequireVerified>
              <ProductDetail />
            </RequireVerified>
          }
        />
        <Route
          path="/my-signal"
          element={
            <RequireVerified>
              <MySignal />
            </RequireVerified>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireVerified>
              <DashboardUsuarios />
            </RequireVerified>
          }
        />
        <Route
          path="/enterprise"
          element={
            <RequireVerified>
              <EnterpriseDashboard />
            </RequireVerified>
          }
        />

        {/* Abiertos (sin verificación) */}
        <Route path="/results" element={<Results />} />
        <Route path="/radiografia" element={<Radiografia />} />
        <Route path="/radiografias" element={<Radiografias />} />

        <Route path="/about" element={<AboutUs />} />
        <Route path="/monetization" element={<Monetization />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cookies" element={<Cookies />} />

        <Route path="/profile" element={<Profile />} />

        {/* Ruta canónica de verificación */}
        <Route path="/verificacion" element={<Verification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/faq" element={<FAQ />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />



        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
