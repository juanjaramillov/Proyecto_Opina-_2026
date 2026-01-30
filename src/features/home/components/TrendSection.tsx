import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const getTrendOptions = (): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
        x: { grid: { display: false } },
        y: { grid: { display: false } }
    }
});

const trendData: ChartData<'line'> = {
    labels: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
    datasets: [{
        data: [54, 55, 54, 56, 57, 56, 57, 58, 58, 59],
        borderColor: '#4F46E5', // Indigo 600
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35
    }]
};

const TrendSection: React.FC = () => {
    return (
        <section className="py-5 pb-16" id="tendencias">
            <div className="max-w-ws mx-auto px-5">
                <div className="flex items-end justify-between gap-3 mb-3">
                    <h2 className="m-0 text-base tracking-wide text-muted">Tendencias (demo)</h2>
                    <div className="text-xs font-semibold text-muted2">Vista simple, fácil de entender</div>
                </div>

                <div className="rounded-2xl border border-stroke bg-white shadow-sm p-4 pb-4 md:p-5 md:pb-5 overflow-hidden relative">
                    <div className="absolute inset-[-1px] pointer-events-none z-0 opacity-40">
                        <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_20%_10%,rgba(79,70,229,0.05),transparent_60%)]"></div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between gap-2.5">
                        <div>
                            <p className="text-lg font-black m-0 tracking-tight text-ink">Índice de Confianza (demo)</p>
                            <p className="text-xs leading-relaxed mt-1.5 font-semibold text-muted">Serie de tiempo ficticia para ver el estilo.</p>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1.5 rounded-full border bg-white/5 whitespace-nowrap border-warn/25 text-warn/95">Estable</span>
                    </div>
                    <div className="mt-2.5 h-[220px] relative z-10">
                        <Line data={trendData} options={getTrendOptions()} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrendSection;
