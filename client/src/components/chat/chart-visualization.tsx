import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ChartData {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title: string;
  data: Array<{
    label: string;
    value: number;
    category?: string;
  }>;
  description: string;
}

interface ChartVisualizationProps {
  chartData: ChartData;
}

const COLORS = ['#0084FF', '#36C5F0', '#2EB67D', '#ECB22E', '#E01E5A', '#4A90E2', '#7ED321', '#F5A623'];

export default function ChartVisualization({ chartData }: ChartVisualizationProps) {
  const { chartType, title, data, description } = chartData;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0084FF" />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0084FF" strokeWidth={2} />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#0084FF"
              label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#0084FF" fill="#0084FF" fillOpacity={0.6} />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis dataKey="value" />
            <Tooltip />
            <Legend />
            <Scatter dataKey="value" fill="#0084FF" />
          </ScatterChart>
        );

      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0084FF" />
          </BarChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📊 {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {description}
          </p>
        )}
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Generated visualization • {data.length} data points
      </div>
    </div>
  );
}