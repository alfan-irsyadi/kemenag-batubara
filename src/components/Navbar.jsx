import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";

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
  isApp = false
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`fixed w-full z-50 top-0 transition-all duration-500 backdrop-blur-md ${
        scrolled
          ? theme === "dark"
            ? "bg-gray-900/95 shadow-lg"
            : "bg-white/95 shadow-lg"
          : theme === "dark"
          ? "bg-gradient-to-b from-gray-900/80 to-transparent"
          : "bg-gradient-to-b from-white/80 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-8 flex justify-between items-center py-3 sm:py-4">
        <div className="flex items-center">
          {(scrolled || !isApp )? (
            <img
              src={`/logo-${theme}.png`}
              alt="Kemenag Logo"
              className="h-10 sm:h-12 mr-2"
            />
          ) : (
            <div></div>
          )}
        </div>

        {/* Desktop Menu - FIXED SPACING */}
        <div className="hidden md:flex items-center gap-6">
          {["Beranda", "Profil", "Berita", "Kontak", "Dashboard"].map(
            (item) => (
              <Link
                key={item}
                to={
                  item === "Beranda"
                    ? "/"
                    : item === "Berita"
                    ? "https://sumut.kemenag.go.id/beranda/list-pencarian?cari=batu%20bara"
                    : `/${item.toLowerCase()}`
                }
                className={`relative px-3 py-2 text-sm sm:text-base font-medium transition-all duration-300 ${
                  theme === "dark"
                    ? "text-gray-200 hover:text-green-400"
                    : "text-gray-800 hover:text-green-600"
                } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-500 after:transition-all after:duration-300 hover:after:w-full`}
              >
                {item}
              </Link>
            )
          )}

          {/* Layanan Dropdown */}
          <div className="relative">
            <button
              onClick={toggleLayananDropdown}
              className={`relative px-3 py-2 text-sm sm:text-base font-medium transition-all duration-300 ${
                theme === "dark"
                  ? "text-gray-200 hover:text-green-400"
                  : "text-gray-800 hover:text-green-600"
              } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-500 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Satker ▾
            </button>
            {isLayananOpen && (
              <div
                className={`absolute top-full left-0 mt-2 w-64 rounded-lg shadow-2xl backdrop-blur-md border overflow-hidden ${
                  theme === "dark"
                    ? "bg-gray-800/95 border-gray-700"
                    : "bg-white/95 border-gray-200"
                }`}
              >
                {SATKER_OPTIONS.map((satker) => (
                  <button
                    key={satker}
                    onClick={() => {
                      handleSatkerSelect(satker);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      theme === "dark"
                        ? "text-gray-200 hover:bg-green-500/20 hover:text-green-400"
                        : "text-gray-800 hover:bg-green-500/10 hover:text-green-600"
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
            className={`relative inline-flex items-center cursor-pointer ml-2 ${
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
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${
                  theme === "dark" ? "translate-x-6" : "translate-x-0"
                }`}
              ></span>
            </span>
            <span className="ml-3 text-lg">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </label>
        </div>

        {/* Mobile Menu Button and Theme Toggle Switch */}
        <div className="md:hidden flex items-center gap-3">
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
              className={`w-10 h-6 rounded-full transition-all duration-300 relative ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                }`}
              ></span>
            </span>
            <span className="ml-2 text-sm">
              {theme === "dark" ? "☀️" : "🌙"}
            </span>
          </label>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-lg transition-all duration-200 ${
              theme === "dark"
                ? "text-gray-200 hover:bg-gray-800"
                : "text-gray-800 hover:bg-gray-100"
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
          className={`md:hidden mt-2 mx-4 mb-4 rounded-lg shadow-xl backdrop-blur-md border overflow-hidden ${
            theme === "dark"
              ? "bg-gray-900/95 border-gray-800"
              : "bg-white/95 border-gray-200"
          }`}
        >
          {["Beranda", "Profil", "Berita", "Kontak", "Dashboard"].map(
            (item) => (
              <Link
                key={item}
                to={item === "Beranda" ? "/" : `/${item.toLowerCase()}`}
                className={`block py-3 px-4 text-sm font-medium transition-all duration-200 border-b last:border-b-0 ${
                  theme === "dark"
                    ? "text-gray-200 hover:bg-green-500/20 hover:text-green-400 border-gray-800"
                    : "text-gray-800 hover:bg-green-500/10 hover:text-green-600 border-gray-200"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            )
          )}

          <div className="relative">
            <button
              onClick={toggleLayananDropdown}
              className={`block w-full text-left py-3 px-4 text-sm font-medium transition-all duration-200 border-b ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-green-500/20 hover:text-green-400 border-gray-800"
                  : "text-gray-800 hover:bg-green-500/10 hover:text-green-600 border-gray-200"
              }`}
            >
              Satker ▾
            </button>
            {isLayananOpen && (
              <div
                className={`${
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
                    className={`block w-full text-left px-8 py-2.5 text-sm transition-all duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:bg-green-500/20 hover:text-green-400"
                        : "text-gray-700 hover:bg-green-500/10 hover:text-green-600"
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
