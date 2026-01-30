import { Link } from 'react-router-dom';

interface Props {
  isUser: boolean;
}

const LiveSignalHeader: React.FC<Props> = ({ isUser }) => {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Señal en Vivo</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Señales activas <span className="text-slate-300 font-medium text-lg ml-2">(demo visual)</span>
        </h1>
        <div className="mt-2 text-sm text-slate-500 max-w-3xl leading-relaxed">
          Ves <b>Total</b>, <b>Tú</b> y puedes comparar contra un <b>segmento</b>.
        </div>
      </div>

      <div className="flex gap-2.5 items-center flex-wrap">
        <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
          Actualiza cada 60s
        </div>

        {isUser ? (
          <Link
            to="/mi-senal"
            className="inline-flex items-center text-xs px-3 py-2 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Conectado: mostrando “Tú”
          </Link>
        ) : (
          <Link
            to="/verificacion"
            className="inline-flex items-center text-xs px-3 py-2 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Conéctate para ver “Tú”
          </Link>
        )}
      </div>
    </div>
  );
};

export default LiveSignalHeader;
