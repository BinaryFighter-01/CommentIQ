// src/components/SentimentChart.tsx
'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
}

export default function SentimentChart({ data }: Props) {
  const chartData = {
    labels: ['Positive', 'Negative', 'Neutral', 'Mixed'],
    datasets: [
      {
        data: [data.positive, data.negative, data.neutral, data.mixed],
        backgroundColor: ['#10b981', '#ef4444', '#6b7280', '#f59e0b'],
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Sentiment Distribution</h3>
      <Pie data={chartData} />
    </div>
  );
}
