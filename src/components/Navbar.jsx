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
      className={`fixed w-full z-50 transition-all duration-500 neo-card ${
        scrolled
          ? theme === "dark"
            ? "bg-gray-900/80"
            : "bg-gray-100/80"
          : theme === "dark"
          ? "bg-gradient-to-b from-gray-900/50 to-transparent"
          : "bg-gradient-to-b from-gray-100/50 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-8 flex justify-between items-center py-3 sm:py-4">
        <div className="flex items-center">
          <img
            src={`${scrolled ? `/logo-${theme}.png`: '/logo-kemenag.webp'}`}
            alt="Kemenag Logo"
            className="h-10 sm:h-12 mr-2"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 sm:space-x-6">
          {["Beranda", "Profil", "Berita", "Kontak"].map((item) => (
            <Link
              key={item}
              to={item === "Beranda" ? "/" : item == 'Berita' ? 'https://sumut.kemenag.go.id/beranda/list-pencarian?cari=batu%20bara' : `/${item.toLowerCase()}`}
              className={`neo-button px-3 py-1 text-sm sm:text-base ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              } hover:text-green-500`}
            >
              {item}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={toggleLayananDropdown}
              className={`neo-button px-3 py-1 text-sm sm:text-base ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              } hover:text-green-500`}
            >
              Layanan
            </button>
            {isLayananOpen && (
              <div
                className={`absolute top-full left-0 mt-2 w-48 neo-card ${
                  theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"
                }`}
              >
                {SATKER_OPTIONS.map((satker) => (
                  <button
                    key={satker}
                    onClick={() => {
                      handleSatkerSelect(satker);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-green-500 hover:text-white ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
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
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
              className="sr-only"
            />
            <span
              className={`w-10 h-6 rounded-full transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1)"
                  : "bg-gray-200 box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.5)"
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                } box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2)`}
              ></span>
            </span>
            <span className="ml-2 text-sm">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </label>
        </div>

        {/* Mobile Menu Button and Theme Toggle Switch */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Theme Toggle Switch for Mobile */}
          <label
            className={`relative inline-flex items-center cursor-pointer ${
              theme === "dark" ? "text-yellow-300" : "text-gray-700"
            }`}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
              className="sr-only"
            />
            <span
              className={`w-10 h-6 rounded-full transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), -2px -2px 4px rgba(255, 255, 255, 0.1)"
                  : "bg-gray-200 box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.5)"
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                } box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2)`}
              ></span>
            </span>
            <span className="ml-2 text-sm">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </label>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`neo-button p-2 text-sm ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-5 h-5"
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
          className={`md:hidden mt-2 px-4 py-2 neo-card ${
            theme === "dark" ? "bg-gray-900/50" : "bg-gray-100/50"
          }`}
        >
          {["Beranda", "Profil", "Berita", "Kontak"].map((item) => (
            <Link
              key={item}
              to={item === "Beranda" ? "/" : `/${item.toLowerCase()}`}
              className={`block py-2 text-sm hover:text-green-500 transition-colors ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={toggleLayananDropdown}
              className={`block w-full text-left py-2 text-sm hover:text-green-500 transition-colors ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Layanan
            </button>
            {isLayananOpen && (
              <div
                className={`mt-1 w-full neo-card ${
                  theme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"
                }`}
              >
                {SATKER_OPTIONS.map((satker) => (
                  <button
                    key={satker}
                    onClick={() => {
                      handleSatkerSelect(satker);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-green-500 hover:text-white ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
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
