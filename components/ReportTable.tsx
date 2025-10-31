'use client';

import { ItemStatistics } from '@/types';

interface ReportTableProps {
  title: string;
  items: {
    label: string;
    stats: ItemStatistics;
  }[];
}

export function ReportTable({ title, items }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
            <th className="border border-gray-300 px-3 py-2 text-center">N</th>
            <th className="border border-gray-300 px-3 py-2 text-center">1</th>
            <th className="border border-gray-300 px-3 py-2 text-center">2</th>
            <th className="border border-gray-300 px-3 py-2 text-center">3</th>
            <th className="border border-gray-300 px-3 py-2 text-center">4</th>
            <th className="border border-gray-300 px-3 py-2 text-center">5</th>
            <th className="border border-gray-300 px-3 py-2 text-center">6</th>
            <th className="border border-gray-300 px-3 py-2 text-center">7</th>
            <th className="border border-gray-300 px-3 py-2 text-center bg-blue-800">Média</th>
            <th className="border border-gray-300 px-3 py-2 text-center bg-blue-800">DP</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                {item.label}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.n}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['1']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['2']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['3']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['4']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['5']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['6']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                {item.stats.distribution['7']}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold bg-gray-100 text-gray-900">
                {item.stats.media.toFixed(2)}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold bg-gray-100 text-gray-900">
                {item.stats.dp.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
