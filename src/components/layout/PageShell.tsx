import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../features/auth";
import { useRole } from "../../hooks/useRole";
import { useSignalStore } from "../../store/signalStore";
import { MIN_SIGNALS_THRESHOLD } from "../../config/constants";
import FeedbackFab from "../ui/FeedbackFab";

const MENU_ITEMS = [
  { id: 'participa', label: 'Participa', route: '/experience' },
  { id: 'results', label: 'Resultados', route: '/results' },
  { id: 'rankings', label: 'Rankings', route: '/rankings' },
  { id: 'about', label: 'Nosotros', route: '/about' },
];


export default function PageShell({ children }: { children: React.ReactNode }) {
  // Simplified user check logic, relying on profile or extending later
  const { profile } = useAuth();
  const { role } = useRole();
  const signals = useSignalStore(s => s.signals);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthenticated = profile && profile.tier !== 'guest';

  const nextMilestone = Math.ceil((signals + 1) / 10) * 10;
  const toNext = nextMilestone - signals;

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // ✅ Feedback WhatsApp: se oculta en /admin. FeedbackFab maneja sus propias variables de entorno
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showFeedbackFab = !isAdminRoute;

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-indigo-600 focus:font-bold">Saltar al contenido</a>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm py-2' : 'glass-aurora bg-white/60 border-b border-white/20 py-4'}`}>
        <div className="w-full px-4 sm:px-8 xl:px-12 flex items-center justify-between gap-4">

          {/* Logo & Level (Left side) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NavLink to="/" className="flex items-center gap-2 group hover:opacity-90 transition" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1">
                  <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                  <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight hidden sm:block">Opina+</span>
            </NavLink>

          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 text-slate-600 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2 lg:gap-4 justify-end flex-nowrap">
            {/* Desktop Menu Mapping */}
            {MENU_ITEMS.map((item) => {
              const isLocked = item.id === 'results' && signals < MIN_SIGNALS_THRESHOLD;

              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  className={({ isActive }) =>
                    [
                      "text-sm font-bold transition-colors whitespace-nowrap px-1 flex items-center gap-1",
                      isActive ? "text-primary" : "text-slate-500 hover:text-primary",
                    ].join(" ")
                  }
                >
                  {item.label}
                  {isLocked && <span className="material-symbols-outlined text-[12px] opacity-50">lock</span>}
                </NavLink>
              )
            })}

            {isAuthenticated ? (
              <NavLink
                to="/profile"
                className="flex items-center gap-1.5 ml-2 lg:ml-4 px-2 py-1.5 lg:px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all font-bold text-slate-700 text-sm active:scale-95 group shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px] uppercase shadow-inner">
                  {(profile?.displayName || 'U').charAt(0)}
                </div>
                <span>{profile?.displayName || 'Usuario'}</span>
                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200/50 text-[10px] uppercase tracking-wide ml-1 transition-all group-hover:bg-amber-200" title={`Faltan ${toNext} señales para tu próximo hito`}>
                  <span className="material-symbols-outlined text-[12px] text-amber-600">star</span>
                  <span>Faltan {toNext}</span>
                </div>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 ml-4 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Iniciar Sesión
              </NavLink>
            )}

            {/* ENLACES ADMINISTRACION */}
            {isAuthenticated && (role === 'admin' || (profile as any)?.role === 'admin' || profile?.email === 'admin@opinaplus.com') && (
              <div className="relative ml-1 lg:ml-2 flex items-center h-full" ref={adminMenuRef}>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 active:scale-95 shadow-sm border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  Admin
                  <span className={`material-symbols-outlined text-[14px] transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <div className={`absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl transition-all duration-200 z-[100] overflow-hidden flex flex-col pt-1 ${isAdminMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                  <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Panel de Control</p>
                  </div>
                  <NavLink to="/admin/invitaciones" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                    Invitaciones
                  </NavLink>
                  <NavLink to="/admin/health" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                    Health Checks
                  </NavLink>
                  <NavLink to="/admin/antifraude" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">local_police</span>
                    Antifraude
                  </NavLink>
                  <NavLink to="/admin/modules-demand" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    Demanda Módulos
                  </NavLink>
                  <NavLink to="/admin/modules-priority" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">sort</span>
                    Prioridad Módulos
                  </NavLink>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg sm:hidden flex flex-col z-40 py-2 animate-in slide-in-from-top-2 duration-200">
            {MENU_ITEMS.map((item) => {
              const isLocked = item.id === 'results' && signals < MIN_SIGNALS_THRESHOLD;

              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between border-b border-slate-50 last:border-0 ${isActive ? "text-primary bg-slate-50" : "text-slate-600 hover:text-primary hover:bg-slate-50"}`
                  }
                >
                  <div className="flex items-center gap-2">
                    {item.label}
                    {isLocked && <span className="material-symbols-outlined text-[14px] opacity-50">lock</span>}
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
                </NavLink>
              )
            })}

            {isAuthenticated ? (
              <NavLink
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 mt-2 mb-2 px-4 py-3 text-sm font-bold text-slate-700 transition-colors flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[12px] uppercase shadow-inner">
                    {(profile?.displayName || 'U').charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-ink">{profile?.displayName || 'Mi Perfil'}</span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Faltan {toNext} para premio</span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-600 rounded-lg border border-amber-200">
                  <span className="material-symbols-outlined text-[18px]">redeem</span>
                </div>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 my-2 px-4 py-3 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Iniciar Sesión
              </NavLink>
            )}

            {isAuthenticated && (role === 'admin' || (profile as any)?.role === 'admin' || profile?.email === 'admin@opinaplus.com') && (
              <div className="mx-4 mb-4 mt-2 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-2">
                <p className="px-3 pt-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">admin_panel_settings</span> Panel Admin</p>
                <div className="flex flex-col gap-1 mt-1">
                  <NavLink to="/admin/invitaciones" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                    Invitaciones
                  </NavLink>
                  <NavLink to="/admin/health" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                    Health Checks
                  </NavLink>
                  <NavLink to="/admin/antifraude" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">local_police</span>
                    Antifraude
                  </NavLink>
                  <NavLink to="/admin/modules-demand" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                    Demanda de Módulos
                  </NavLink>
                  <NavLink to="/admin/modules-priority" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">sort</span>
                    Prioridad de Módulos
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col relative w-full">
        {children}
      </main>

      {/* ✅ Floating Feedback (WhatsApp) */}
      {showFeedbackFab ? <FeedbackFab /> : null}

      <footer className="w-full border-t border-aurora-primary/10 bg-white/50 backdrop-blur-sm py-6 mt-auto">
        <div className="w-full px-4 sm:px-8 xl:px-12 mx-auto text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-2 opacity-60">
            <span className="material-symbols-rounded text-[16px]">gavel</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Legal & Compliance</span>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed max-w-2xl mx-auto">
            Opina+ es una plataforma independiente de opinión. Las marcas, productos y servicios mencionados
            pertenecen a sus respectivos dueños. Las comparaciones y resultados reflejan únicamente la
            opinión de los usuarios y no constituyen afirmaciones ni recomendaciones de Opina+.
          </p>

          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
            &copy; {new Date().getFullYear()} Opina+
          </p>
        </div>
      </footer>
    </div>
  );
}
