import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../features/auth";
import { useRole } from "../../hooks/useRole";
import { useSignalStore } from "../../store/signalStore";
import { MIN_SIGNALS_THRESHOLD } from "../../config/constants";
import { getUserLevel } from "../../lib/levelSystem";

const MENU_ITEMS = [
  { id: 'participa', label: 'Participa', route: '/experience' },
  { id: 'results', label: 'Resultados', route: '/results' },
  { id: 'rankings', label: 'Rankings', route: '/rankings' },
  { id: 'profile', label: 'Perfil', route: '/profile' },
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
  const location = useLocation();

  const isAuthenticated = profile && profile.tier !== 'guest';

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen relative">
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

            {/* Gamification Badge - Only show to authenticated users */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-start justify-center pr-1 sm:pr-2">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Lvl</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700 leading-none">{getUserLevel(signals).level}</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 text-slate-600 hover:text-primary transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-4 justify-end">
            {MENU_ITEMS.map((item) => {
              if (item.id === 'profile' && !isAuthenticated) return null;
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

            {/* ENLACE CORPORATIVO */}
            {isAuthenticated && (role === 'b2b' || role === 'admin') && (
              <NavLink
                to="/b2b-dashboard"
                className={({ isActive }) =>
                  `px-3 py-1.5 ml-2 rounded-lg text-xs font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`
                }
              >
                B2B Console
              </NavLink>
            )}
            {!isAuthenticated && (
              <NavLink
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 ml-2"
              >
                Unirme / Iniciar Sesión
              </NavLink>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg sm:hidden flex flex-col z-40 py-2 animate-in slide-in-from-top-2 duration-200">
            {MENU_ITEMS.map((item) => {
              if (item.id === 'profile' && !isAuthenticated) return null;
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

            {isAuthenticated && (role === 'b2b' || role === 'admin') && (
              <NavLink
                to="/b2b-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 my-2 px-4 py-2 text-center rounded-lg text-sm font-black bg-indigo-50 text-indigo-700"
              >
                B2B Console
              </NavLink>
            )}
            {!isAuthenticated && (
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-4 my-2 px-4 py-3 bg-indigo-600 text-white text-center rounded-xl text-sm font-bold shadow-md"
              >
                Unirme / Iniciar Sesión
              </NavLink>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col relative w-full">
        {children}
      </main>

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
