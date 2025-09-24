import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, scrolled = false }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar 
        scrolled={scrolled} 
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
      />
      <main>{children}</main>
      <Footer isDarkTheme={isDarkTheme} />
    </div>
  );
};

export default Layout;