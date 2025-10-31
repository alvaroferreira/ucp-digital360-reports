'use client';

import { ItemStatistics } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportChartsProps {
  title: string;
  items: {
    label: string;
    stats: ItemStatistics;
  }[];
}

export function ReportCharts({ title, items }: ReportChartsProps) {
  // Preparar dados para o gráfico
  const chartData = items.map(item => ({
    name: item.label.length > 30
      ? item.label.substring(0, 30) + '...'
      : item.label,
    média: item.stats.media,
  }));

  return (
    <div className="w-full mt-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 7]} />
          <YAxis type="category" dataKey="name" width={180} />
          <Tooltip />
          <Legend />
          <Bar dataKey="média" fill="#1e3a8a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
