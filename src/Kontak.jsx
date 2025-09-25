// File: src/Kontak.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Tambahkan ini
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Kontak() {
  const [isLayananOpen, setIsLayananOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate(); // Tambahkan ini

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
      <section className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Kontak Kami</h2>
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-green-400">Alamat</h3>
          <p className="text-gray-300 mb-6">Jalan Perintis Kemerdekaan, Lima Puluh Kota, Batu Bara, Sumatera Utara</p>
          <h3 className="text-xl font-bold mb-4 text-green-400">Kontak</h3>
          <ul className="text-gray-300 space-y-2">
            <li>Email: kemenagbatubara@gmail.com</li>
            <li>Telepon: (0622) 96408</li>
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Kontak;