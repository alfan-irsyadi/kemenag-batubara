import { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ThemeContext from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

// Enhanced color palette generator with better contrast
const generateModernColors = (count) => {
  const colorPalettes = [
    // Green shades (primary)
    { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgb(34, 197, 94)' },
    { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' },
    { bg: 'rgba(5, 150, 105, 0.8)', border: 'rgb(5, 150, 105)' },
    // Blue shades
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
    { bg: 'rgba(37, 99, 235, 0.8)', border: 'rgb(37, 99, 235)' },
    // Purple shades
    { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)' },
    { bg: 'rgba(147, 51, 234, 0.8)', border: 'rgb(147, 51, 234)' },
    // Orange shades
    { bg: 'rgba(249, 115, 22, 0.8)', border: 'rgb(249, 115, 22)' },
    { bg: 'rgba(234, 88, 12, 0.8)', border: 'rgb(234, 88, 12)' },
    // Pink shades
    { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgb(236, 72, 153)' },
    { bg: 'rgba(219, 39, 119, 0.8)', border: 'rgb(219, 39, 119)' },
    // Cyan shades
    { bg: 'rgba(6, 182, 212, 0.8)', border: 'rgb(6, 182, 212)' },
    { bg: 'rgba(14, 165, 233, 0.8)', border: 'rgb(14, 165, 233)' },
    // Yellow/Lime shades
    { bg: 'rgba(132, 204, 22, 0.8)', border: 'rgb(132, 204, 22)' },
    { bg: 'rgba(163, 230, 53, 0.8)', border: 'rgb(163, 230, 53)' },
  ];

  const backgrounds = [];
  const borders = [];

  for (let i = 0; i < count; i++) {
    const colorIndex = i % colorPalettes.length;
    backgrounds.push(colorPalettes[colorIndex].bg);
    borders.push(colorPalettes[colorIndex].border);
  }

  return { backgrounds, borders };
};

// The enhanced Doughnut Chart Component with theme support
const ReusableDoughnutChart = ({ jsonData, dataKey, chartTitle = "" }) => {
  const { theme } = useContext(ThemeContext);

  // Process data using the provided dataKey
  const counts = jsonData.reduce((acc, item) => {
    const group = item[dataKey] || "Tidak Ditentukan";
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  // Sort by count (descending) for better visualization
  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const labels = sortedEntries.map(([label]) => label);
  const dataPoints = sortedEntries.map(([, count]) => count);
  
  const { backgrounds, borders } = generateModernColors(labels.length);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Jumlah",
        data: dataPoints,
        backgroundColor: backgrounds,
        borderColor: borders,
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '500',
          },
          padding: 12,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: chartTitle ? true : false,
        text: chartTitle,
        color: theme === 'dark' ? '#fff' : '#000',
        font: { 
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme === 'dark' ? '#fff' : '#000',
        bodyColor: theme === 'dark' ? '#e5e7eb' : '#374151',
        borderColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.8)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div 
      style={{ 
        width: "100%", 
        height: "300px",
        position: "relative",
      }}
      className="doughnut-chart-container"
    >
      <Doughnut data={chartData} options={options} />
      
      {/* Total count badge */}
      <div 
        className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
          color: theme === 'dark' ? '#22c55e' : '#16a34a',
          border: `1px solid ${theme === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)'}`,
        }}
      >
        Total: {dataPoints.reduce((a, b) => a + b, 0)}
      </div>
    </div>
  );
};

export default ReusableDoughnutChart;