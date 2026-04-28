import { useState } from 'react';
import { GradientCTA, GradientText } from '../../../../components/ui/foundation';

type Lang = 'curl' | 'python' | 'typescript';

const SNIPPETS: Record<Lang, string> = {
  curl: `curl -X GET "https://api.opinamas.app/v1/categories/telefonia-movil/leaderboard" \\
  -H "Authorization: Bearer sk_live_••••••••••••••••" \\
  -H "Accept: application/json"`,

  python: `import requests

resp = requests.get(
    "https://api.opinamas.app/v1/categories/telefonia-movil/leaderboard",
    headers={"Authorization": "Bearer sk_live_••••••••••••••••"},
)
data = resp.json()  # → opinascore, wilson_ci, n_eff, share_ponderado…`,

  typescript: `import { OpinaClient } from "@opina/sdk";

const opina = new OpinaClient({ apiKey: process.env.OPINA_API_KEY });
const board = await opina.categories.leaderboard("telefonia-movil");
console.log(board.opinascore, board.wilson_ci);`,
};

const LANGS: { id: Lang; label: string }[] = [
  { id: 'curl',       label: 'curl' },
  { id: 'python',     label: 'Python' },
  { id: 'typescript', label: 'TypeScript' },
];

interface Props {
  onRequestEarlyAccess: () => void;
}

/**
 * Sección "Acceso programático" — stub público.
 * No hay backend real todavía; el snippet es ilustrativo del shape esperado del v1.
 */
export function IntelligenceAPIAccessStub({ onRequestEarlyAccess }: Props) {
  const [activeLang, setActiveLang] = useState<Lang>('curl');

  return (
    <section className="card p-8 md:p-12 border-none shadow-lg bg-gradient-to-br from-ink to-slate-800 text-white relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* COLUMNA IZQUIERDA: copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/90 mb-6">
            <span className="material-symbols-outlined text-[14px]">terminal</span>
            Acceso programático
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
            Para equipos técnicos: <GradientText>API REST</GradientText>
          </h2>

          <p className="text-white/70 font-medium text-base leading-relaxed mb-6 max-w-md">
            Integrá Opina+ Intelligence a tu data warehouse, dashboards internos o flujos de decisión.
            REST + JSON, autenticación por API key, rate limit por tier.
          </p>

          <ul className="space-y-3 mb-8">
            {[
              { icon: 'lock', text: 'Auth con API keys (sandbox + live)' },
              { icon: 'speed', text: 'Cache + rate limit por tier' },
              { icon: 'webhook', text: 'Webhooks para alertas en tiempo real' },
              { icon: 'description', text: 'OpenAPI 3 spec + SDKs oficiales' },
            ].map(item => (
              <li key={item.icon} className="flex items-center gap-3 text-sm text-white/80 font-medium">
                <span className="material-symbols-outlined text-[18px] text-white/50">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-accent/20 text-accent border border-accent/30 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
              Disponible Q3 2026
            </span>
            <span className="text-white/50 text-xs font-medium">
              Sumate a la waitlist para acceso anticipado
            </span>
          </div>

          <GradientCTA
            label="Solicitar acceso anticipado"
            icon="arrow_forward"
            iconPosition="trailing"
            size="md"
            onClick={onRequestEarlyAccess}
          />
        </div>

        {/* COLUMNA DERECHA: code snippet */}
        <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-4 border-b border-white/10">
            {LANGS.map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLang(l.id)}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
                  activeLang === l.id
                    ? 'bg-white/10 text-white border-b-2 border-brand'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {l.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => navigator.clipboard?.writeText(SNIPPETS[activeLang])}
              className="text-white/40 hover:text-white text-xs font-bold flex items-center gap-1 px-2 py-1 mb-2"
              title="Copiar al portapapeles"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              copiar
            </button>
          </div>

          {/* Code */}
          <pre className="p-5 text-xs font-mono text-white/90 leading-relaxed overflow-x-auto">
            <code>{SNIPPETS[activeLang]}</code>
          </pre>

          {/* Footer hint */}
          <div className="px-5 pb-4 text-[10px] text-white/40 font-mono">
            // Ejemplo ilustrativo del shape v1. Spec final disponible en docs.opina.com (Q3 2026).
          </div>
        </div>
      </div>
    </section>
  );
}
