import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import ReusableDoughnutChart from '../../components/ReusableDoughnutChart';
import ThemeContext from '../../context/ThemeContext';
import Navbar from '../../components/Navbar';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSatker, setSelectedSatker] = useState("kepegawaian");
  const [selectedGolongan, setSelectedGolongan] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [scrolled, setScrolled] = useState(false);
  const [isLayananOpen, setIsLayananOpen] = useState(false);

  const API_ENDPOINTS = {
    data: "https://backend-kemenag-batubara.vercel.app/api/data",
  };

  // Handle scroll untuk navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle layanan dropdown
  const toggleLayananDropdown = () => {
    setIsLayananOpen(!isLayananOpen);
  };

  const handleSatkerSelect = (satker) => {
    console.log('Selected satker:', satker);
    setIsLayananOpen(false);
  };

  // Daftar satker yang tersedia
  const satkerList = [
    { id: "kepegawaian", name: "Kepegawaian", icon: "👥", color: "from-blue-600 to-blue-800" },
    { id: "pendidikan", name: "Pendidikan & Madrasah", icon: "🎓", color: "from-purple-600 to-purple-800" },
    { id: "rumah-ibadah", name: "Rumah Ibadah", icon: "🕌", color: "from-emerald-600 to-emerald-800" },
    { id: "bimas-islam", name: "Bimas Islam", icon: "📖", color: "from-teal-600 to-teal-800" },
    { id: "bimas-kristen", name: "Bimas Kristen", icon: "✝️", color: "from-amber-600 to-amber-800" },
  ];

  // Fetch data dari API untuk kepegawaian
  useEffect(() => {
    const fetchData = async () => {
      if (selectedSatker !== "kepegawaian") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(API_ENDPOINTS.data);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const jsonData = await response.json();
        setData(jsonData.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSatker]);

  // Reset filter ketika ganti satker
  useEffect(() => {
    setSelectedGolongan("Semua");
    setSelectedStatus("Semua");
  }, [selectedSatker]);

  // Filter options untuk kepegawaian
  const golonganOptions = useMemo(() => 
    ["Semua", ...new Set(data.map(item => item['Golongan']).filter(Boolean))],
    [data]
  );

  const statusOptions = useMemo(() => 
    ["Semua", ...new Set(data.map(item => item["STATUS PEGAWAI"]).filter(Boolean))],
    [data]
  );

  // Filtered data untuk kepegawaian
  const filteredData = useMemo(() => 
    data.filter(item => {
      const golonganMatch = selectedGolongan === "Semua" || item.Golongan === selectedGolongan;
      const statusMatch = selectedStatus === "Semua" || item["STATUS PEGAWAI"] === selectedStatus;
      return golonganMatch && statusMatch;
    }),
    [data, selectedGolongan, selectedStatus]
  );

  // Statistics untuk kepegawaian
  const statistics = useMemo(() => ({
    total: filteredData.length,
    pns: filteredData.filter(item => item["STATUS PEGAWAI"] === "PNS").length,
    nonPns: filteredData.filter(item => item["STATUS PEGAWAI"] === "Non-PNS").length,    
    madrasah: [...new Set(filteredData.map(item => item["Satuan Kerja"]))].length
  }), [filteredData]);

  // Chart data untuk masa kerja
  const mkTahunChartData = useMemo(() => {
    if (selectedSatker !== "kepegawaian") return { labels: [], datasets: [] };

    const mkTahunData = filteredData.reduce((acc, item) => {
      const mkTahun = parseInt(item.MK_TAHUN) || 0;
      let range;
      if (mkTahun < 5) range = "0-4";
      else if (mkTahun < 10) range = "5-9";
      else if (mkTahun < 15) range = "10-14";
      else if (mkTahun < 20) range = "15-19";
      else if (mkTahun < 25) range = "20-24";
      else range = "25+";
      
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    const orderedRanges = ["0-4", "5-9", "10-14", "15-19", "20-24", "25+"];
    const orderedLabels = orderedRanges.filter(range => mkTahunData[range]);
    const orderedData = orderedLabels.map(range => mkTahunData[range]);

    return {
      labels: orderedLabels,
      datasets: [
        {
          label: 'Jumlah Pegawai',
          data: orderedData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData, selectedSatker]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: { size: 12 }
        }
      },
    },
    scales: {
      x: {
        ticks: { color: theme === 'dark' ? '#fff' : '#000' },
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
      },
      y: {
        ticks: { color: theme === 'dark' ? '#fff' : '#000' },
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
      }
    }
  }), [theme]);

  // Render content berdasarkan satker yang dipilih
  const renderSatkerContent = () => {
    switch (selectedSatker) {
      case "kepegawaian":
        return (
          <KepegawaianDashboard
            filteredData={filteredData}
            statistics={statistics}
            golonganOptions={golonganOptions}
            statusOptions={statusOptions}
            selectedGolongan={selectedGolongan}
            selectedStatus={selectedStatus}
            onGolonganChange={setSelectedGolongan}
            onStatusChange={setSelectedStatus}
            mkTahunChartData={mkTahunChartData}
            chartOptions={chartOptions}
            theme={theme}
          />
        );
      
      case "pendidikan":
        return <ComingSoonSatker name="Pendidikan & Madrasah" theme={theme} />;
      
      case "rumah-ibadah":
        return <ComingSoonSatker name="Rumah Ibadah" theme={theme} />;
      
      case "haji-umrah":
        return <ComingSoonSatker name="Haji & Umrah" theme={theme} />;
      
      default:
        return <ComingSoonSatker name={satkerList.find(s => s.id === selectedSatker)?.name} theme={theme} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <div className="relative flex items-center justify-center h-16 w-16 mx-auto mb-4">
            <div className="absolute animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
            <img 
              src="/logo-kemenag.webp" 
              alt="Kemenag Logo" 
              className="h-10 w-10"
            />
          </div>
          <div className="text-xl">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error && selectedSatker === "kepegawaian") {
    return (
      <div className={`netflix-container ${theme === 'dark' ? 'dark' : 'light'}`}>
        <Navbar 
          scrolled={true}
          isLayananOpen={isLayananOpen}
          toggleLayananDropdown={toggleLayananDropdown}
          handleSatkerSelect={handleSatkerSelect}
        />
        <div className="error-screen">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Terjadi Kesalahan</h2>
            <p className="error-message">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`netflix-container ${theme === 'dark' ? 'dark' : 'light'}`}>
      <Navbar 
        scrolled={scrolled}
        isLayananOpen={isLayananOpen}
        toggleLayananDropdown={toggleLayananDropdown}
        handleSatkerSelect={handleSatkerSelect}
      />
      
      {/* Hero Banner */}
      {/* <div className={`hero-banner-${theme}`}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className={`hero-title-${theme}`}>Dashboard Analytics</h1>
          <p className="hero-subtitle">Kementerian Agama Kabupaten Batubara</p>
          <div className="hero-description">
            Sistem informasi terintegrasi untuk monitoring dan analisis data secara real-time
          </div>
          <div className="hero-buttons">
            <button className="hero-btn primary">
              <span>📊</span>
              <span>Lihat Statistik</span>
            </button>
            <button className="hero-btn secondary">
              <span>📥</span>
              <span>Unduh Laporan</span>
            </button>
          </div>
        </div>
        <div className="hero-gradient"></div>
      </div> */}

      <div className="netflix-layout">
        {/* Netflix-style Sidebar */}
        <div className="netflix-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h3>Pilih Layanan</h3>
              <div className="header-divider"></div>
            </div>
            <div className="sidebar-grid">
              {satkerList.map((satker) => (
                <button
                  key={satker.id}
                  className={`satker-card ${selectedSatker === satker.id ? 'active' : ''}`}
                  onClick={() => setSelectedSatker(satker.id)}
                >
                  <div className={`card-gradient bg-gradient-to-br ${satker.color}`}></div>
                  <div className="card-content">
                    <span className="card-icon">{satker.icon}</span>
                    <span className="card-text">{satker.name}</span>
                  </div>
                  <div className="card-shine"></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="netflix-main">
          <div className="content-header">
            <div className="header-text">
              <h2 className="content-title">Dashboard {satkerList.find(s => s.id === selectedSatker)?.name}</h2>
              <p className="content-subtitle">Data Analytics & Insights</p>
            </div>
            
          </div>

          {renderSatkerContent()}
        </div>
      </div>
    </div>
  );
};

// Komponen Dashboard Kepegawaian
const KepegawaianDashboard = ({
  filteredData,
  statistics,
  golonganOptions,
  statusOptions,
  selectedGolongan,
  selectedStatus,
  onGolonganChange,
  onStatusChange,
  mkTahunChartData,
  chartOptions,
  theme
}) => (
  <div className="kepegawaian-content">
    {/* Filter Section */}
    <div className="filter-row">
      <FilterCard
        label="Filter Golongan"
        value={selectedGolongan}
        options={golonganOptions}
        onChange={onGolonganChange}
        icon="🏷️"
        theme={theme}
      />
      <FilterCard
        label="Filter Status Pegawai"
        value={selectedStatus}
        options={statusOptions}
        onChange={onStatusChange}
        icon="👤"
        theme={theme}
      />
    </div>

    {/* Statistics Cards */}
    <div className="stats-row">
      <NetflixStatCard 
        label="Total Pegawai" 
        value={statistics.total} 
        icon="👥"
        color="blue"
        theme={theme} 
      />
      <NetflixStatCard 
        label="Pegawai PNS" 
        value={statistics.pns} 
        icon="💼"
        color="green"
        theme={theme} 
      />
      <NetflixStatCard 
        label="Pegawai Non-PNS" 
        value={statistics.total - statistics.pns} 
        icon="📋"
        color="purple"
        theme={theme} 
      />      
      <NetflixStatCard 
        label="Satuan Kerja" 
        value={statistics.madrasah} 
        icon="🏢"
        color="orange"
        theme={theme} 
      />
    </div>

    {/* Charts Section */}
    <div className="charts-row">
      <NetflixChartCard title="Distribusi Generasi" icon="👶" theme={theme}>
        <ReusableDoughnutChart
          jsonData={filteredData}
          dataKey={"Generasi"}
          chartTitle=""
        />
      </NetflixChartCard>
      
      <NetflixChartCard title="Jenjang Pendidikan" icon="🎓" theme={theme}>
        <ReusableDoughnutChart
          jsonData={filteredData}
          dataKey={"JENJANG_PENDIDIKAN"}
          chartTitle=""
        />
      </NetflixChartCard>
    </div>

    <div className="chart-full">
      <NetflixChartCard title="Masa Kerja Pegawai" icon="⏱️" theme={theme} fullWidth>
        <div className="bar-chart-wrapper">
          <Bar data={mkTahunChartData} options={chartOptions} />
        </div>
      </NetflixChartCard>
    </div>
  </div>
);

// Komponen untuk satker yang belum tersedia
const ComingSoonSatker = ({ name, theme }) => (
  <div className="coming-soon-netflix">
    <div className="coming-soon-card">
      <div className="coming-soon-icon">🚧</div>
      <h2 className="coming-soon-title">Coming Soon</h2>
      <p className="coming-soon-text">
        Dashboard <span className="highlight">{name}</span> sedang dalam tahap pengembangan
      </p>
      <div className="coming-soon-progress">
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <span className="progress-text">In Development</span>
      </div>
    </div>
  </div>
);

// Komponen FilterCard
const FilterCard = ({ label, value, options, onChange, icon, theme }) => (
  <div className="filter-card">
    <div className="filter-header">
      <span className="filter-icon">{icon}</span>
      <label className="filter-label">{label}</label>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="filter-select"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Komponen Netflix StatCard
const NetflixStatCard = ({ label, value, icon, color, theme }) => (
  <div className={`netflix-stat-card ${color}`}>
    <div className="stat-background"></div>
    <div className="stat-header">
      <span className="stat-icon">{icon}</span>
    </div>
    <div className="stat-body">
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
    <div className="stat-glow"></div>
  </div>
);

// Komponen Netflix ChartCard
const NetflixChartCard = ({ title, icon, children, fullWidth = false, theme }) => (
  <div className={`netflix-chart-card ${fullWidth ? 'full-width' : ''}`}>
    <div className="chart-header">
      <div className="chart-title-group">
        <span className="chart-icon">{icon}</span>
        <h3 className="chart-title">{title}</h3>
      </div>
      <button className="chart-action">
        <span>⋯</span>
      </button>
    </div>
    <div className="chart-body">
      {children}
    </div>
  </div>
);

export default Dashboard;