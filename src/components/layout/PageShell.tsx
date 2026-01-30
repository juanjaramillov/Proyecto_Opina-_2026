import { NavLink } from "react-router-dom";
import { useDemoData } from "../../demo/DemoContext";
import { useAccountProfile } from "../../auth/useAccountProfile";


type NavItem = {
  path: string;
  label: string;
  primary?: boolean;
};

const NAV: NavItem[] = [
  { path: "/about", label: "Nosotros" },
  { path: "/senales", label: "Señales" },
  { path: "/radiografias", label: "Radiografías" },
];

export default function PageShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useDemoData();
  const { profile } = useAccountProfile();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 border-b border-stroke bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group hover:opacity-90 transition">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1">
                <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">Opina+</span>
          </NavLink>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV.map((it) => (
              <NavLink
                key={it.path}
                to={it.path}
                className={({ isActive }) =>
                  [
                    "text-sm font-bold transition-colors",
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900",
                  ].join(" ")
                }
              >
                {it.label}
              </NavLink>
            ))}

            {profile?.canExport && (
              <NavLink
                to="/enterprise"
                className={({ isActive }) =>
                  [
                    "text-sm font-bold transition-colors",
                    isActive ? "text-indigo-600" : "text-indigo-500 hover:text-indigo-700",
                  ].join(" ")
                }
              >
                Empresas
              </NavLink>
            )}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3 ml-auto">
            {currentUser ? (
              <NavLink
                to="/profile"
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-stroke bg-slate-50 pl-3 pr-4 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                {currentUser.name}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:opacity-90 transition"
              >
                Ingresar
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Menos aire vertical global */}
      <main className="mx-auto max-w-5xl px-4 py-4 space-y-4 md:px-6 md:py-6 md:space-y-6">
        {children}
      </main>

      <footer className="border-t border-stroke bg-white py-6 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-2">
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
