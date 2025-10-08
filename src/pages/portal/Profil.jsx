// File: src/Profil.jsx
// Updated to use reusable Navbar and Footer, and add Leaflet map for /api/tilok data

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "../../App.css";
import { RunningTicker, PrayerTimesWidget } from "../../components/PortalWidgets";

// Note: Assume react-leaflet and leaflet are installed: npm install react-leaflet leaflet

const ProfilSection = () => {
  const [tilokData, setTilokData] = useState([]);

  useEffect(() => {
    const fetchTilok = async () => {
      try {
        const response = await fetch('https://backend-kemenag-batubara.vercel.app/api/tilok');
        const json = await response.json();
        if (json.success) {
          setTilokData(json.data);
        }
      } catch (err) {
        console.error("Error fetching tilok data:", err);
      }
    };
    fetchTilok();
  }, []);

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Profil Kemenag Kab. Batu Bara</h2>
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8">
        <h3 className="text-xl font-bold mb-4 text-green-400">Visi</h3>
        <p className="text-gray-300 mb-6">
          Menjadi Kementerian Agama yang profesional, terpercaya, dan melayani dalam mewujudkan masyarakat yang religius, harmonis, dan sejahtera.
        </p>
        <h3 className="text-xl font-bold mb-4 text-green-400">Misi</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Meningkatkan kualitas kehidupan beragama masyarakat.</li>
          <li>Memperkuat kerukunan umat beragama.</li>
          <li>Menyelenggarakan pelayanan keagamaan yang prima.</li>
          <li>Meningkatkan tata kelola yang bersih dan akuntabel.</li>
        </ul>
      </div>
      <h3 className="text-xl font-bold mb-4 text-green-400">Lokasi Satuan Kerja</h3>
      <div className="h-96">
        <MapContainer center={[3.171246705, 99.42034917]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {tilokData.map((item, index) => (
            <Marker key={index} position={[parseFloat(item.LATITUDE), parseFloat(item.LONGITUDE)]}>
              <Popup>{item["SATUAN KERJA"]}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
};

function Profil() {
  const [isLayananOpen, setIsLayananOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const headlines = [
    "Profil Kemenag Kab. Batu Bara",
    "Visi: Profesional, Terpercaya, Melayani",
    "Misi: Peningkatan kualitas kehidupan beragama"
  ];

  const toggleLayananDropdown = () => {
    setIsLayananOpen(!isLayananOpen);
  };

  const handleSatkerSelect = (satker) => {
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
      <div className="h-16 md:h-20"></div>
      <RunningTicker headlines={headlines} theme={'dark'} />
      <div className="px-4 md:px-8 lg:px-16 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProfilSection />
          </div>
          <div className="md:col-span-1">
            <PrayerTimesWidget theme={'dark'} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profil;