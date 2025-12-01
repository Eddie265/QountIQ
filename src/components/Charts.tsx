"use client";

import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function DonutChart() {
  const data = {
    labels: ['Rent & Living', 'Food & Dining', 'Transportation'],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: [
          '#4caf50', // Primary green
          '#2196f3', // Blue
          '#ff9800', // Orange
        ],
        borderWidth: 0,
        cutout: '70%',
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
        enabled: false,
      },
    },
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs text-[var(--text-muted)]">Total Expense</div>
          <div className="text-sm font-bold text-[var(--foreground)]">$3,500</div>
        </div>
      </div>
    </div>
  );
}

export function BarChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: [4, 5, 6, 5.5, 7, 6, 8, 7.5, 6.5, 8.5, 7, 9],
        backgroundColor: '#1b5e20', // Dark green
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expense',
        data: [3, 4, 3.5, 4.5, 5, 4, 6, 5.5, 4.5, 6.5, 5, 7],
        backgroundColor: '#c8e6c9', // Light green
        borderRadius: 4,
        borderSkipped: false,
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
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#4caf50',
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            const month = context[0].label;
            return `${month} 2029`;
          },
          label: function(context: any) {
            const label = context.dataset.label;
            const value = context.parsed.y;
            return `${label} $${value * 1000}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: '#f0f0f0',
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return value + 'K';
          },
        },
        min: -8,
        max: 8,
      },
    },
  };

  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  );
}

