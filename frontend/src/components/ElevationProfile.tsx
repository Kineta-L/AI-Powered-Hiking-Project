import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface Coordinate {
  latitude: number;
  longitude: number;
  elevation?: number | null;
}

export default function ElevationProfile({ coordinates }: { coordinates: Coordinate[] }) {
  const elevData = coordinates.filter(c => c.elevation != null);

  const data = {
    labels: elevData.map((_, i) => `${i + 1}`),
    datasets: [
      {
        label: 'Elevation (m)',
        data: elevData.map(c => c.elevation),
        fill: true,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: '#22c55e',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
        ticks: { color: '#9ca3af', callback: (v: any) => `${v}m` },
      },
    },
  };

  return <Line data={data} options={options} />;
}
