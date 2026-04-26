import { TemporalMovieRow } from '../services/kpiService';

export const generateMockTemporalData = (): TemporalMovieRow[] => {
  // Generamos un historial de éxito de 5 semanas para una opción simulada "Marca A"
  // Empieza con 25%, sube a 28%, 34%, 42% y estabiliza en 45%.
  const now = new Date();
  const mockData: TemporalMovieRow[] = [];
  
  const shares = [25.0, 28.5, 34.0, 42.0, 45.0];
  const optionId = 'mock-option-a';
  
  for (let i = 0; i < shares.length; i++) {
    const share = shares[i];
    const prevShare = i > 0 ? shares[i - 1] : share;
    const tendencia = share - prevShare;
    
    // Aceleración: tendencia actual - tendencia anterior
    const prevTendencia = i > 1 ? shares[i - 1] - shares[i - 2] : 0;
    const aceleracion = i > 0 ? tendencia - prevTendencia : 0;

    // Persistencia: número de subidas consecutivas
    let persistencia = 0;
    if (tendencia > 0) {
      persistencia = 1;
      for (let j = i - 1; j > 0; j--) {
        if (shares[j] - shares[j - 1] > 0) persistencia++;
        else break;
      }
    } else if (tendencia < 0) {
      persistencia = 1;
      for (let j = i - 1; j > 0; j--) {
        if (shares[j] - shares[j - 1] < 0) persistencia++;
        else break;
      }
    }

    const bucketDate = new Date(now);
    bucketDate.setDate(now.getDate() - ((shares.length - 1 - i) * 7));

    mockData.push({
      time_bucket: bucketDate.toISOString(),
      option_id: optionId,
      option_label: 'Marca A',
      n_eff: 150 + Math.floor(Math.random() * 50),
      share_pct: share,
      tendencia: Number(tendencia.toFixed(2)),
      aceleracion: Number(aceleracion.toFixed(2)),
      volatilidad: Number((Math.random() * 2 + 1).toFixed(2)), // mock volatility
      persistencia,
    });
  }

  // Ordenar de más nuevo a más antiguo, tal cual lo devolvería el RPC
  return mockData.reverse();
};
