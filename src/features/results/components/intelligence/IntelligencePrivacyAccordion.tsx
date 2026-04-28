import { useState } from 'react';
import { GradientText } from '../../../../components/ui/foundation';

interface PrivacyItem {
  icon: string;
  title: string;
  summary: string;
  detail: string;
}

const ITEMS: PrivacyItem[] = [
  {
    icon: 'shield_person',
    title: 'Anonimización con k-anonymity (k ≥ 50)',
    summary: 'Ninguna respuesta individual sale al producto. Cell-suppression para combinaciones demo+geo+battle.',
    detail:
      'Toda métrica expuesta agrega como mínimo 50 usuarios distintos con la misma combinación de atributos. Cuando una combinación cae bajo el umbral, la celda se suprime automáticamente y el cliente recibe NULL en vez del dato. Esto previene reidentificación incluso cruzando con bases externas (quasi-identifier attacks). Patrón documentado y aplicado por Apple Differential Privacy y Google Aggregated APIs.',
  },
  {
    icon: 'block',
    title: 'Sin políticos ni actualidad',
    summary: 'Decisión de producto: data política, candidatos, gobiernos y eventos noticiosos NO se venden.',
    detail:
      'El catálogo comercializable se filtra contra una flag explícita commercial_status. Cualquier categoría o entidad nueva entra como pending_review (opt-in seguro) y requiere curaduría humana antes de exponerse. La tabla current_topics (actualidad) queda fuera del producto B2B por design. Los conceptos de bienestar personal (felicidad, estrés, etc.) tampoco se venden.',
  },
  {
    icon: 'gavel',
    title: 'Cumplimiento legal — Chile y Argentina',
    summary: 'Ley 21.719 (CL, vigencia plena 2026), Ley 25.326 (AR) y GDPR si el cliente es europeo.',
    detail:
      'Cada usuario que vota en Opina+ acepta explícitamente el uso comercial agregado de sus señales en el flujo de registro. La política de privacidad se actualiza con cada cambio de finalidad y notifica a los usuarios. El cliente B2B firma un Data Processing Agreement (DPA) que define responsabilidades de tratamiento. Para clientes con presencia europea ofrecemos cláusulas SCC + adendum DPA específico.',
  },
  {
    icon: 'fact_check',
    title: 'Auditoría completa de qué dato sale a quién',
    summary: 'Cada call queda registrado: cliente, endpoint, parámetros, hora, hash de respuesta.',
    detail:
      'El log de tráfico B2B (admin_audit_log + b2b_api_log) permite responder en minutos a preguntas tipo "qué le entregamos a fulano en marzo". Los exports CSV/Parquet llevan un watermark numérico distinto por cliente para detectar filtraciones. El cliente puede solicitar su propio audit trail vía API. Retención de logs: 24 meses.',
  },
];

/**
 * Acordeón con los 4 ítems de privacidad y compliance.
 * Sección visible en la landing pública para dar confianza a prospectos B2B.
 */
export function IntelligencePrivacyAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="card p-8 md:p-12 border-none shadow-lg bg-white">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-accent font-bold uppercase tracking-widest text-xs mb-3 block">
          Privacidad & compliance
        </span>
        <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-4">
          Cómo <GradientText>protegemos</GradientText> los datos
        </h2>
        <p className="text-slate-600 font-medium text-lg">
          Lo que vendemos es lectura agregada, defendible legal y técnicamente. Cero respuestas individuales.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={item.title}
              className={`border rounded-2xl transition-all ${
                isOpen ? 'border-brand shadow-md' : 'border-stroke'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-start gap-4"
                aria-expanded={isOpen}
              >
                <span className={`material-symbols-outlined text-[24px] mt-0.5 ${isOpen ? 'text-brand' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className="font-black text-ink text-base leading-tight">{item.title}</div>
                  <div className="text-sm text-slate-600 font-medium mt-1 leading-snug">{item.summary}</div>
                </div>
                <span className={`material-symbols-outlined text-slate-400 text-[20px] mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pl-[60px]">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed border-l-2 border-brand/30 pl-4">
                    {item.detail}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 italic mt-8 text-center font-medium max-w-2xl mx-auto">
        Más detalles legales y técnicos disponibles en el DPA bajo NDA durante el proceso de cotización.
      </p>
    </section>
  );
}
