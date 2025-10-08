import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
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
  const [lembagaData, setLembagaData] = useState([]);
  const [gtkData, setGtkData] = useState([]);

  const API_ENDPOINTS = {
    data: "https://backend-kemenag-batubara.vercel.app/api/data",
    pendidikanLembaga: "/data/Daftar_Lembaga.json",
    pendidikanGTK: "/data/data-gtk.json",
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
    // { id: "rumah-ibadah", name: "Rumah Ibadah", icon: "🕌", color: "from-emerald-600 to-emerald-800" },
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

  // Fetch data untuk Pendidikan & Madrasah
  useEffect(() => {
    const fetchPendidikan = async () => {
      if (selectedSatker !== "pendidikan") return;

      try {
        setLoading(true);
        setError(null);

        // Fetch lembaga data
        const lembagaRes = await fetch(API_ENDPOINTS.pendidikanLembaga, { cache: "no-store" });
        let lembagaJson = [];
        if (lembagaRes.ok) {
          const parsed = await lembagaRes.json();
          lembagaJson = Array.isArray(parsed) ? parsed : (parsed.data || parsed.results || []);
        }

        // Fetch GTK data
        const gtkRes = await fetch(API_ENDPOINTS.pendidikanGTK, { cache: "no-store" });
        let gtkJson = [];
        if (gtkRes.ok) {
          const parsed = await gtkRes.json();
          gtkJson = Array.isArray(parsed) ? parsed : (parsed.results || parsed.data || []);
        }

        setLembagaData(lembagaJson || []);
        setGtkData(gtkJson || []);
      } catch (err) {
        console.error("Error fetching pendidikan data:", err);
        setError("Data Pendidikan & Madrasah belum tersedia atau gagal dimuat.");
        setLembagaData([]);
        setGtkData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendidikan();
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
        return (
          <PendidikanDashboard
            lembagaData={lembagaData}
            gtkData={gtkData}
            theme={theme}
            chartOptions={chartOptions}
          />
        );
      
      case "rumah-ibadah":
        return <ComingSoonSatker name="Rumah Ibadah" theme={theme} />;
      
      case "bimas-islam":
        return <BimasIslamDashboard theme={theme} chartOptions={chartOptions} />;

      case "bimas-kristen":
        return <BimasKristenDashboard theme={theme} chartOptions={chartOptions} />;
      
      case "haji-umrah":
        return <ComingSoonSatker name="Haji & Umrah" theme={theme} />;
      
      default:
        return <ComingSoonSatker name={satkerList.find(s => s.id === selectedSatker)?.name} theme={theme} />;
    }
  };

  if (loading && selectedSatker === 'kepegawaian') {
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
}) => {
  const barChartRef = useRef(null);

  const handleResetFilters = () => {
    onGolonganChange('Semua');
    onStatusChange('Semua');
  };

  const exportToCSV = (rows, filename = 'data.csv') => {
    try {
      if (!rows || !rows.length) return;
      const headers = Array.from(
        rows.reduce((set, row) => {
          Object.keys(row || {}).forEach((k) => set.add(k));
          return set;
        }, new Set())
      );

      const escapeCell = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value).replace(/"/g, '""');
        if (/[",\n]/.test(str)) return `"${str}"`;
        return str;
      };

      const csv = [
        headers.join(','),
        ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  const exportAggToCSV = (rows, key, filename = 'data.csv') => {
    try {
      const counts = (rows || []).reduce((acc, item) => {
        const group = item?.[key] || 'Tidak Ditentukan';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});
      const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const csv = ['Label,Count', ...entries.map(([k, v]) => `"${String(k).replace(/"/g, '""')}",${v}`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Agg CSV export failed:', e);
    }
  };

  const downloadBarAsPNG = (filename = 'masa-kerja.png') => {
    try {
      const chart = barChartRef.current;
      if (!chart) return;
      // react-chartjs-2 exposes ChartJS instance via ref
      const url = (chart?.toBase64Image && chart.toBase64Image()) || chart?.canvas?.toDataURL?.('image/png');
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('PNG export failed:', e);
    }
  };

  return (
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
        <NetflixChartCard
          title="Distribusi Generasi"
          icon="👶"
          theme={theme}
          actions={[
            { label: 'Download CSV', onClick: () => exportAggToCSV(filteredData, 'Generasi', 'distribusi-generasi.csv') },
            { label: 'Reset Filter', onClick: handleResetFilters }
          ]}
        >
          <ReusableDoughnutChart jsonData={filteredData} dataKey={"Generasi"} chartTitle="" />
        </NetflixChartCard>

        <NetflixChartCard
          title="Jenjang Pendidikan"
          icon="🎓"
          theme={theme}
          actions={[
            { label: 'Download CSV', onClick: () => exportAggToCSV(filteredData, 'JENJANG_PENDIDIKAN', 'jenjang-pendidikan.csv') },
            { label: 'Reset Filter', onClick: handleResetFilters }
          ]}
        >
          <ReusableDoughnutChart jsonData={filteredData} dataKey={"JENJANG_PENDIDIKAN"} chartTitle="" />
        </NetflixChartCard>
      </div>

      <div className="chart-full">
        <NetflixChartCard
          title="Masa Kerja Pegawai"
          icon="⏱️"
          theme={theme}
          fullWidth
          actions={[
            { label: 'Download PNG', onClick: () => downloadBarAsPNG('masa-kerja.png') },
            { label: 'Download CSV', onClick: () => exportToCSV(filteredData, 'pegawai.csv') }
          ]}
        >
          <div className="bar-chart-wrapper">
            <Bar ref={barChartRef} data={mkTahunChartData} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>
    </div>
  );
};

// Komponen Dashboard Pendidikan & Madrasah
const PendidikanDashboard = ({ lembagaData, gtkData, theme, chartOptions }) => {
  const kecamatanBarRef = useRef(null);
  const gtkBarRef = useRef(null);

  // Helpers
  const exportAggToCSV = (entries, headers, filename) => {
    try {
      const csvLines = [headers.join(',')].concat(
        entries.map(row => headers.map(h => {
          const val = row[h] ?? '';
          const str = String(val).replace(/"/g, '""');
          return /[",\n]/.test(str) ? `"${str}"` : str;
        }).join(','))
      );
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error('CSV export failed:', e); }
  };

  const downloadBarAsPNG = (ref, filename) => {
    try {
      const chart = ref.current;
      if (!chart) return;
      const url = (chart?.toBase64Image && chart.toBase64Image()) || chart?.canvas?.toDataURL?.('image/png');
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) { console.error('PNG export failed:', e); }
  };

  // Derived data
  const totalLembaga = lembagaData.length;
  const negeriCount = useMemo(() => lembagaData.filter(x => (x.Status || x["Status"])?.toString().toLowerCase().includes('negeri')).length, [lembagaData]);
  const swastaCount = useMemo(() => lembagaData.filter(x => (x.Status || x["Status"])?.toString().toLowerCase().includes('swasta')).length, [lembagaData]);

  const totalGTK = useMemo(() => {
    const list = Array.isArray(gtkData) ? gtkData : (gtkData?.results || []);
    return list.reduce((sum, r) => sum + (r?.institution_personnel_count?.personnel_total || 0), 0);
  }, [gtkData]);

  // Lembaga per Kecamatan (Top 10)
  const kecamatanChart = useMemo(() => {
    const counts = (lembagaData || []).reduce((acc, item) => {
      const key = item?.Kecamatan || item?.kecamatan || 'Tidak Ditentukan';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = sorted.map(([k]) => k);
    const data = sorted.map(([, v]) => v);
    return {
      data: {
        labels,
        datasets: [{
          label: 'Jumlah Lembaga',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }]
      },
      csv: labels.map((k, i) => ({ Kecamatan: k, Jumlah: data[i] }))
    };
  }, [lembagaData]);

  // GTK per Jenjang (Guru vs Tendik)
  const gtkPerJenjang = useMemo(() => {
    const jenjangByNpsn = new Map();
    const jenjangByNsm = new Map();
    for (const l of lembagaData || []) {
      if (l.NPSN) jenjangByNpsn.set(String(l.NPSN), l.Jenjang || l["Jenjang"]);
      if (l.NSM) jenjangByNsm.set(String(l.NSM), l.Jenjang || l["Jenjang"]);
    }
    const agg = {};
    const list = Array.isArray(gtkData) ? gtkData : (gtkData?.results || []);
    for (const r of list) {
      const keyJenjang = jenjangByNpsn.get(String(r.npsn)) || jenjangByNsm.get(String(r.nsm)) || 'Tidak Ditentukan';
      const pc = r.institution_personnel_count || {};
      const guru = (pc.teacher_with_assignment || 0) + (pc.teacher_without_assignment || 0);
      const tendik = (pc.education_staff_with_assignment || 0) + (pc.education_staff_without_assignment || 0);
      if (!agg[keyJenjang]) agg[keyJenjang] = { guru: 0, tendik: 0 };
      agg[keyJenjang].guru += guru;
      agg[keyJenjang].tendik += tendik;
    }
    const labels = Object.keys(agg);
    const guruData = labels.map(k => agg[k].guru);
    const tendikData = labels.map(k => agg[k].tendik);
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Guru',
            data: guruData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            stack: 'stack1'
          },
          {
            label: 'Tendik',
            data: tendikData,
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 1,
            stack: 'stack1'
          }
        ]
      },
      csv: labels.map((k, i) => ({ Jenjang: k, Guru: guruData[i], Tendik: tendikData[i], Total: guruData[i] + tendikData[i] }))
    };
  }, [lembagaData, gtkData]);

  // Actions builders
  const csvExport = (rows, filename, headers) => {
    const entries = rows.map(r => {
      if (headers) return headers.reduce((o, h) => (o[h] = r[h], o), {});
      return r;
    });
    exportAggToCSV(entries, headers || Object.keys(entries[0] || {}), filename);
  };

  // Render
  return (
    <div className="kepegawaian-content">
      {/* Statistik */}
      <div className="stats-row">
        <NetflixStatCard label="Total Lembaga" value={totalLembaga} icon="🏫" color="blue" theme={theme} />
        <NetflixStatCard label="Lembaga Negeri" value={negeriCount} icon="🏛️" color="green" theme={theme} />
        <NetflixStatCard label="Lembaga Swasta" value={swastaCount} icon="🏢" color="purple" theme={theme} />
        <NetflixStatCard label="Total GTK" value={totalGTK} icon="👥" color="orange" theme={theme} />
      </div>

      {/* Bar: Lembaga per Kecamatan (Top 10) */}
      <div className="chart-full">
        <NetflixChartCard
          title="Lembaga per Kecamatan (Top 10)"
          icon="📊"
          theme={theme}
          fullWidth
          actions={[
            { label: 'Download PNG', onClick: () => downloadBarAsPNG(kecamatanBarRef, 'lembaga-per-kecamatan.png') },
            { label: 'Download CSV', onClick: () => csvExport(kecamatanChart.csv, 'lembaga-per-kecamatan.csv', ['Kecamatan','Jumlah']) }
          ]}
        >
          <div className="bar-chart-wrapper">
            <Bar ref={kecamatanBarRef} data={kecamatanChart.data} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* Doughnut: Distribusi Jenjang */}
      <div className="charts-row">
        <NetflixChartCard
          title="Distribusi Jenjang Madrasah"
          icon="🎓"
          theme={theme}
          actions={[
            { label: 'Download CSV', onClick: () => {
              const counts = (lembagaData || []).reduce((a, x) => { const k = x.Jenjang || x['Jenjang'] || 'Tidak Ditentukan'; a[k]=(a[k]||0)+1; return a; }, {});
              const rows = Object.entries(counts).map(([k,v])=>({ Jenjang:k, Jumlah:v }));
              csvExport(rows, 'distribusi-jenjang.csv', ['Jenjang','Jumlah']);
            } }
          ]}
        >
          <ReusableDoughnutChart jsonData={lembagaData} dataKey={"Jenjang"} chartTitle="" />
        </NetflixChartCard>

        {/* Doughnut: Status Madrasah */}
        <NetflixChartCard
          title="Status Madrasah"
          icon="📍"
          theme={theme}
          actions={[
            { label: 'Download CSV', onClick: () => {
              const counts = (lembagaData || []).reduce((a, x) => { const k = x.Status || x['Status'] || 'Tidak Ditentukan'; a[k]=(a[k]||0)+1; return a; }, {});
              const rows = Object.entries(counts).map(([k,v])=>({ Status:k, Jumlah:v }));
              csvExport(rows, 'status-madrasah.csv', ['Status','Jumlah']);
            } }
          ]}
        >
          <ReusableDoughnutChart jsonData={lembagaData} dataKey={"Status"} chartTitle="" />
        </NetflixChartCard>
      </div>

      {/* Doughnut: Afiliasi Organisasi */}
      <div className="chart-full">
        <NetflixChartCard
          title="Afiliasi Organisasi Madrasah"
          icon="🤝"
          theme={theme}
          fullWidth
          actions={[
            { label: 'Download CSV', onClick: () => {
              const counts = (lembagaData || []).reduce((a, x) => { const k = x['Afiliasi Organisasi'] || 'Tidak Ditentukan'; a[k]=(a[k]||0)+1; return a; }, {});
              const rows = Object.entries(counts).map(([k,v])=>({ Afiliasi:k, Jumlah:v }));
              csvExport(rows, 'afiliasi-organisasi.csv', ['Afiliasi','Jumlah']);
            } }
          ]}
        >
          <ReusableDoughnutChart jsonData={lembagaData} dataKey={"Afiliasi Organisasi"} chartTitle="" />
        </NetflixChartCard>
      </div>

      {/* Bar: GTK per Jenjang */}
      <div className="chart-full">
        <NetflixChartCard
          title="GTK per Jenjang (Guru vs Tendik)"
          icon="👩‍🏫"
          theme={theme}
          fullWidth
          actions={[
            { label: 'Download PNG', onClick: () => downloadBarAsPNG(gtkBarRef, 'gtk-per-jenjang.png') },
            { label: 'Download CSV', onClick: () => csvExport(gtkPerJenjang.csv, 'gtk-per-jenjang.csv', ['Jenjang','Guru','Tendik','Total']) }
          ]}
        >
          <div className="bar-chart-wrapper">
            <Bar ref={gtkBarRef} data={gtkPerJenjang.data} options={{
              ...chartOptions,
              scales: {
                x: { ...(chartOptions.scales?.x||{}), stacked: true },
                y: { ...(chartOptions.scales?.y||{}), stacked: true }
              }
            }} />
          </div>
        </NetflixChartCard>
      </div>
    </div>
  );
};

// Komponen Bimas Islam (submenu: Peristiwa Nikah, Masjid)
const BimasIslamDashboard = ({ theme, chartOptions }) => {
  const [subTab, setSubTab] = useState('nikah'); // 'nikah' | 'masjid'
  return (
    <div className="kepegawaian-content">
      <div className="filter-row" style={{ justifyContent: 'flex-start' }}>
        <button className={`satker-card ${subTab === 'nikah' ? 'active' : ''}`} onClick={() => setSubTab('nikah')}>
          <div className={`card-gradient bg-gradient-to-br from-teal-600 to-teal-800`}></div>
          <div className="card-content"><span className="card-icon">💍</span><span className="card-text">Peristiwa Nikah</span></div>
          <div className="card-shine"></div>
        </button>
        <button className={`satker-card ${subTab === 'masjid' ? 'active' : ''}`} onClick={() => setSubTab('masjid')}>
          <div className={`card-gradient bg-gradient-to-br from-emerald-600 to-emerald-800`}></div>
          <div className="card-content"><span className="card-icon">🕌</span><span className="card-text">Masjid</span></div>
          <div className="card-shine"></div>
        </button>
      </div>
      {subTab === 'nikah' ? (
        <PeristiwaNikahView theme={theme} chartOptions={chartOptions} />
      ) : (
        <MasjidView theme={theme} chartOptions={chartOptions} />
      )}
    </div>
  );
};

// Helpers: CSV Parser (handles quotes)
const parseCSV = (text) => {
  const rows = [];
  let i = 0, cur = '', row = [], inQuotes = false;
  const pushCell = () => { row.push(cur); cur = ''; };
  for (; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else { cur += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') pushCell();
      else if (ch === '\n' || ch === '\r') {
        if (cur !== '' || row.length) { pushCell(); rows.push(row); row = []; }
        // skip consecutive CRLF
        if (ch === '\r' && text[i + 1] === '\n') i++;
      } else { cur += ch; }
    }
  }
  if (cur !== '' || row.length) { pushCell(); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter(r => r.some(c => c && c.trim() !== '')).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
    return obj;
  });
};

// Peristiwa Nikah View (sanitize & visualize)
const PeristiwaNikahView = ({ theme, chartOptions }) => {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/data_nikah.json', { cache: 'no-store' });
        let json = [];
        if (res.ok) {
          const parsed = await res.json();
          // Flatten possible nested arrays
          const flatten = (arr) => arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flatten(x) : x), []);
          json = Array.isArray(parsed) ? flatten(parsed) : [];
        }
        setRaw(json);
      } catch (e) {
        console.error('Nikah fetch error', e);
        setRaw([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const dataSanitized = useMemo(() => {
    const keepKeys = new Set(['nama_kabupaten','nama_kecamatan','nama_desa','nikah_di','tanggal_akad_filter']);
    return (raw || []).map(r => Object.keys(r).reduce((o,k)=>{
      if (keepKeys.has(k)) o[k] = r[k];
      return o;
    }, {})).filter(x => x && (x.tanggal_akad_filter || x.nikah_di));
  }, [raw]);

  // Derived aggregations
  const monthKey = (d) => {
    const s = String(d||'');
    // expecting YYYY-MM-DD
    const m = s.match(/(\d{4})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}` : 'Tidak Diketahui';
  };

  const perBulan = useMemo(() => {
    const counts = {};
    for (const r of dataSanitized) {
      const m = monthKey(r.tanggal_akad_filter);
      counts[m] = (counts[m] || 0) + 1;
    }
    const labels = Object.keys(counts).sort();
    return { labels, data: labels.map(l => counts[l]) };
  }, [dataSanitized]);

  const stackedByLokasi = useMemo(() => {
    const matrix = {};
    const categories = new Set();
    const months = new Set();
    for (const r of dataSanitized) {
      const m = monthKey(r.tanggal_akad_filter);
      const k = r.nikah_di || 'Tidak Diketahui';
      categories.add(k);
      months.add(m);
      matrix[m] = matrix[m] || {};
      matrix[m][k] = (matrix[m][k] || 0) + 1;
    }
    const labels = Array.from(months).sort();
    const cats = Array.from(categories);
    const datasets = cats.map((c, idx) => ({
      label: c,
      data: labels.map(m => matrix[m]?.[c] || 0),
      backgroundColor: `hsla(${(idx*67)%360}, 70%, 50%, 0.8)`,
      borderColor: `hsla(${(idx*67)%360}, 70%, 45%, 1)`,
      borderWidth: 1,
      stack: 'lokasi'
    }));
    return { labels, datasets };
  }, [dataSanitized]);

  const perKecamatan = useMemo(() => {
    const c = {};
    for (const r of dataSanitized) {
      const k = r.nama_kecamatan || 'Tidak Diketahui';
      c[k] = (c[k] || 0) + 1;
    }
    const entries = Object.entries(c).sort((a,b)=>b[1]-a[1]);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [dataSanitized]);

  const perDesaTop = useMemo(() => {
    const c = {};
    for (const r of dataSanitized) {
      const k = r.nama_desa || 'Tidak Diketahui';
      c[k] = (c[k] || 0) + 1;
    }
    const entries = Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [dataSanitized]);

  const doughnutNikahDi = useMemo(() => {
    // Leverage reusable doughnut via component directly
    return null;
  }, []);

  if (loading) {
    return (
      <div className="chart-full"><div style={{ padding: 24 }}>Memuat data peristiwa nikah...</div></div>
    );
  }

  return (
    <>
      {/* 1. Bar: Peristiwa per Bulan */}
      <div className="chart-full">
        <NetflixChartCard title="Peristiwa Nikah per Bulan" icon="📅" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: perBulan.labels,
              datasets: [{
                label: 'Jumlah Nikah',
                data: perBulan.data,
                backgroundColor: 'rgba(34,197,94,0.8)',
                borderColor: 'rgba(34,197,94,1)',
                borderWidth: 1,
              }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 2. Stacked: Peristiwa Nikah per Bulan per Lokasi (nikah_di) */}
      <div className="chart-full">
        <NetflixChartCard title="Peristiwa Nikah per Bulan berdasarkan Lokasi (nikah_di)" icon="🏛️" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={stackedByLokasi} options={{
              ...chartOptions,
              scales: {
                x: { ...(chartOptions.scales?.x||{}), stacked: true },
                y: { ...(chartOptions.scales?.y||{}), stacked: true }
              }
            }} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 3. Bar: Per Kecamatan */}
      <div className="chart-full">
        <NetflixChartCard title="Peristiwa Nikah per Kecamatan" icon="🗺️" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: perKecamatan.labels,
              datasets: [{
                label: 'Jumlah Nikah',
                data: perKecamatan.data,
                backgroundColor: 'rgba(59,130,246,0.8)',
                borderColor: 'rgba(59,130,246,1)',
                borderWidth: 1,
              }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 4. Doughnut: Komposisi Lokasi Nikah */}
      <div className="charts-row">
        <NetflixChartCard title="Komposisi Lokasi Nikah (nikah_di)" icon="🥧" theme={theme}>
          <ReusableDoughnutChart jsonData={dataSanitized} dataKey={'nikah_di'} chartTitle="" />
        </NetflixChartCard>

        {/* 5. Bar: Top 10 Desa */}
        <NetflixChartCard title="Top 10 Desa Lokasi Peristiwa Nikah" icon="🏘️" theme={theme}>
          <div style={{ height: 280 }}>
            <Bar data={{
              labels: perDesaTop.labels,
              datasets: [{
                label: 'Jumlah Nikah',
                data: perDesaTop.data,
                backgroundColor: 'rgba(234,179,8,0.8)',
                borderColor: 'rgba(234,179,8,1)',
                borderWidth: 1,
              }]
            }} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </NetflixChartCard>
      </div>
    </>
  );
};

// Masjid View (sanitize columns & visualize)
const MasjidView = ({ theme, chartOptions }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/data_masjid.csv', { cache: 'no-store' });
        if (!res.ok) throw new Error('Masjid CSV not found');
        const text = await res.text();
        const parsed = parseCSV(text);
        const dropCols = new Set(["No. Telp/HP","Email","Latitude","Longitude","Lokasi Peta","Profil Masjid"]);
        const numCols = ["Luas Tanah","Luas Bangunan","Tahun Berdiri","Jamaah","Imam","Khatib","Muazin","Remaja"]; 
        const clean = parsed.map(r => {
          const o = {};
          for (const k of Object.keys(r)) {
            if (dropCols.has(k)) continue;
            o[k] = r[k];
          }
          for (const k of numCols) {
            if (k in o) {
              const v = String(o[k] ?? '').trim();
              const n = v === '' ? null : Number(v.replace(/[^0-9.-]/g,''));
              o[k] = Number.isFinite(n) ? n : null;
            }
          }
          return o;
        });
        setRows(clean);
      } catch (e) {
        console.error('Masjid fetch error', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const countPerKec = useMemo(() => {
    const c = {};
    for (const r of rows) {
      const k = r.Kecamatan || r.kecamatan || 'Tidak Diketahui';
      c[k] = (c[k] || 0) + 1;
    }
    const entries = Object.entries(c).sort((a,b)=>b[1]-a[1]);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [rows]);

  const avgJamaahPerKec = useMemo(() => {
    const agg = {};
    for (const r of rows) {
      const k = r.Kecamatan || r.kecamatan || 'Tidak Diketahui';
      const v = r.Jamaah;
      if (v == null) continue;
      agg[k] = agg[k] || { sum: 0, n: 0 };
      agg[k].sum += v; agg[k].n += 1;
    }
    const entries = Object.entries(agg).map(([k,{sum,n}])=>[k, sum/n]).sort((a,b)=>b[1]-a[1]);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>Math.round(e[1])) };
  }, [rows]);

  const histTahunBerdiri = useMemo(() => {
    const c = {};
    for (const r of rows) {
      const y = r['Tahun Berdiri'];
      if (!y) continue;
      const d = Math.floor(y/10)*10;
      const label = `${d}-${d+9}`;
      c[label] = (c[label]||0)+1;
    }
    const entries = Object.entries(c).sort((a,b)=>a[0].localeCompare(b[0]));
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [rows]);

  const sumLuasBangunanPerKec = useMemo(() => {
    const agg = {};
    for (const r of rows) {
      const k = r.Kecamatan || r.kecamatan || 'Tidak Diketahui';
      const v = r['Luas Bangunan'];
      if (v == null) continue;
      agg[k] = (agg[k]||0) + v;
    }
    const entries = Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,12);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [rows]);

  if (loading) {
    return (
      <div className="chart-full"><div style={{ padding: 24 }}>Memuat data masjid...</div></div>
    );
  }

  return (
    <>
      {/* 1. Bar: Jumlah Masjid per Kecamatan */}
      <div className="chart-full">
        <NetflixChartCard title="Jumlah Masjid per Kecamatan" icon="📊" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: countPerKec.labels,
              datasets: [{ label: 'Masjid', data: countPerKec.data, backgroundColor: 'rgba(59,130,246,0.8)', borderColor: 'rgba(59,130,246,1)', borderWidth: 1 }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 2. Doughnut: Tipologi Masjid */}
      <div className="charts-row">
        <NetflixChartCard title="Distribusi Tipologi Masjid" icon="🧭" theme={theme}>
          <ReusableDoughnutChart jsonData={rows} dataKey={'Tipologi'} chartTitle="" />
        </NetflixChartCard>

        {/* 3. Rata-rata Jamaah per Kecamatan */}
        <NetflixChartCard title="Rata-rata Jamaah per Kecamatan" icon="👥" theme={theme}>
          <div style={{ height: 280 }}>
            <Bar data={{
              labels: avgJamaahPerKec.labels,
              datasets: [{ label: 'Rata-rata Jamaah', data: avgJamaahPerKec.data, backgroundColor: 'rgba(34,197,94,0.8)', borderColor: 'rgba(34,197,94,1)', borderWidth: 1 }]
            }} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 4. Histogram: Tahun Berdiri (Dekade) */}
      <div className="chart-full">
        <NetflixChartCard title="Sebaran Tahun Berdiri (per Dekade)" icon="📆" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: histTahunBerdiri.labels,
              datasets: [{ label: 'Jumlah Masjid', data: histTahunBerdiri.data, backgroundColor: 'rgba(234,88,12,0.8)', borderColor: 'rgba(234,88,12,1)', borderWidth: 1 }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 5. Total Luas Bangunan per Kecamatan (Top 12) */}
      <div className="chart-full">
        <NetflixChartCard title="Total Luas Bangunan per Kecamatan (Top 12)" icon="📐" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: sumLuasBangunanPerKec.labels,
              datasets: [{ label: 'Luas Bangunan (m²)', data: sumLuasBangunanPerKec.data, backgroundColor: 'rgba(147,51,234,0.8)', borderColor: 'rgba(147,51,234,1)', borderWidth: 1 }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>
    </>
  );
};

// Bimas Kristen: Data Gereja
const BimasKristenDashboard = ({ theme, chartOptions }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch('/data/data_gereja.csv', { cache: 'no-store' });
        if (!res.ok) throw new Error('Gereja CSV not found');
        const text = await res.text();
        const parsed = parseCSV(text);
        // Pick only relevant public columns
        const clean = parsed.map(r => {
          return {
            nama_gereja: r['nama_gereja'],
            jumlah_anggota_jemaat: (() => {
              const v = String(r['jumlah_anggota_jemaat']||'').replace(/[^0-9.-]/g,'');
              const n = v === '' ? null : Number(v);
              return Number.isFinite(n) ? n : null;
            })(),
            status_gedung_gereja: r['status_gedung_gereja'],
            kecamatan: r['kecamatan']
          };
        });
        setRows(clean);
      } catch (e) {
        console.error('Gereja fetch error', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const countPerKec = useMemo(() => {
    const c = {};
    for (const r of rows) {
      const k = r.kecamatan || 'Tidak Diketahui';
      c[k] = (c[k] || 0) + 1;
    }
    const entries = Object.entries(c).sort((a,b)=>b[1]-a[1]);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [rows]);

  const sumJemaatPerKec = useMemo(() => {
    const c = {};
    for (const r of rows) {
      const k = r.kecamatan || 'Tidak Diketahui';
      const v = r.jumlah_anggota_jemaat;
      if (v == null) continue;
      c[k] = (c[k] || 0) + v;
    }
    const entries = Object.entries(c).sort((a,b)=>b[1]-a[1]);
    return { labels: entries.map(e=>e[0]), data: entries.map(e=>e[1]) };
  }, [rows]);

  const topGereja = useMemo(() => {
    const filtered = rows.filter(r => r.jumlah_anggota_jemaat != null);
    const sorted = filtered.sort((a,b)=>b.jumlah_anggota_jemaat - a.jumlah_anggota_jemaat).slice(0,10);
    return { labels: sorted.map(r=>r.nama_gereja), data: sorted.map(r=>r.jumlah_anggota_jemaat) };
  }, [rows]);

  const binsJemaat = useMemo(() => {
    const bins = {
      '0-49': 0,
      '50-99': 0,
      '100-199': 0,
      '200-499': 0,
      '500+': 0
    };
    for (const r of rows) {
      const v = r.jumlah_anggota_jemaat;
      if (v == null) continue;
      if (v < 50) bins['0-49']++; else if (v < 100) bins['50-99']++; else if (v < 200) bins['100-199']++; else if (v < 500) bins['200-499']++; else bins['500+']++;
    }
    const labels = Object.keys(bins);
    return { labels, data: labels.map(k=>bins[k]) };
  }, [rows]);

  if (loading) {
    return (
      <div className="chart-full"><div style={{ padding: 24 }}>Memuat data gereja...</div></div>
    );
  }

  return (
    <div className="kepegawaian-content">
      {/* Submenu (single section) */}
      <div className="filter-row" style={{ justifyContent: 'flex-start' }}>
        <button className={`satker-card active`}>
          <div className={`card-gradient bg-gradient-to-br from-amber-600 to-amber-800`}></div>
          <div className="card-content"><span className="card-icon">⛪</span><span className="card-text">Gereja</span></div>
          <div className="card-shine"></div>
        </button>
      </div>

      {/* 1. Jumlah Gereja per Kecamatan */}
      <div className="chart-full">
        <NetflixChartCard title="Jumlah Gereja per Kecamatan" icon="📊" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: countPerKec.labels,
              datasets: [{ label: 'Gereja', data: countPerKec.data, backgroundColor: 'rgba(59,130,246,0.8)', borderColor: 'rgba(59,130,246,1)', borderWidth: 1 }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 2. Doughnut: Status Gedung */}
      <div className="charts-row">
        <NetflixChartCard title="Status Gedung Gereja" icon="🏛️" theme={theme}>
          <ReusableDoughnutChart jsonData={rows} dataKey={'status_gedung_gereja'} chartTitle="" />
        </NetflixChartCard>

        {/* 3. Total Anggota Jemaat per Kecamatan */}
        <NetflixChartCard title="Total Anggota Jemaat per Kecamatan" icon="👥" theme={theme}>
          <div style={{ height: 280 }}>
            <Bar data={{
              labels: sumJemaatPerKec.labels,
              datasets: [{ label: 'Anggota', data: sumJemaatPerKec.data, backgroundColor: 'rgba(34,197,94,0.8)', borderColor: 'rgba(34,197,94,1)', borderWidth: 1 }]
            }} options={{ ...chartOptions, maintainAspectRatio: false }} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 4. Top 10 Gereja berdasarkan Anggota */}
      <div className="chart-full">
        <NetflixChartCard title="Top 10 Gereja berdasarkan Jumlah Anggota" icon="🏅" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: topGereja.labels,
              datasets: [{ label: 'Anggota Jemaat', data: topGereja.data, backgroundColor: 'rgba(234,179,8,0.8)', borderColor: 'rgba(234,179,8,1)', borderWidth: 1 }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>

      {/* 5. Histogram Anggota Jemaat */}
      <div className="chart-full">
        <NetflixChartCard title="Sebaran Jumlah Anggota Jemaat" icon="📈" theme={theme} fullWidth>
          <div className="bar-chart-wrapper">
            <Bar data={{
              labels: binsJemaat.labels,
              datasets: [{ label: 'Gereja', data: binsJemaat.data, backgroundColor: 'rgba(147,51,234,0.8)', borderColor: 'rgba(147,51,234,1)', borderWidth: 1 }]
            }} options={chartOptions} />
          </div>
        </NetflixChartCard>
      </div>
    </div>
  );
};

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
      <div className="stat-value">{Number(value||0).toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
    <div className="stat-glow"></div>
  </div>
);

// Komponen Netflix ChartCard
const NetflixChartCard = ({ title, icon, children, fullWidth = false, theme, actions = [], onActionClick }) => {
  const [open, setOpen] = useState(false);
  const hasMenu = Array.isArray(actions) && actions.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasMenu) setOpen((o) => !o);
    else if (onActionClick) onActionClick();
  };

  const handleItem = (fn) => {
    setOpen(false);
    if (typeof fn === 'function') fn();
  };

  return (
    <div className={`netflix-chart-card ${fullWidth ? 'full-width' : ''}`}>
      <div className="chart-header" style={{ position: 'relative' }}>
        <div className="chart-title-group">
          <span className="chart-icon">{icon}</span>
          <h3 className="chart-title">{title}</h3>
        </div>
        <button
          className="chart-action"
          type="button"
          onClick={handleToggle}
          aria-label={`Action for ${title}`}
          title="Action"
        >
          <span>⋯</span>
        </button>
        {hasMenu && open && (
          <div
            className="chart-action-menu"
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 8,
              zIndex: 20,
              minWidth: 160,
              background: 'var(--menu-bg, #111)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}
          >
            {actions.map((act, idx) => (
              <button
                key={idx}
                type="button"
                className="chart-action-item"
                onClick={() => handleItem(act.onClick)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};

export default Dashboard;