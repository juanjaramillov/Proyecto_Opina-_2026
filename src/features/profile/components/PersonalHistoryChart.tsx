import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PersonalHistoryPoint } from '../services/profileService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Props {
    data: PersonalHistoryPoint[];
}

const PersonalHistoryChart: React.FC<Props> = ({ data }) => {
    // Sort by date just in case
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Aggregate by day or just show points if they are few
    const labels = sortedData.map(d => new Date(d.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }));
    const scores = sortedData.map(d => d.avg_score);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Valoración Media',
                data: scores,
                borderColor: '#6366f1', // primary-500
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { size: 12, weight: 'bold' as const },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 10, weight: 'bold' as const },
                    color: '#94a3b8',
                },
            },
            y: {
                min: 0,
                max: 10,
                grid: {
                    color: '#f1f5f9',
                },
                ticks: {
                    stepSize: 2,
                    font: { size: 10, weight: 'bold' as const },
                    color: '#94a3b8',
                },
            },
        },
    };

    return (
        <div className="w-full h-full min-h-[180px]">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default PersonalHistoryChart;
