// File: src/components/Navbar.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeContext from "../ThemeContext";

const SATKER_OPTIONS = [
  "Sekjen",
  "Pendidikan",
  "Bimas Islam",
  "Bimas Kristen",
  "Penyelenggara Zakat Wakaf",
  "Penyelenggara Khatolik"
];

const Navbar = ({ scrolled, isLayananOpen, toggleLayananDropdown, handleSatkerSelect }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? theme === 'dark' 
          ? 'bg-black py-2 shadow-lg' 
          : 'bg-white py-2 shadow-lg'
        : theme === 'dark'
          ? 'bg-gradient-to-b from-black to-transparent py-4'
          : 'bg-gradient-to-b from-white to-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Kemenag Logo" 
            className="h-12 mr-2"
          />          
        </div>
        
        <div className="hidden md:flex space-x-6 items-center">
          {['Beranda', 'Profil', 'Berita', 'Kontak'].map((item) => (
            <Link 
              key={item} 
              to={item === 'Beranda' ? '/' : `/${item.toLowerCase()}`} 
              className={`hover:text-green-400 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {item}
            </Link>
          ))}
          
          <div className="relative">
            <button 
              onClick={toggleLayananDropdown}
              className={`hover:text-green-400 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Layanan
            </button>
            {isLayananOpen && (
              <div className={`absolute top-full left-0 mt-2 w-48 border rounded-md shadow-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                {SATKER_OPTIONS.map((satker) => (
                  <button
                    key={satker}
                    onClick={() => handleSatkerSelect(satker)}
                    className={`block w-full text-left px-4 py-2 transition-colors hover:bg-green-600 hover:text-white ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {satker}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        <button className={`px-4 py-2 rounded-md transition-colors ${
          theme === 'dark' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}>
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;