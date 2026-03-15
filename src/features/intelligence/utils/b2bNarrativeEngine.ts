import { B2BEligibility, B2BBattleAnalytics, IntegrityFlags } from "../../signals/services/insightsService";

export interface NarrativeBullet {
    type: 'critical' | 'warning' | 'positive' | 'neutral';
    text: string;
}

export function generateB2BNarrative(
    eligibility?: B2BEligibility | null,
    analytics?: B2BBattleAnalytics | null,
    integrity?: IntegrityFlags | null
): NarrativeBullet[] {
    const bullets: NarrativeBullet[] = [];

    if (!eligibility) {
        bullets.push({ type: 'warning', text: 'Datos insuficientes para generar narrativa ejecutiva.' });
        return bullets;
    }

    // 1. Veredicto de Status (Elegibilidad)
    if (eligibility.eligibility_status === 'PUBLISHABLE') {
        bullets.push({ 
            type: 'positive', 
            text: `El OpinaScore de ${Math.round(eligibility.opinascore_value || 0)} es estadísticamente robusto y apto para consumo comercial abierto.` 
        });
    } else if (eligibility.eligibility_status === 'EXPLORATORY') {
        bullets.push({ 
            type: 'warning', 
            text: `Contexto volátil. La data se clasifica como exploratoria debido a: ${eligibility.eligibility_reasons?.join(', ') || 'factores de inestabilidad'}.` 
        });
    } else {
        bullets.push({ 
            type: 'critical', 
            text: `Riesgo analítico severo. Bloqueo interno activado por: ${eligibility.eligibility_reasons?.join(', ') || 'integridad comprometida o falta de muestra'}. NO utilizar para decisiones B2B externas.` 
        });
    }

    // 2. Comportamiento Competitivo (Versus vs News/Depth)
    if (eligibility.opinascore_context === 'versus' && analytics?.analytics_payload?.length) {
        const isTie = analytics.analytics_payload[0]?.technical_tie_flag;
        const leader = analytics.analytics_payload[0];
        
        if (isTie) {
            bullets.push({
                type: 'warning',
                text: `Escenario altamente competitivo: existe un Empate Técnico. El límite superior de confianza del segundo lugar solapa matemáticamente con el piso del líder.`
            });
        } else if (leader && leader.is_winner) {
            const winRate = Math.round((leader.normalized_score || leader.raw_win_rate || 0) * 100);
            bullets.push({
                type: 'positive',
                text: `Liderazgo establecido. La Opción 1 domina con el ${winRate}% de preferencia efectiva, superando el margen de error estadístico (Límite inferior de Wilson: ${Math.round((leader.lower_bound || 0) * 100)}%).`
            });
        }
    }

    // 3. Estructura y Entropía (News/Topics)
    if (eligibility.opinascore_context === 'news' && eligibility.entropy_normalized !== undefined && eligibility.entropy_normalized !== null) {
        const entropy = eligibility.entropy_normalized;
        if (entropy > 0.8) {
            bullets.push({ type: 'warning', text: `Alta fragmentación de la audiencia (Entropía: ${entropy.toFixed(2)}). No existe consenso claro en la percepción de este tema.` });
        } else if (entropy < 0.4) {
            bullets.push({ type: 'positive', text: `Consenso sólido (Entropía: ${entropy.toFixed(2)}). La audiencia presenta una postura altamente unificada (baja dispersión).` });
        } else {
            bullets.push({ type: 'neutral', text: `División moderada (Entropía: ${entropy.toFixed(2)}). El tema genera visiones contrapuestas pero sin llegar a la fragmentación total.` });
        }
    }

    // 4. Estabilidad Constante (Depth/Brands)
    if (eligibility.opinascore_context === 'depth' && eligibility.stability_label) {
        bullets.push({
            type: 'neutral',
            text: `El estadío actual de la opinión pública se clasifica como: ${eligibility.stability_label}.`
        });
    }

    // 5. Integridad y Confianza Muestral
    if (integrity && integrity.integrity_score < 100) {
        let msg = `Integridad del pool al ${Math.round(integrity.integrity_score)}%. `;
        const anomalies = [];
        if (integrity.flag_device_concentration) anomalies.push('concentración anómala de dispositivos (posible botting)');
        if (integrity.flag_velocity_burst) anomalies.push('ráfagas antinaturales de velocidad');
        if (integrity.flag_repetitive_pattern) anomalies.push('rutinas repetitivas idénticas detectadas');
        
        if (anomalies.length > 0) {
            msg += `La métrica ha sido penalizada por ${anomalies.join(' y ')}.`;
            bullets.push({ type: 'critical', text: msg });
        }
    } else if (eligibility.integrity_multiplier === 1) {
         bullets.push({ type: 'positive', text: `Ecosistema sano. 100% libre de manipulación robótica o ráfagas anómalas (Penalizaciones: 0).` });
    }

    return bullets;
}
