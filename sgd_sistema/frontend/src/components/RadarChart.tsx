import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  dimensions: { codigo: string; nombre: string; puntaje: number }[];
  isDark: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({ dimensions, isDark }) => {
  const labels = dimensions.map(d => d.codigo);
  const dataScores = dimensions.map(d => d.puntaje);
  const targetScores = dimensions.map(() => 3.0);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Nivel Obtenido',
        data: dataScores,
        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)',
        borderColor: isDark ? '#38bdf8' : '#0284c7',
        borderWidth: 2.5,
        pointBackgroundColor: isDark ? '#38bdf8' : '#0284c7',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#0284c7',
      },
      {
        label: 'Meta PCM (3.00)',
        data: targetScores,
        backgroundColor: 'transparent',
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: '#f59e0b',
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        pointLabels: {
          font: { size: 12, weight: 'bold' as const, family: 'Inter' },
          color: isDark ? '#94a3b8' : '#1e293b',
        },
        ticks: {
          stepSize: 1,
          backdropColor: 'transparent',
          color: isDark ? '#64748b' : '#64748b',
          font: { size: 10 },
        },
        min: 0,
        max: 5,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#cbd5e1' : '#0f172a',
          font: { size: 12, family: 'Inter', weight: 'bold' as const },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw} pts`,
        },
      },
    },
  };

  return (
    <div className="w-full h-80 relative">
      <Radar data={data} options={options} />
    </div>
  );
};
