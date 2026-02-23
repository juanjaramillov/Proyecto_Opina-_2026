import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { SnapshotRow } from '../services/b2bAnalyticsService';

interface InsightsViewProps {
    data: SnapshotRow[];
}

const COLORS = ['#8A2BE2', '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#FF6666'];

export const InsightsView: React.FC<InsightsViewProps> = ({ data }) => {
    // 1. Top 5 Global/Filtered Votados
    const topVoted = useMemo(() => {
        // Agrupar por opción para sumar puntuaciones si hay múltiples filas por la misma opción
        const optionScores = data.reduce((acc, row) => {
            const key = row.option_label || row.option_id;
            if (!acc[key]) acc[key] = { name: key, votes: 0 };
            acc[key].votes += row.score;
            return acc;
        }, {} as Record<string, { name: string; votes: number }>);

        const scoresArray = Object.values(optionScores);
        scoresArray.sort((a, b) => b.votes - a.votes);
        return scoresArray.slice(0, 5); // Tomamos los Top 5
    }, [data]);

    // 2. Distribución de Segmentos
    const segmentsDist = useMemo(() => {
        // Agrupar por nombre de segmento (segment_hash)
        const segCounts = data.reduce((acc, row) => {
            const segName = row.segment_hash || 'Sin segmentar';
            if (!acc[segName]) acc[segName] = { name: segName, value: 0 };
            // Podríamos sumar score o signals_count, optamos por signals (volumen real de señales)
            acc[segName].value += row.signals_count;
            return acc;
        }, {} as Record<string, { name: string; value: number }>);

        return Object.values(segCounts).filter(item => item.value > 0);
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p>No hay datos suficientes para generar insights visuales con los filtros actuales.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* Gráfico 1: Top 5 Opciones */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top 5 Opciones Votadas</h3>
                <p className="text-sm text-gray-500 mb-6">Basado en el puntaje de opciones en los resultados filtrados.</p>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topVoted} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(138, 43, 226, 0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="votes" fill="#8A2BE2" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico 2: Distribución de Segmentos */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribución por Segmentos</h3>
                <p className="text-sm text-gray-500 mb-6">Volumen de participación basado en señales recibidas.</p>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={segmentsDist}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {segmentsDist.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};
