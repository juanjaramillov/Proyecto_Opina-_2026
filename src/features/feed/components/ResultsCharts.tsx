import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import { ResultsData, FilterState } from './types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ResultsChartsProps {
    data: ResultsData;
    filters: FilterState;
}

const ResultsCharts: React.FC<ResultsChartsProps> = ({ data, filters }) => {
    const seriesData: ChartData<'line'> = {
        labels: data.series.map((_, i) => `T${i + 1}`),
        datasets: [{
            data: data.series,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.35,
            borderColor: '#14b8a6', // brand
            backgroundColor: 'rgba(20,184,166,0.1)'
        }]
    };

    const driversData: ChartData<'bar'> = {
        labels: data.drivers.map(d => d.label),
        datasets: [{
            data: data.drivers.map(d => d.v),
            borderWidth: 1,
            backgroundColor: 'rgba(124,255,234,0.6)',
            borderColor: 'rgba(124,255,234,1)'
        }]
    };

    const commonOptions: ChartOptions<'line' | 'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { display: false } }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {/* Chart 1 */}
            <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-3.5 relative overflow-hidden">
                <div className="absolute inset-[-1px] pointer-events-none opacity-90 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(560px_260px_at_18%_10%,rgba(20,184,166,.14),transparent_55%)]"></div>
                </div>
                <div className="relative z-10 flex justify-between gap-2.5 flex-wrap items-end">
                    <div>
                        <div className="font-black text-[15px] tracking-tight text-ink">Índice (serie de tiempo)</div>
                        <div className="text-muted font-semibold text-xs mt-1.5">Muestra evolución del indicador en la ventana seleccionada.</div>
                    </div>
                    <div className="text-muted2 text-xs font-bold">{filters.cat} · {filters.region} · {filters.age} · {filters.win}</div>
                </div>
                <div className="relative z-10 mt-2.5 h-[260px]">
                    <Line data={seriesData} options={commonOptions} />
                </div>
            </div>

            {/* Chart 2 */}
            <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-3.5 relative overflow-hidden">
                <div className="absolute inset-[-1px] pointer-events-none opacity-90 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(560px_260px_at_88%_15%,rgba(124,255,234,.10),transparent_58%)]"></div>
                </div>
                <div className="relative z-10 flex justify-between gap-2.5 flex-wrap items-end">
                    <div>
                        <div className="font-black text-[15px] tracking-tight text-ink">Drivers (contribución)</div>
                        <div className="text-muted font-semibold text-xs mt-1.5">Qué empuja el índice (percepción declarada).</div>
                    </div>
                    <div className="text-muted2 text-xs font-bold">Top 5</div>
                </div>
                <div className="relative z-10 mt-2.5 h-[260px]">
                    <Bar data={driversData} options={commonOptions} />
                </div>
            </div>
        </div>
    );
};

export default ResultsCharts;
