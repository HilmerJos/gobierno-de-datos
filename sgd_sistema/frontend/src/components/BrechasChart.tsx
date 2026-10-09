import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface BrechasChartProps {
  dimensions: { codigo: string; nombre: string; puntaje: number }[];
  isDark: boolean;
}

export const BrechasChart: React.FC<BrechasChartProps> = ({ dimensions, isDark }) => {
  const labels = dimensions.map(d => `${d.codigo} - ${d.nombre.substring(0, 18)}...`);
  const scores = dimensions.map(d => d.puntaje);

  const data = {
    labels: labels,
    datasets: [
      {
        data: scores,
        backgroundColor: scores.map(s =>
          s >= 3.0 ? '#10b981' : s >= 1.5 ? '#f59e0b' : '#f43f5e'
        ),
        borderRadius: 6,
      },
    ],
  };

  const options: any = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 5,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#334155',
          font: { size: 11 },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#cbd5e1' : '#0f172a',
          font: { size: 11, weight: 'bold' as const },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Puntaje: ${context.raw} / 5.00`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80 relative">
      <Bar data={data} options={options} />
    </div>
  );
};
