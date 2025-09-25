import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeContext from "../ThemeContext";

const SATKER_OPTIONS = [
  "Sekjen",
  "Pendidikan",
  "Bimas Islam",
  "Penyelenggara Bimas Kristen",
  "Penyelenggara Zakat Wakaf",
  "Katolik",
];

const Navbar = ({
  scrolled,
  isLayananOpen,
  toggleLayananDropdown,
  handleSatkerSelect,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? theme === "dark"
            ? "bg-black py-2 shadow-lg"
            : "bg-white py-2 shadow-lg"
          : theme === "dark"
          ? "bg-gradient-to-b from-black to-transparent py-4"
          : "bg-gradient-to-b from-white to-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="Kemenag Logo" className="h-12 mr-2" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {["Beranda", "Profil", "Berita", "Kontak"].map((item) => (
            <Link
              key={item}
              to={item === "Beranda" ? "/" : `/${item.toLowerCase()}`}
              className={`hover:text-green-400 transition-colors ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {item}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={toggleLayananDropdown}
              className={`hover:text-green-400 transition-colors ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Layanan
            </button>
            {isLayananOpen && (
              <div
                className={`absolute top-full left-0 mt-2 w-48 border rounded-md shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                {SATKER_OPTIONS.map((satker) => (
                  <button
                    key={satker}
                    onClick={() => {
                      handleSatkerSelect(satker);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 transition-colors hover:bg-green-600 hover:text-white ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {satker}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Switch for Desktop */}
          <label
            className={`relative inline-flex items-center cursor-pointer ${
              theme === "dark" ? "text-yellow-300" : "text-gray-700"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
              className="sr-only"
            />
            <span
              className={`w-10 h-6 rounded-full transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                }`}
              ></span>
            </span>
            <span className="ml-2">{theme === "dark" ? "☀️" : "🌙"}</span>
          </label>
        </div>

        {/* Mobile Menu Button and Theme Toggle Switch */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Theme Toggle Switch for Mobile */}
          <label
            className={`relative inline-flex items-center cursor-pointer ${
              theme === "dark" ? "text-yellow-300" : "text-gray-700"
            }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
              className="sr-only"
            />
            <span
              className={`w-10 h-6 rounded-full transition-colors duration-300 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                }`}
              ></span>
            </span>
            <span className="ml-2">{theme === "dark" ? "☀️" : "🌙"}</span>
          </label>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-md transition-colors ${
              theme === "dark"
                ? "text-white hover:bg-gray-700"
                : "text-gray-900 hover:bg-gray-200"
            }`}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden mt-2 px-4 py-2 border-t ${
            theme === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {["Beranda", "Profil", "Berita", "Kontak"].map((item) => (
            <Link
              key={item}
              to={item === "Beranda" ? "/" : `/${item.toLowerCase()}`}
              className={`block py-2 hover:text-green-400 transition-colors ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={toggleLayananDropdown}
              className={`block w-full text-left py-2 hover:text-green-400 transition-colors ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Layanan
            </button>
            {isLayananOpen && (
              <div
                className={`mt-1 w-full border rounded-md shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                {SATKER_OPTIONS.map((satker) => (
                  <button
                    key={satker}
                    onClick={() => {
                      handleSatkerSelect(satker);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 transition-colors hover:bg-green-600 hover:text-white ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {satker}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;