// App.jsx
import { useState, useEffect, useRef } from "react";
import {Bar} from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from "chart.js";
import ReusableDoughnutChart from "./ReuseableDoughnutChart";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

function App() {
  const [data, setData] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(0);
  const [startId, setStartId] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedGolongan, setSelectedGolongan] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const titleRefs = useRef([]);
  const jumlahKartu = 5;

  const astaProtas = [
    { title: "Peningkatan Kerukunan dan Cinta Kemanusiaan" },
    { title: "Penguatan Ekoteologi" },
    { title: "Layanan Keagamaan Berdampak" },
    { title: "Mewujudkan Pendidikan Unggul, Ramah, dan Terintegrasi" },
    { title: "Pemberdayaan Pesantren" },
    { title: "Pemberdayaan Ekonomi Umat" },
    { title: "Sukses Haji" },
    { title: "Digitalisasi Tata Kelola" },
  ];

  useEffect(() => {
    Promise.all([
      fetch("https://backend-kemenag-batubara.vercel.app/api/data")
        .then((res) => res.json())
        .then((json) => setData(json.data)),
      fetch("https://backend-kemenag-batubara.vercel.app/api/search?keyword=batu+bara")
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          setNewsItems(json);
        }),
    ])
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get unique values for filters
  const golonganOptions = ["Semua", ...new Set(data.map(item => item.Golongan).filter(Boolean))];
  const statusOptions = ["Semua", ...new Set(data.map(item => item["STATUS PEGAWAI"]).filter(Boolean))];

  // Filter data based on selected filters
  const filteredData = data.filter(item => {
    const golonganMatch = selectedGolongan === "Semua" || item.Golongan === selectedGolongan;
    const statusMatch = selectedStatus === "Semua" || item["STATUS PEGAWAI"] === selectedStatus;
    return golonganMatch && statusMatch;
  });

  // Prepare data for MK_TAHUN chart
  const mkTahunData = filteredData.reduce((acc, item) => {
    const mkTahun = parseInt(item.MK_TAHUN) || 0;
    const range = `${Math.floor(mkTahun/5)*5}-${Math.floor(mkTahun/5)*5+4}`;
    acc[range] = (acc[range] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for chart
  const mkTahunChartData = {
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

  const mkTahunChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribusi Masa Kerja Pegawai (dalam Tahun)',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Netflix-style Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black py-2' : 'bg-gradient-to-b from-black to-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-green-500 text-2xl font-bold mr-2">KEMENAG</span>
            <span className="text-white text-xl">Batu Bara</span>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-white hover:text-green-400 transition-colors">Beranda</a>
            <a href="#" className="text-white hover:text-green-400 transition-colors">Profil</a>
            <a href="#" className="text-white hover:text-green-400 transition-colors">Layanan</a>
            <a href="#" className="text-white hover:text-green-400 transition-colors">Berita</a>
            <a href="#" className="text-white hover:text-green-400 transition-colors">Kontak</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Fixed for mobile */}
      <section className="h-auto min-h-screen relative overflow-hidden pt-16 pb-8">
        <div className="absolute inset-0 z-0">
          <img
            src="kantor-kemenag-batubara.jpg"
            className="w-full h-full object-cover"
            alt="Kantor Kemenag Batu Bara"
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
            {astaProtas.map((item, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 flex items-center transition-all duration-300 hover:bg-green-900/30 hover:scale-105 border border-gray-700 hover:border-green-500"
              >
                <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-full bg-green-600 flex items-center justify-center font-bold mr-2 md:mr-3 text-xs md:text-base">
                  {index + 1}
                </div>
                <div className="text-xs md:text-sm font-medium">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured News Section - Netflix Style */}
      <section className="relative h-screen overflow-hidden">
        {newsItems.length > 0 && (
          <>
            <div className="absolute inset-0 z-0">
              <img
                src={newsItems[activeId]?.image}
                className="w-full h-full object-cover"
                alt={newsItems[activeId]?.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-4 md:px-8 lg:px-16">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full mb-4">
                  {newsItems[activeId]?.category}
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {newsItems[activeId]?.title}
                </h2>
                <p className="text-gray-300 text-base md:text-lg mb-6">
                  {newsItems[activeId]?.excerpt}
                </p>
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="text-gray-400 text-sm mb-2 md:mb-0 md:mr-4">
                    {newsItems[activeId]?.date}
                  </span>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-colors w-full md:w-auto">
                    Baca Selengkapnya
                  </button>
                </div>
              </div>

              {/* News Carousel */}
              <div className="mt-8 md:mt-12">
                <h3 className="text-lg md:text-xl font-bold mb-4">Berita Terkini</h3>
                <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {newsItems.slice(0, 10).map((item, index) => (
                    <div 
                      key={index}
                      className={`flex-none w-48 md:w-64 h-28 md:h-36 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${index === activeId ? 'ring-2 ring-green-600 scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      onClick={() => setActiveId(index)}
                    >
                      <img 
                        src={item.image} 
                        className="w-full h-full object-cover"
                        alt={item.title}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs md:text-sm font-medium truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* News Grid Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Semua Berita</h2>
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {newsItems.map((news, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800 hover:border-green-500/30"
            >
              <div className="h-40 md:h-48 relative">
                <img
                  src={news.image}
                  className="w-full h-full object-cover"
                  alt={news.title}
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
          ))}
        </div>
      </section>

      {/* Dashboard Section */}
      <section id="kepeg" className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard Kepegawaian</h1>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Filter berdasarkan Golongan</label>
              <select 
                value={selectedGolongan} 
                onChange={(e) => setSelectedGolongan(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {golonganOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Filter berdasarkan Status</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 hover:border-green-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2">Jumlah Pegawai</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">{filteredData.length}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 hover:border-green-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2">Pegawai Aktif</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">363</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 hover:border-green-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2">Pegawai PNS</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">285</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 hover:border-green-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2">Pegawai Non-PNS</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">78</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
              <ReusableDoughnutChart
                jsonData={filteredData}
                dataKey={"Generasi"}
                chartTitle={"Distribusi Pegawai berdasarkan Generasi"}
              />
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700">
              <ReusableDoughnutChart
                jsonData={filteredData}
                dataKey={"JENJANG_PENDIDIKAN"}
                chartTitle={"Distribusi Pegawai berdasarkan Pendidikan"}
              />
            </div>
            <div className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg border border-gray-700 lg:col-span-2">
              <h3 className="text-xl font-bold mb-4 text-center">Distribusi Masa Kerja Pegawai (dalam Tahun)</h3>
              <div className="h-64 md:h-80">
                <Bar data={mkTahunChartData} options={mkTahunChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <h3 className="text-xl font-bold text-green-500 mb-3 md:mb-4">Kemenag Batu Bara</h3>
            <p className="text-gray-400 text-sm">
              Jl. Pendidikan No. 1, Lima Puluh Kota, Batu Bara, Sumatera Utara
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-500 mb-3 md:mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Beranda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Profil</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Layanan</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Kontak</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-500 mb-3 md:mb-4">Kontak</h3>
            <p className="text-gray-400 text-sm">Email: info@kemenagbatubara.go.id</p>
            <p className="text-gray-400 text-sm">Telepon: (0622) 123456</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© 2023 Kementerian Agama Kabupaten Batu Bara. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;