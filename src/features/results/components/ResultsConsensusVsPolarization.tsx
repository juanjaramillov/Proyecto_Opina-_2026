import { CheckCheck, SplitSquareHorizontal } from "lucide-react";

const consensus = [
  { label: "Marcas locales", value: 82, detail: "Consumo" },
  { label: "Trabajo remoto", value: 78, detail: "Preferencias" },
  { label: "Productos sustentables", value: 74, detail: "Productos" },
];

const polarization = [
  { label: "IA vs regulación", left: 50, right: 50, detail: "Actualidad" },
  { label: "Coca-Cola vs Pepsi", left: 52, right: 48, detail: "Versus" },
  { label: "Privacidad vs personalización", left: 49, right: 51, detail: "Tecnología" },
];

export function ResultsConsensusVsPolarization() {
  return (
    <section className="w-full py-8 md:py-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] border border-emerald-200 shadow-sm p-7 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">
                  Dónde hay más consenso
                </h3>
                <p className="text-sm text-slate-500">
                  Los temas con mayor alineación total.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {consensus.map((item) => (
                <div key={item.label} className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <div className="text-lg font-black text-slate-950">
                        {item.label}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {item.detail}
                      </div>
                    </div>
                    <div className="text-4xl font-black tracking-tight text-emerald-600">
                      {item.value}%
                    </div>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-rose-200 shadow-sm p-7 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <SplitSquareHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">
                  Dónde hay más polarización
                </h3>
                <p className="text-sm text-slate-500">
                  Las batallas más divididas hoy.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {polarization.map((item) => (
                <div key={item.label} className="rounded-2xl bg-rose-50/50 border border-rose-100 p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <div className="text-lg font-black text-slate-950">
                        {item.label}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {item.detail}
                      </div>
                    </div>
                    <div className="text-xl font-black tracking-tight text-slate-700">
                      {item.left}/{item.right}
                    </div>
                  </div>

                  <div className="flex h-3 bg-white rounded-full overflow-hidden gap-1">
                    <div
                      className="h-full rounded-l-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      style={{ width: `${item.left}%` }}
                    />
                    <div
                      className="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-orange-400"
                      style={{ width: `${item.right}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
