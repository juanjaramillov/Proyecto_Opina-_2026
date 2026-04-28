import { NavLink, useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../features/auth";
import { useAuthContext } from "../../features/auth/context/AuthContext";
import { useSignalStore } from "../../store/signalStore";
import { MIN_SIGNALS_THRESHOLD } from "../../config/constants";
import FeedbackFab from "../ui/FeedbackFab";

const MENU_ITEMS = [
  { id: 'participa', label: 'Señales', route: '/signals' },
  { id: 'results', label: 'Resultados', route: '/results' },
  { id: 'intelligence', label: 'Inteligencia', route: '/b2b' },
  { id: 'about', label: 'Nosotros', route: '/about' },
];


export default function PageShell({ children }: { children: React.ReactNode }) {
  // Simplified user check logic, relying on profile or extending later
  const { profile } = useAuth();
  const { accessState } = useAuthContext();
  const role = accessState.role;
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

  // ✅ Feedback WhatsApp: se oculta SOLO en pantallas activas de participación/señales si se desea, 
  // Mostramos el FAB en todas las rutas (incluyendo admin) para feedback continuo
  const isVotingRoute = location.pathname.includes("/torneo") || location.pathname.includes("/versus");
  const showFeedbackFab = !isVotingRoute;

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen relative bg-white selection:bg-brand selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-y-1/3"></div>
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-brand focus:font-bold">Saltar al contenido</a>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm py-2' : 'bg-transparent border-b border-transparent py-4'}`}>
        <div className="w-full px-4 sm:px-8 xl:px-12 flex items-center justify-between gap-4">

          {/* Logo & Level (Left side) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NavLink to="/" className="flex items-center gap-2 group hover:opacity-90 transition" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-brand/20 transition-transform duration-300 group-hover:scale-105">
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
            className="lg:hidden p-2 text-slate-600 bg-white hover:bg-slate-50 hover:text-brand active:scale-95 transition-all outline-none rounded-xl border border-slate-200 shadow-sm flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span className="material-symbols-outlined text-xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 justify-end flex-nowrap">
            {/* Desktop Menu Mapping */}
            {MENU_ITEMS.map((item) => {
              const isResultsLocked = item.id === 'results' && signals < MIN_SIGNALS_THRESHOLD;
              const isB2BLocked = item.id === 'intelligence' && role !== 'admin' && role !== 'b2b';
              const isLocked = isResultsLocked || isB2BLocked;

              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  className={({ isActive }) =>
                    [
                      "text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-xl border border-transparent",
                      isActive ? "text-brand bg-brand-50/80 border-brand/20 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-200",
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
                aria-label="Acceder a mi perfil de usuario"
                className="flex items-center gap-1.5 ml-2 lg:ml-4 px-2 py-1.5 lg:px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm active:scale-95 group shrink-0 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand to-accent text-white flex items-center justify-center text-[10px] uppercase shadow-inner">
                  {isAdmin ? 'A' : (profile?.nickname || profile?.displayName || 'U').charAt(0)}
                </div>
                <span className="text-slate-800">{isAdmin ? 'Administrador' : (profile?.nickname || profile?.displayName || 'Usuario')}</span>
                <div className="flex flex-col gap-0.5 ml-2" title={`Faltan ${toNext} señales para tu próximo hito`}>
                  <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase text-brand tracking-wider">
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
                className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold shadow-md hover:bg-brand hover:shadow-lg transition-all active:scale-95 ml-4 flex items-center gap-2 relative z-[60]"
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
                  aria-label="Abrir panel de administración"
                  aria-expanded={isAdminMenuOpen}
                  className="px-3 py-1.5 rounded-full text-xs font-black transition-all bg-white text-ink hover:bg-surface2 flex items-center gap-1 active:scale-95 shadow-sm border border-stroke"
                >
                  <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                  Admin
                  <span className={`material-symbols-outlined text-[14px] transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <div className={`absolute top-full right-0 mt-2 p-2 w-56 bg-white border border-stroke rounded-3xl shadow-2xl transition-all duration-300 z-[100] flex flex-col gap-1 ${isAdminMenuOpen ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-2 scale-95'}`}>
                  <div className="px-3 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Panel de Control</p>
                  </div>
                  <NavLink to="/admin/analytics" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">monitoring</span>
                    Analytics & Rendimiento
                  </NavLink>
                  <NavLink to="/admin/users-community" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    Usuarios & Comunidad
                  </NavLink>
                  <NavLink to="/admin/content" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">newspaper</span>
                    Catálogo y Contenido
                  </NavLink>
                  <NavLink to="/admin/security" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">shield</span>
                    Seguridad & Operaciones
                  </NavLink>
                  <NavLink to="/admin/demo" onClick={() => setIsAdminMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 text-xs font-bold transition-all flex items-center gap-2 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-surface2 hover:text-ink'}`}>
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    Pilot Launchpad
                  </NavLink>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Dropdown/Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[72px] bg-white z-40 lg:hidden flex flex-col overflow-y-auto animate-in slide-in-from-top-2 duration-200 pb-20">
            {MENU_ITEMS.map((item) => {
              const isResultsLocked = item.id === 'results' && signals < MIN_SIGNALS_THRESHOLD;
              const isB2BLocked = item.id === 'intelligence' && role !== 'admin' && role !== 'b2b';
              const isLocked = isResultsLocked || isB2BLocked;

              return (
                <NavLink
                  key={item.id}
                  to={item.route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-6 py-4 text-base font-bold transition-colors flex items-center justify-between border-b border-slate-100 last:border-0 ${isActive ? "text-brand bg-brand-50/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`
                  }
                >
                  <div className="flex items-center gap-3">
                    {item.label}
                    {isLocked && <span className="material-symbols-outlined text-[16px] opacity-50">lock</span>}
                  </div>
                  <span className="material-symbols-outlined text-base opacity-50">chevron_right</span>
                </NavLink>
              )
            })}

            {isAuthenticated ? (
              <NavLink
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 mt-6 mb-2 px-4 py-4 text-base font-bold text-slate-900 transition-colors flex items-center justify-between rounded-xl bg-white border border-slate-200 shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-accent text-white flex items-center justify-center text-[14px] uppercase shadow-inner">
                    {isAdmin ? 'A' : (profile?.nickname || profile?.displayName || 'U').charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black text-slate-900">{isAdmin ? 'Administrador' : (profile?.nickname || profile?.displayName || 'Mi Perfil')}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-brand rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{toNext} left</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 bg-brand/10 text-brand rounded-lg border border-brand/20">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 my-6 px-4 py-4 flex items-center justify-center gap-2 bg-brand text-white rounded-xl text-base font-bold shadow-md hover:bg-brand transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                Entrar
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <div className="mx-4 mb-8 mt-4 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsMobileAdminOpen(!isMobileAdminOpen)}
                  className="w-full px-4 py-4 flex items-center justify-between text-slate-700 hover:bg-white transition-colors"
                >
                  <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-brand">admin_panel_settings</span>
                    Panel Admin
                  </span>
                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isMobileAdminOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isMobileAdminOpen ? 'max-h-[800px] opacity-100 scrollbar-hide overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="flex flex-col gap-1 p-2 bg-white/50 border-t border-slate-100">
                    <NavLink to="/admin/analytics" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[18px]">monitoring</span>
                      Analytics & Rendimiento
                    </NavLink>
                    <NavLink to="/admin/users-community" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      Usuarios & Comunidad
                    </NavLink>
                    <NavLink to="/admin/content" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[18px]">newspaper</span>
                      Catálogo y Contenido
                    </NavLink>
                    <NavLink to="/admin/security" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[18px]">shield</span>
                      Seguridad & Operaciones
                    </NavLink>
                    <NavLink to="/admin/demo" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold transition-colors flex items-center gap-3 rounded-xl active:scale-95 ${isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                      Pilot Launchpad
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
        <div className="w-full px-4 sm:px-8 xl:px-12 mx-auto text-center space-y-3">
          <div className="flex justify-center items-center gap-2 mb-2 opacity-60">
            <span className="material-symbols-rounded text-[16px] text-slate-400">gavel</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Legal y Privacidad</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
            Opina+ consolida señales estadísticas, no asesoría ni verdades absolutas. 
            Las marcas y logotipos exhibidos tienen fines estrictamente referenciales 
            y comparativos dentro del contexto de percepción ciudadana, sin implicar 
            afiliación, patrocinio ni respaldo por parte de sus titulares.
          </p>

          <div className="flex justify-center items-center gap-4 text-[11px] font-bold text-slate-600 uppercase mt-4 mb-2">
            <NavLink to="/privacy" className="hover:text-brand transition-colors">Privacidad</NavLink>
            <span className="text-slate-300">•</span>
            <NavLink to="/terms" className="hover:text-brand transition-colors">Términos de Uso</NavLink>
          </div>

          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold pt-2">
            &copy; {new Date().getFullYear()} Opina+ Pilot Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
