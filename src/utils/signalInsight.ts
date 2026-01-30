export type SignalInsight =
  | { kind: 'majority'; text: string }
  | { kind: 'minority'; text: string }
  | { kind: 'balanced'; text: string }
  | { kind: 'unknown'; text: string };

export function getSignalInsight(params: {
  myPct?: number;
  majorityThreshold?: number;
  minorityThreshold?: number;
}): SignalInsight {
  const myPct = params.myPct ?? 50;
  const majorityThreshold = params.majorityThreshold ?? 62;
  const minorityThreshold = params.minorityThreshold ?? 38;

  if (typeof myPct !== 'number' || Number.isNaN(myPct)) {
    return { kind: 'unknown', text: 'Sin datos suficientes para estimar tu posición.' };
  }

  if (myPct >= majorityThreshold) {
    return { kind: 'majority', text: 'Estás alineado con la mayoría en este tema.' };
  }

  if (myPct <= minorityThreshold) {
    return { kind: 'minority', text: 'Tu postura es minoritaria en este tema.' };
  }

  return { kind: 'balanced', text: 'Tu postura está bastante balanceada respecto al resto.' };
}
