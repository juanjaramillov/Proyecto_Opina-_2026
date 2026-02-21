import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Core Pages
import Home from "./features/home/pages/Home";
import Experience from "./features/feed/pages/Experience";
import Profile from "./features/profile/pages/Profile";
import Results from "./features/results/pages/Results";
import Dashboard from "./features/results/pages/Dashboard";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import ProfileWizard from "./features/auth/components/ProfileWizard";
import PersonalState from "./features/profile/pages/PersonalState";
import Rankings from "./features/rankings/pages/Rankings";
import PublicRankingPage from './features/rankings/pages/PublicRankingPage';
import AboutUs from "./pages/static/AboutUs";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<ProfileWizard />} />
          <Route path="/clinicas-santiago/:attributeSlug" element={<PublicRankingPage />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Protected Routes */}
          <Route path="/experience" element={<ProtectedRoute><Experience /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/personal-state" element={<ProtectedRoute><PersonalState /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
