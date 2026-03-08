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

    // Using values that align with the brand (you could also read CSS variables here)
    const brandColor = '#4318FF'; // Corporate primary

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Valoración Media',
                data: scores,
                borderColor: brandColor,
                backgroundColor: 'rgba(67, 24, 255, 0.05)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: brandColor,
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
                backgroundColor: '#1E1B4B', // ink equivalent
                titleFont: { size: 12, weight: 'bold' as const },
                bodyFont: { size: 12, weight: 'bold' as const },
                padding: 12,
                cornerRadius: 12,
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
                    color: '#64748b', // text-muted
                },
            },
            y: {
                min: 0,
                max: 10,
                grid: {
                    color: '#f1f5f9', // stroke
                },
                ticks: {
                    stepSize: 2,
                    font: { size: 10, weight: 'bold' as const },
                    color: '#64748b', // text-muted
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
