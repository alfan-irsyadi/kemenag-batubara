import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to generate colors (same as before)
const generateHslColors = (count) => {
  const backgrounds = [];
  const borders = [];
  const saturation = 100;
  const lightness_step = 80/count;
  const hue = 120;  

  for (let i = 0; i < count; i++) {
    const lightness = 20+i * lightness_step;
    backgrounds.push(`hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`);
    borders.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return { backgrounds, borders };
};

// The generic Doughnut Chart Component
const ReusableDoughnutChart = ({ jsonData, dataKey, chartTitle }) => {
  // Process data using the provided dataKey
  const counts = jsonData.reduce((acc, item) => {
    // This is the key change: use the prop 'dataKey' to get the value
    const group = item[dataKey] || "Not Specified";
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(counts);
  const dataPoints = Object.values(counts);
  const { backgrounds, borders } = generateHslColors(labels.length);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "# of Items",
        data: dataPoints,
        backgroundColor: backgrounds,
        borderColor: borders,
        borderWidth: 1,
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
          font: {
            size: 10, // 🔽 smaller font size
          },
        },
      },
      title: {
        display: true,
        text: chartTitle, // Use the chartTitle prop
        font: { size: 18 },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
  };
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default ReusableDoughnutChart;
