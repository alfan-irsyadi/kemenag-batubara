// File: src/Layanan.jsx
// Updated to use reusable Navbar and Footer, and support theme (no direct changes needed, as theme is applied via body class)

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";

const layananData = [
  {
    name: "Sekjen",
    tupoksi: {
      tugasDanFungsi: "Menyelenggarakan koordinasi pelaksanaan tugas, pembinaan, dan pemberian dukungan administrasi kepada seluruh unit organisasi di lingkungan Kementerian Agama.",
      layanan: "Pelayanan administrasi umum, keuangan, dan kepegawaian.",
      sop: "Prosedur standar untuk pengelolaan administrasi dan pelaporan keuangan."
    },
    ikm: "Indeks Kepuasan Masyarakat: 85%"
  },
  {
    name: "Pendidikan",
    tupoksi: {
      tugasDanFungsi: "Menyelenggarakan pembinaan dan pengembangan pendidikan agama dan keagamaan.",
      layanan: "Pelayanan pendidikan madrasah, pesantren, dan kursus keagamaan.",
      sop: "Prosedur standar untuk akreditasi dan kurikulum pendidikan."
    },
    ikm: "Indeks Kepuasan Masyarakat: 90%"
  },
  {
    name: "Bimas Islam",
    tupoksi: {
      tugasDanFungsi: "Menyelenggarakan pembinaan masyarakat Islam dalam bidang keagamaan.",
      layanan: "Pelayanan nikah, talak, rujuk, dan pembinaan keluarga sakinah.",
      sop: "Prosedur standar untuk pelayanan nikah dan pembinaan keluarga."
    },
    ikm: "Indeks Kepuasan Masyarakat: 88%"
  },
  {
    name: "Penyelenggara Bimas Kristen",
    tupoksi: {
      tugasDanFungsi: "Menyelenggarakan pembinaan masyarakat Kristen dalam bidang keagamaan.",
      layanan: "Pelayanan pembinaan umat Kristen dan pendidikan keagamaan Kristen.",
      sop: "Prosedur standar untuk pembinaan rohani dan kegiatan keagamaan."
    },
    ikm: "Indeks Kepuasan Masyarakat: 87%"
  },
  {
    name: "Penyelenggara Zakat Wakaf",
    tupoksi: {
      tugasDanFungsi: "Menyelenggarakan pengelolaan dan pembinaan zakat serta wakaf.",
      layanan: "Pelayanan pengelolaan zakat, wakaf, dan sertifikasi tanah wakaf.",
      sop: "Prosedur standar untuk pengelolaan zakat dan wakaf."
    },
    ikm: "Indeks Kepuasan Masyarakat: 89%"
  },
  {
    name: "Katolik",
    tupoksi: {
      tugasDanFungsi: "Menyelenggarakan pembinaan masyarakat Katolik dalam bidang keagamaan.",
      layanan: "Pelayanan pembinaan umat Katolik dan pendidikan keagamaan Katolik.",
      sop: "Prosedur standar untuk pembinaan rohani dan kegiatan keagamaan."
    },
    ikm: "Indeks Kepuasan Masyarakat: 86%"
  }
];

const LayananSection = () => {
  const location = useLocation();
  const [selectedSatker, setSelectedSatker] = useState(layananData[0].name);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const satkerParam = params.get('satker');
    if (satkerParam) {
      const satker = layananData.find(data => 
        data.name.toLowerCase().replace(/\s+/g, '-') === satkerParam
      )?.name;
      if (satker) setSelectedSatker(satker);
    }
  }, [location.search]);

  const handleSatkerChange = (e) => {
    setSelectedSatker(e.target.value);
  };

  const selectedData = layananData.find(data => data.name === selectedSatker);

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Layanan</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Pilih Satuan Kerja</label>
        <select 
          value={selectedSatker} 
          onChange={handleSatkerChange}
          className="w-full md:w-1/3 bg-gray-800 border border-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {layananData.map(satker => (
            <option key={satker.name} value={satker.name}>{satker.name}</option>
          ))}
        </select>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-green-400">{selectedData.name}</h3>
        <h4 className="text-lg font-semibold mb-2 text-white">Tupoksi</h4>
        <div className="text-gray-300 mb-4">
          <p><strong>Tugas dan Fungsi:</strong> {selectedData.tupoksi.tugasDanFungsi}</p>
          <p><strong>Layanan:</strong> {selectedData.tupoksi.layanan}</p>
          <p><strong>SOP:</strong> {selectedData.tupoksi.sop}</p>
        </div>
        <h4 className="text-lg font-semibold mb-2 text-white">Indeks Kepuasan Masyarakat</h4>
        <p className="text-gray-300">{selectedData.ikm}</p>
      </div>
    </section>
  );
};

function Layanan() {
  const [isLayananOpen, setIsLayananOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleLayananDropdown = () => {
    setIsLayananOpen(!isLayananOpen);
  };

  const handleSatkerSelect = (satker) => {
    // Navigate to layanan with satker param (as in App.jsx)
    navigate(`/layanan?satker=${satker.toLowerCase().replace(/\s+/g, '-')}`);
    setIsLayananOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar 
        scrolled={scrolled} 
        isLayananOpen={isLayananOpen}
        toggleLayananDropdown={toggleLayananDropdown}
        handleSatkerSelect={handleSatkerSelect}
      />      
      <LayananSection />
      <Footer />
    </div>
  );
}

export default Layanan;