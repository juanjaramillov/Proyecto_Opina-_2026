import { NavLink, useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../features/auth";
import { useRole } from "../../hooks/useRole";
import { useSignalStore } from "../../store/signalStore";
import { MIN_SIGNALS_THRESHOLD } from "../../config/constants";
import FeedbackFab from "../ui/FeedbackFab";

const MENU_ITEMS = [
  { id: 'participa', label: 'Señales', route: '/experience' },
  { id: 'results', label: 'Resultados', route: '/results' },
  { id: 'intelligence', label: 'Inteligencia', route: '/intelligence-dashboard' },
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
  const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(false);
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
  const isAdmin = role === 'admin' || (profile as { role?: string })?.role === 'admin';

  const nextMilestone = Math.ceil((signals + 1) / 10) * 10;
  const toNext = nextMilestone - signals;
  const progressPercent = ((signals % 10) / 10) * 100;

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // ✅ Feedback WhatsApp: se oculta SOLO en pantallas activas de votación si se desea, 
  // Mostramos el FAB en todas las rutas (incluyendo admin) para feedback continuo
  const isVotingRoute = location.pathname.includes("/torneo") || location.pathname.includes("/versus");
  const showFeedbackFab = !isVotingRoute;

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen relative bg-white selection:bg-primary-500 selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/3"></div>
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-primary-600 focus:font-bold">Saltar al contenido</a>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm py-2' : 'bg-transparent border-b border-transparent py-4'}`}>
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
            className="sm:hidden p-2 text-slate-600 bg-white hover:bg-slate-50 hover:text-primary-600 active:scale-95 transition-all outline-none rounded-xl border border-slate-200 shadow-sm flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span className="material-symbols-outlined text-xl">
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
                      "text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-xl border border-transparent",
                      isActive ? "text-primary-600 bg-primary-50/80 border-primary-100 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200",
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
                className="flex items-center gap-1.5 ml-2 lg:ml-4 px-2 py-1.5 lg:px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm active:scale-95 group shrink-0 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-500 to-emerald-500 text-white flex items-center justify-center text-[10px] uppercase shadow-inner">
                  {isAdmin ? 'A' : (profile?.nickname || profile?.displayName || 'U').charAt(0)}
                </div>
                <span className="text-slate-800">{isAdmin ? 'Administrador' : (profile?.nickname || profile?.displayName || 'Usuario')}</span>
                <div className="flex flex-col gap-0.5 ml-2" title={`Faltan ${toNext} señales para tu próximo hito`}>
                  <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase text-primary-600 tracking-wider">
                    <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">star</span> Lvl</span>
                    <span>{toNext} left</span>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-brand rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </NavLink>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95 ml-4 flex items-center gap-2 relative z-[60]"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Entrar
              </Link>
            )}

            {/* ENLACES ADMINISTRACION */}
            {isAuthenticated && isAdmin && (
              <div className="relative ml-1 lg:ml-2 flex items-center h-full" ref={adminMenuRef}>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="px-3 py-1.5 rounded-full text-xs font-black transition-all bg-white text-ink hover:bg-surface2 flex items-center gap-1 active:scale-95 shadow-sm border border-stroke"
                >
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  Admin
                  <span className={`material-symbols-outlined text-[14px] transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <div className={`absolute top-full right-0 mt-2 p-2 w-56 bg-white border border-stroke rounded-[24px] shadow-2xl transition-all duration-300 z-[100] flex flex-col gap-1 ${isAdminMenuOpen ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-2 scale-95'}`}>
                  <div className="px-3 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Panel de Control</p>
                  </div>
                  <NavLink to="/admin/invitaciones" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                    Invitaciones
                  </NavLink>
                  <NavLink to="/admin/health" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                    Health Checks
                  </NavLink>
                  <NavLink to="/admin/antifraude" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">local_police</span>
                    Antifraude
                  </NavLink>
                  <NavLink to="/admin/actualidad" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">newspaper</span>
                    Actualidad
                  </NavLink>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl sm:hidden flex flex-col z-40 py-2 animate-in slide-in-from-top-2 duration-200">
            {MENU_ITEMS.map((item) => {
              const isLocked = item.id === 'results' && signals < MIN_SIGNALS_THRESHOLD;

              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between border-b border-slate-100 last:border-0 ${isActive ? "text-primary-600 bg-primary-50/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
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
                className="mx-4 mt-2 mb-2 px-4 py-3 text-sm font-bold text-slate-900 transition-colors flex items-center justify-between rounded-xl bg-white border border-slate-200 shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-emerald-500 text-white flex items-center justify-center text-[12px] uppercase shadow-inner">
                    {isAdmin ? 'A' : (profile?.nickname || profile?.displayName || 'U').charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{isAdmin ? 'Administrador' : (profile?.nickname || profile?.displayName || 'Mi Perfil')}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-brand rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">{toNext} left</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded-lg border border-primary-100">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 my-2 px-4 py-3 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Entrar
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <div className="mx-4 mb-4 mt-2 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsMobileAdminOpen(!isMobileAdminOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between text-slate-700 hover:bg-white transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary-500">admin_panel_settings</span>
                    Panel Admin
                  </span>
                  <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isMobileAdminOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isMobileAdminOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="flex flex-col gap-1 p-2 bg-white/50 border-t border-slate-100">
                    <NavLink to="/admin/invitaciones" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                      Invitaciones
                    </NavLink>
                    <NavLink to="/admin/health" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                      Health Checks
                    </NavLink>
                    <NavLink to="/admin/antifraude" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[16px]">local_police</span>
                      Antifraude
                    </NavLink>
                    <NavLink to="/admin/actualidad" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[16px]">newspaper</span>
                      Actualidad
                    </NavLink>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col relative w-full z-10">
        {children}
      </main>

      {/* ✅ Floating Feedback (WhatsApp) */}
      {showFeedbackFab ? <FeedbackFab /> : null}

      <footer className="w-full border-t border-slate-200 bg-white/50 backdrop-blur-sm py-6 mt-auto">
        <div className="w-full px-4 sm:px-8 xl:px-12 mx-auto text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-2 opacity-60">
            <span className="material-symbols-rounded text-[16px] text-slate-400">gavel</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Legal</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Opina+ muestra tendencias agregadas. No es asesoría, no es verdad absoluta. Es señal.
          </p>

          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
            &copy; {new Date().getFullYear()} Opina+
          </p>
        </div>
      </footer>
    </div>
  );
}
