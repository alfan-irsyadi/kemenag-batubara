// File: src/App.jsx
import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  Title, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from "chart.js";
import { useNavigate } from "react-router-dom";
import ReusableDoughnutChart from "./components/ReusableDoughnutChart";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ThemeContext from "./context/ThemeContext";
import "./App.css";

// Register ChartJS components once
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

// Constants
const ASTA_PROTAS = [
  "Peningkatan Kerukunan dan Cinta Kemanusiaan",
  "Penguatan Ekoteologi",
  "Layanan Keagamaan Berdampak",
  "Mewujudkan Pendidikan Unggul, Ramah, dan Terintegrasi",
  "Pemberdayaan Pesantren",
  "Pemberdayaan Ekonomi Umat",
  "Sukses Haji",
  "Digitalisasi Tata Kelola",
];

const API_ENDPOINTS = {
  data: "https://backend-kemenag-batubara.vercel.app/api/data",
  search: "https://backend-kemenag-batubara.vercel.app/api/search?keyword=batu+bara"
};

// Komponen Hero Section
const HeroSection = ({ astaProtas, theme }) => (
  <section className="h-auto min-h-screen relative overflow-hidden pt-16 pb-8">
    <div className="absolute inset-0 z-0">
      <img
        src="kantor-kemenag-batubara.jpg"
        className="w-full h-full object-cover"
        alt="Kantor Kemenag Batu Bara"
        loading="lazy"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black via-black/70':'from-white via-white/70'} to-transparent`}></div>
      <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark' ? 'from-black/60 to-black/90':'from-white/60 via-white/90'}`}></div>
    </div>

    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 py-8">
      <img src={`./logo-${theme}.png`} className="w-1/2" alt="Logo Kemenag"/>
      
      <div className="w-full md:w-2/3 mt-4 md:mt-8">
        <p className={`${theme === 'dark' ? 'text-gray-200':'text-gray-800'} text-base md:text-xl mb-4 md:mb-6`}>
          <span className="font-semibold text-lg md:text-2xl">
            Selamat datang di kawasan pembangunan Zona Integritas
          </span>{" "}
          <br />
          menuju "Wilayah Bebas dari Korupsi (WBK)" dan "Wilayah Birokrasi
          Bersih dan Melayani (WBBM)"
        </p>
      </div>
      
      <div className="w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent my-4 md:my-8"></div>
      
      <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">
        8 Asta Protas Kementerian Agama
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-6xl px-4">
        {astaProtas.map((title, index) => (
          <AstaProtaCard key={index} index={index} title={title} />
        ))}
      </div>
    </div>
  </section>
);

// Komponen Kartu Asta Prota
const AstaProtaCard = ({ index, title }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center transition-all duration-300 hover:bg-green-900/30 hover:scale-105 border border-gray-700 hover:border-green-500">
    <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-full bg-green-600 flex items-center justify-center font-bold mr-2 md:mr-3 text-xs md:text-base">
      {index + 1}
    </div>
    <div className="text-xs md:text-sm font-medium">
      {title}
    </div>
  </div>
);

// Komponen Featured News
const FeaturedNews = ({ newsItems, activeId, onNewsClick, theme }) => {
  if (newsItems.length === 0) return null;

  const activeNews = newsItems[activeId] || newsItems[0];

  return (
    <section id="news-section" className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={activeNews.image}
          className="w-full h-full object-cover"
          alt={activeNews.title}
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-black via-black/70':'from-white via-white/70'} to-transparent`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark' ? 'from-black/50 to-black/90':'from-white/50 via-white/90'} `}></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme === 'dark' ? 'from-black/40':'from-white/40'} to-transparent`}></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full mb-4">
            {activeNews.category}
          </span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight">
            {activeNews.title}
          </h2>
          <p className={`${theme==='dark'?'text-gray-300': 'text-gray-700'} text-base md:text-lg mb-6 line-clamp-3`}>
            {activeNews.excerpt}
          </p>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <span className="text-gray-400 text-sm">
              {activeNews.date}
            </span>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors w-full md:w-auto">
              Baca Selengkapnya
            </button>
          </div>
        </div>

        <NewsCarousel 
          newsItems={newsItems.slice(0, 8)} 
          activeId={activeId}
          onNewsClick={onNewsClick}
        />
      </div>
    </section>
  );
};

// Komponen News Carousel
const NewsCarousel = ({ newsItems, activeId, onNewsClick }) => (
  <div className="mt-8 md:mt-12">
    <h3 className="text-lg md:text-xl font-bold mb-4">Berita Terkini</h3>
    <div className="flex space-x-3 md:space-x-4 overflow-x-auto p-4 scrollbar-hide">
      {newsItems.map((item, index) => (
        <NewsThumbnail 
          key={index}
          item={item}
          index={index}
          isActive={index === activeId}
          onClick={onNewsClick}
        />
      ))}
    </div>
  </div>
);

// Komponen News Thumbnail
const NewsThumbnail = ({ item, index, isActive, onClick }) => (
  <div 
    className={`flex-none w-48 md:w-64 h-28 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
      isActive ? 'md:h-44 bg-green-900 ring-2 ring-green-600 scale-105' : 'md:h-36 opacity-70 hover:opacity-100 hover:scale-105'
    }`}
    onClick={() => onClick(index)}
  >
    <img 
      src={item.image} 
      className="w-full h-36 object-cover"
      alt={item.title}
      loading="lazy"
    />
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 ${isActive ? '' : 'hidden'}`}>
      <p className="text-white text-xs md:text-sm font-medium truncate">{item.title}</p>
    </div>
  </div>
);

// Komponen News Grid
const NewsGrid = ({ newsItems, theme }) => (
  <section className={`py-12 md:py-16 px-4 md:px-8 lg:px-16 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Semua Berita</h2>
      <ExternalLinkButton />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {newsItems.slice(0, 8).map((news, index) => (
        <NewsCard key={index} news={news} theme={theme} />
      ))}
    </div>
  </section>
);

// Komponen News Card
const NewsCard = ({ news, theme }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:border-green-500/30' : 'bg-gray-50 border-gray-200 hover:border-green-500/50'} rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border`}>
    <div className="h-40 md:h-48 relative">
      <img
        src={news.image}
        className="w-full h-full object-cover"
        alt={news.title}
        loading="lazy"
      />
      <div className="absolute top-0 left-0 bg-gradient-to-b from-black/60 to-transparent w-full h-16"></div>
      <span className="absolute top-3 left-3 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
        {news.category}
      </span>
    </div>
    <div className="p-3 md:p-4">
      <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2">
        {news.title}
      </h3>
      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs md:text-sm mb-3 md:mb-4 line-clamp-3`}>
        {news.excerpt}
      </p>
      <div className="flex justify-between items-center">
        <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs`}>{news.date}</span>
        <button className="text-green-500 hover:text-green-400 text-xs md:text-sm font-medium">
          Baca →
        </button>
      </div>
    </div>
  </div>
);

// Komponen External Link Button
const ExternalLinkButton = () => (
  <a 
    href="https://sumut.kemenag.go.id/beranda/list-pencarian?cari=batu%20bara" 
    target="_blank" 
    rel="noopener noreferrer"
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
  >
    Baca Selengkapnya
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </a>
);

// Komponen Dashboard
const Dashboard = ({
  filteredData,
  statistics,
  golonganOptions,
  statusOptions,
  selectedGolongan,
  selectedStatus,
  onFilterChange,
  mkTahunChartData,
  mkTahunChartOptions,
  theme
}) => (
  <section id="kepeg" className={`py-12 sm:py-16 px-4 sm:px-8 lg:px-16 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard Kepegawaian</h1>
      
      <DashboardFilters
        golonganOptions={golonganOptions}
        statusOptions={statusOptions}
        selectedGolongan={selectedGolongan}
        selectedStatus={selectedStatus}
        onFilterChange={onFilterChange}
        theme={theme}
      />
      
      <StatisticsCards statistics={statistics} theme={theme} />
      
      <ChartsSection
        filteredData={filteredData}
        mkTahunChartData={mkTahunChartData}
        mkTahunChartOptions={mkTahunChartOptions}
        theme={theme}
      />
    </div>
  </section>
);

// Komponen Dashboard Filters
const DashboardFilters = ({
  golonganOptions,
  statusOptions,
  selectedGolongan,
  selectedStatus,
  onFilterChange,
  theme
}) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-8">
    <FilterSelect
      label="Filter berdasarkan Golongan"
      value={selectedGolongan}
      options={golonganOptions}
      onChange={(value) => onFilterChange("golongan", value)}
      theme={theme}
    />
    <FilterSelect
      label="Filter berdasarkan Status"
      value={selectedStatus}
      options={statusOptions}
      onChange={(value) => onFilterChange("status", value)}
      theme={theme}
    />
  </div>
);

const FilterSelect = ({ label, value, options, onChange, theme }) => (
  <div className="flex-1">
    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border-none text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${theme==='dark'?'bg-gray-900 text-white':'bg-gray-100 text-black'}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Komponen Statistics Cards
const StatisticsCards = ({ statistics, theme }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
    <StatCard label="Jumlah Pegawai" value={statistics.total} theme={theme} />
    <StatCard label="Pegawai Aktif" value={statistics.active} theme={theme} />
    <StatCard label="Pegawai PNS" value={statistics.pns} theme={theme} />
    <StatCard label="Pegawai Non-PNS" value={statistics.total - statistics.pns} theme={theme} />
  </div>
);

const StatCard = ({ label, value, theme }) => (
  <div className={`rounded-lg p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
    <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    <div className="text-xl sm:text-2xl font-semibold text-green-500">{value}</div>
  </div>
);

// Komponen Charts Section
const ChartsSection = ({ filteredData, mkTahunChartData, mkTahunChartOptions, theme }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
    <ChartContainer title="Distribusi Pegawai berdasarkan Generasi" theme={theme}>
      <ReusableDoughnutChart
        jsonData={filteredData}
        dataKey={"Generasi"}
      />
    </ChartContainer>
    
    <ChartContainer title="Distribusi Pegawai berdasarkan Pendidikan" theme={theme}>
      <ReusableDoughnutChart
        jsonData={filteredData}
        dataKey={"JENJANG_PENDIDIKAN"}
      />
    </ChartContainer>
    
    <ChartContainer title="Distribusi Masa Kerja Pegawai" fullWidth theme={theme}>
      <div className="h-64 md:h-80">
        <Bar data={mkTahunChartData} options={mkTahunChartOptions} />
      </div>
    </ChartContainer>
  </div>
);

// Komponen Chart Container
const ChartContainer = ({ title, children, fullWidth = false, theme }) => (
  <div className={`rounded-lg p-4 sm:p-6 ${fullWidth ? "lg:col-span-2" : ""} ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
    <h3 className={`text-lg sm:text-xl font-semibold mb-4 text-center ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>{title}</h3>
    {children}
  </div>
);

function App() {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedGolongan, setSelectedGolongan] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [isLayananOpen, setIsLayananOpen] = useState(false);
  const navigate = useNavigate();

  // Scroll handler dengan debouncing
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data fetching dengan error handling and timeout
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await new Promise(resolve => setTimeout(resolve, 2000));

        const [dataResponse, newsResponse] = await Promise.all([
          fetch(API_ENDPOINTS.data),
          fetch(API_ENDPOINTS.search)
        ]);

        if (!dataResponse.ok || !newsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [dataJson, newsJson] = await Promise.all([
          dataResponse.json(),
          newsResponse.json()
        ]);

        setData(dataJson.data || []);
        setNewsItems(newsJson.posts?.slice(0, 8) || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter options dengan memoization
  const golonganOptions = useMemo(() => 
    ["Semua", ...new Set(data.map(item => item['Golongan']).filter(Boolean))],
    [data]
  );

  const statusOptions = useMemo(() => 
    ["Semua", ...new Set(data.map(item => item["STATUS PEGAWAI"]).filter(Boolean))],
    [data]
  );

  // Filtered data dengan memoization
  const filteredData = useMemo(() => 
    data.filter(item => {
      const golonganMatch = selectedGolongan === "Semua" || item.Golongan === selectedGolongan;
      const statusMatch = selectedStatus === "Semua" || item["STATUS PEGAWAI"] === selectedStatus;
      return golonganMatch && statusMatch;
    }),
    [data, selectedGolongan, selectedStatus]
  );

  // Chart data dengan memoization
  const mkTahunChartData = useMemo(() => {
    const mkTahunData = filteredData.reduce((acc, item) => {
      const mkTahun = parseInt(item.MK_TAHUN) || 0;
      const range = `${Math.floor(mkTahun/5)*5}-${Math.floor(mkTahun/5)*5+4}`;
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(mkTahunData),
      datasets: [
        {
          label: 'Jumlah Pegawai',
          data: Object.values(mkTahunData),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(101, 163, 13, 0.8)',
            'rgba(77, 124, 15, 0.8)',
            'rgba(63, 98, 18, 0.8)',
            'rgba(54, 83, 20, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(101, 163, 13, 1)',
            'rgba(77, 124, 15, 1)',
            'rgba(63, 98, 18, 1)',
            'rgba(54, 83, 20, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData]);

  const mkTahunChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#000',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Masa Kerja Pegawai (dalam Tahun)',
        color: theme === 'dark' ? '#fff' : '#000',
        font: {
          size: 16,
          weight: 'bold'
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

  // Event handlers
  const handleNewsClick = useCallback((index) => {
    setActiveId(index);
    document.getElementById('news-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }, []);

  const handleFilterChange = useCallback((type, value) => {
    if (type === 'golongan') {
      setSelectedGolongan(value);
    } else {
      setSelectedStatus(value);
    }
  }, []);

  // Handle dropdown toggle
  const toggleLayananDropdown = () => {
    setIsLayananOpen(!isLayananOpen);
  };

  // Handle satker selection
  const handleSatkerSelect = (satker) => {
    navigate(`/layanan?satker=${satker.toLowerCase().replace(/\s+/g, '-')}`);
    setIsLayananOpen(false);
  };

  // Statistics dengan memoization
  const statistics = useMemo(() => ({
    total: filteredData.length,
    active: 363,
    pns: filteredData.filter(item => item["STATUS PEGAWAI"] === "PNS").length,
    nonPns: filteredData.filter(item => item["STATUS PEGAWAI"] === "Non-PNS").length
  }), [filteredData]);

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

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Navbar 
        scrolled={scrolled} 
        isLayananOpen={isLayananOpen}
        toggleLayananDropdown={toggleLayananDropdown}
        handleSatkerSelect={handleSatkerSelect}
      />      
      
      <HeroSection astaProtas={ASTA_PROTAS} theme={theme} />
      
      <FeaturedNews 
        newsItems={newsItems}
        activeId={activeId}
        onNewsClick={handleNewsClick}
        theme={theme}
      />
      
      <NewsGrid newsItems={newsItems} theme={theme} />
      
      
      <Footer />
    </div>
  );
}

export default App;