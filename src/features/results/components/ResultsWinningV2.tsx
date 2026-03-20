export function ResultsWinningV2() {
  const ranking = [
    { category: 'Política y Sociedad', leader: 'Posturas Pragmáticas', status: 'Sube rápido', icon: 'north_east', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { category: 'Conocimiento y Tecnología', leader: 'Exigencia de Regulación', status: 'Estable', icon: 'east', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { category: 'Hábitos y Consumo', leader: 'Economía Circular', status: 'Subiendo', icon: 'north_east', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { category: 'Estilo de Vida', leader: 'Hiper-conexión', status: 'A la baja', icon: 'south_east', color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <section className="w-full bg-white py-16 md:py-24 border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Qué está ganando hoy</h2>
            <p className="mt-2 text-slate-500 font-medium">Las narrativas que dominan cada territorio en tiempo real.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Actualizado hoy
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ranking.map((item, idx) => (
            <div key={idx} className="bg-slate-50 rounded-3xl p-7 md:p-8 border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                {item.category}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-6 flex-grow">
                {item.leader}
              </h3>
              
              <div className="flex items-center gap-2 mt-auto">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                  <span className="material-symbols-outlined text-[18px] font-bold">{item.icon}</span>
                </div>
                <span className={`text-sm font-bold ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
