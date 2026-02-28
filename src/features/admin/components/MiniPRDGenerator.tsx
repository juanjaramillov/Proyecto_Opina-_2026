import React from 'react';

interface MiniPRDGeneratorProps {
    moduleKey: string;
    moduleName: string;
    metrics: {
        score: number;
        clicks: number;
        views: number;
        ctr: number;
    };
    onCopy: () => void;
}

const MiniPRDGenerator: React.FC<MiniPRDGeneratorProps> = ({ moduleKey, moduleName, metrics, onCopy }) => {
    const generatePRD = () => {
        const date = new Date().toLocaleDateString();
        return `
# Mini-PRD: Módulo ${moduleName}
**Estado:** Prioridad Alta (Score: ${metrics.score.toFixed(1)})
**Fecha Generación:** ${date}

## 1. Objetivo
Implementar el módulo "${moduleName}" para capturar señales específicas de los usuarios y enriquecer el grafo de inteligencia personal.

## 2. Tracción en Preview (Validación)
- **Vistas:** ${metrics.views}
- **Clicks de Interés:** ${metrics.clicks}
- **CTR:** ${metrics.ctr.toFixed(2)}%

## 3. Requisitos Funcionales
- Visualización de datos relevantes para "${moduleKey}".
- Interfaz de interacción rápida (Quick Actions).
- Integración con el sistema de recompensas (OpinaPoints).

## 4. Eventos de Señal (Tracking)
- \`${moduleKey}_viewed\`: Usuario entra al módulo.
- \`${moduleKey}_interaction\`: Usuario realiza una acción principal.
- \`${moduleKey}_feedback_shared\`: Usuario completa un flujo de opinión.

## 5. KPIs de Éxito
- **Conversión:** > 15% de usuarios que ven el módulo dejan una señal.
- **Retención:** 30% de usuarios regresan al módulo en < 7 días.

---
*Generado automáticamente por Opina+ Admin Roadmap.*
`.trim();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatePRD());
        onCopy();
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([generatePRD()], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `PRD_${moduleKey}_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">Generador de Mini-PRD</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                        Copiar MD
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 bg-primary-600 rounded-xl text-xs font-bold text-white hover:bg-primary-700 transition flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Descargar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 h-64 overflow-y-auto font-mono text-xs text-slate-600 whitespace-pre-wrap">
                {generatePRD()}
            </div>

            <p className="mt-4 text-[11px] text-slate-400 font-medium italic">
                Este PRD es una base técnica generada a partir de la tracción real observada en el módulo "Coming Soon".
            </p>
        </div>
    );
};

export default MiniPRDGenerator;
