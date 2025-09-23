// App.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import ReusableDoughnutChart from "./ReuseableDoughnutChart";
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

function App() {
  const [data, setData] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedGolongan, setSelectedGolongan] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const titleRefs = useRef([]);

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

  // Data fetching dengan error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
        setNewsItems(newsJson.results || []);
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
    ["Semua", ...new Set(data.map(item => item.Golongan).filter(Boolean))],
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
          color: '#fff',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Distribusi Masa Kerja Pegawai (dalam Tahun)',
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  }), []);

  // Event handlers
  const handleNewsClick = useCallback((index) => {
    setActiveId(index);
    // Smooth scroll to news section
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

  // Statistics dengan memoization
  const statistics = useMemo(() => ({
    total: filteredData.length,
    active: 363, // Static data, bisa diganti dengan dynamic jika tersedia
    pns: filteredData.filter(item => item["STATUS PEGAWAI"] === "PNS").length,
    nonPns: filteredData.filter(item => item["STATUS PEGAWAI"] === "Non-PNS").length
  }), [filteredData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-xl">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
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
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Netflix-style Navbar */}
      <Navbar scrolled={scrolled} />
      
      {/* Hero Section */}
      <HeroSection astaProtas={ASTA_PROTAS} />
      
      {/* Featured News Section */}
      <FeaturedNews 
        newsItems={newsItems}
        activeId={activeId}
        onNewsClick={handleNewsClick}
      />
      
      {/* News Grid Section */}
      <NewsGrid newsItems={newsItems} />
      
      {/* Dashboard Section */}
      <Dashboard 
        filteredData={filteredData}
        statistics={statistics}
        golonganOptions={golonganOptions}
        statusOptions={statusOptions}
        selectedGolongan={selectedGolongan}
        selectedStatus={selectedStatus}
        onFilterChange={handleFilterChange}
        mkTahunChartData={mkTahunChartData}
        mkTahunChartOptions={mkTahunChartOptions}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

// Komponen Navbar yang dipisah
const Navbar = ({ scrolled }) => (
  <nav className={`fixed w-full z-50 transition-all duration-500 ${
    scrolled ? 'bg-black py-2 shadow-lg' : 'bg-gradient-to-b from-black to-transparent py-4'
  }`}>
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-green-500 text-2xl font-bold mr-2">KEMENAG</span>
        <span className="text-white text-xl">Batu Bara</span>
      </div>
      
      <div className="hidden md:flex space-x-6">
        {['Beranda', 'Profil', 'Layanan', 'Berita', 'Kontak'].map((item) => (
          <a key={item} href="#" className="text-white hover:text-green-400 transition-colors">
            {item}
          </a>
        ))}
      </div>
      
      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
        Login
      </button>
    </div>
  </nav>
);

// Komponen Hero Section
const HeroSection = ({ astaProtas }) => (
  <section className="h-auto min-h-screen relative overflow-hidden pt-16 pb-8">
    <div className="absolute inset-0 z-0">
      <img
        src="kantor-kemenag-batubara.jpg"
        className="w-full h-full object-cover"
        alt="Kantor Kemenag Batu Bara"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90"></div>
    </div>

    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 py-8">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 uppercase leading-tight">
        Kementerian Agama <br />
        Kabupaten Batu Bara
      </h1>

      <div className="w-full md:w-2/3 mt-4 md:mt-8">
        <p className="text-gray-200 text-base md:text-xl mb-4 md:mb-6">
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
const FeaturedNews = ({ newsItems, activeId, onNewsClick }) => {
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full mb-4">
            {activeNews.category}
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {activeNews.title}
          </h2>
          <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-3">
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
          newsItems={newsItems.slice(0, 10)} 
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
    <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
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
    className={`flex-none w-48 md:w-64 h-28 md:h-36 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
      isActive ? 'ring-2 ring-green-600 scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'
    }`}
    onClick={() => onClick(index)}
  >
    <img 
      src={item.image} 
      className="w-full h-full object-cover"
      alt={item.title}
      loading="lazy"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
      <p className="text-white text-xs md:text-sm font-medium truncate">{item.title}</p>
    </div>
  </div>
);

// Komponen News Grid
const NewsGrid = ({ newsItems }) => (
  <section className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Semua Berita</h2>
      <ExternalLinkButton />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {newsItems.map((news, index) => (
        <NewsCard key={index} news={news} />
      ))}
    </div>
  </section>
);

// Komponen News Card
const NewsCard = ({ news }) => (
  <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800 hover:border-green-500/30">
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
      <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-3">
        {news.excerpt}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-xs">{news.date}</span>
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
  mkTahunChartOptions
}) => (
  <section id="kepeg" className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-gray-900">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard Kepegawaian</h1>
      
      <DashboardFilters 
        golonganOptions={golonganOptions}
        statusOptions={statusOptions}
        selectedGolongan={selectedGolongan}
        selectedStatus={selectedStatus}
        onFilterChange={onFilterChange}
      />
      
      <StatisticsCards statistics={statistics} />
      
      <ChartsSection 
        filteredData={filteredData}
        mkTahunChartData={mkTahunChartData}
        mkTahunChartOptions={mkTahunChartOptions}
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
  onFilterChange
}) => (
  <div className="flex flex-col md:flex-row gap-4 mb-8">
    <FilterSelect 
      label="Filter berdasarkan Golongan"
      value={selectedGolongan}
      options={golonganOptions}
      onChange={(value) => onFilterChange('golongan', value)}
    />
    <FilterSelect 
      label="Filter berdasarkan Status"
      value={selectedStatus}
      options={statusOptions}
      onChange={(value) => onFilterChange('status', value)}
    />
  </div>
);

// Komponen Filter Select
const FilterSelect = ({ label, value, options, onChange }) => (
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

// Komponen Statistics Cards
const StatisticsCards = ({ statistics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
    <StatCard label="Jumlah Pegawai" value={statistics.total} />
    <StatCard label="Pegawai Aktif" value={statistics.active} />
    <StatCard label="Pegawai PNS" value={statistics.pns} />
    <StatCard label="Pegawai Non-PNS" value={statistics.nonPns} />
  </div>
);

// Komponen Stat Card
const StatCard = ({ label, value }) => (
  <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 hover:border-green-500/30 transition-colors">
    <div className="text-gray-400 text-sm mb-2">{label}</div>
    <div className="text-2xl md:text-3xl font-bold text-green-400">{value}</div>
  </div>
);

// Komponen Charts Section
const ChartsSection = ({ filteredData, mkTahunChartData, mkTahunChartOptions }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
    <ChartContainer title="Distribusi Pegawai berdasarkan Generasi">
      <ReusableDoughnutChart
        jsonData={filteredData}
        dataKey={"Generasi"}
      />
    </ChartContainer>
    
    <ChartContainer title="Distribusi Pegawai berdasarkan Pendidikan">
      <ReusableDoughnutChart
        jsonData={filteredData}
        dataKey={"JENJANG_PENDIDIKAN"}
      />
    </ChartContainer>
    
    <ChartContainer title="Distribusi Masa Kerja Pegawai" fullWidth>
      <div className="h-64 md:h-80">
        <Bar data={mkTahunChartData} options={mkTahunChartOptions} />
      </div>
    </ChartContainer>
  </div>
);

// Komponen Chart Container
const ChartContainer = ({ title, children, fullWidth = false }) => (
  <div className={`bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 ${
    fullWidth ? 'lg:col-span-2' : ''
  }`}>
    <h3 className="text-xl font-bold mb-4 text-center text-white">{title}</h3>
    {children}
  </div>
);

// Komponen Footer
const Footer = () => (
  <footer className="bg-black border-t border-gray-800 py-8 md:py-12 px-4 md:px-8 lg:px-16">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <FooterSection 
        title="Kemenag Batu Bara"
        content="Jl. Pendidikan No. 1, Lima Puluh Kota, Batu Bara, Sumatera Utara"
      />
      
      <FooterSection 
        title="Tautan Cepat"
        links={['Beranda', 'Profil', 'Layanan', 'Kontak']}
      />
      
      <FooterSection 
        title="Kontak"
        content={
          <>
            <p>Email: info@kemenagbatubara.go.id</p>
            <p>Telepon: (0622) 123456</p>
          </>
        }
      />
    </div>
    
    <div className="max-w-7xl mx-auto mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
      <p>© 2023 Kementerian Agama Kabupaten Batu Bara. All rights reserved.</p>
    </div>
  </footer>
);

// Komponen Footer Section
const FooterSection = ({ title, content, links }) => (
  <div>
    <h3 className="text-xl font-bold text-green-500 mb-3 md:mb-4">{title}</h3>
    {links ? (
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
              {link}
            </a>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-400 text-sm">{content}</div>
    )}
  </div>
);

export default App;