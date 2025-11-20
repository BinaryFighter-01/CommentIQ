// src/components/TopicsChart.tsx
'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  topics: string[];
}

export default function TopicsChart({ topics }: Props) {
  const chartData = {
    labels: topics.slice(0, 5),
    datasets: [
      {
        label: 'Mentions',
        data: Array(Math.min(topics.length, 5)).fill(1),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Top Discussion Topics</h3>
      <Bar data={chartData} />
    </div>
  );
}
