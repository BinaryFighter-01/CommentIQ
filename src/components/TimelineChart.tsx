// src/components/TimelineChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  timeline: Array<{ date: string; sentiment: number }>;
}

export default function TimelineChart({ timeline }: Props) {
  const chartData = {
    labels: timeline.map((d) => d.date),
    datasets: [
      {
        label: 'Sentiment Score',
        data: timeline.map((d) => d.sentiment),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Sentiment Timeline (7 days)</h3>
      <Line data={chartData} />
    </div>
  );
}
