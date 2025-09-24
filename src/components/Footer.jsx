// File: src/components/Footer.jsx
// This is a reusable Footer component that can be imported into App.jsx, Layanan.jsx, Profil.jsx, Kontak.jsx, etc.

import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black border-t border-gray-800 py-8 md:py-12 px-4 md:px-8 lg:px-16">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <FooterSection 
        title="Kemenag Batu Bara"
        content="Jl. Pendidikan No. 1, Lima Puluh Kota, Batu Bara, Sumatera Utara"
      />
      
      <FooterSection 
        title="Tautan Cepat"
        links={['Beranda', 'Profil', 'Layanan', 'Kontak']}
      />
      
      <FooterSection 
        title="Kontak"
        content={
          <>
            <p>Email: info@kemenagbatubara.go.id</p>
            <p>Telepon: (0622) 123456</p>
          </>
        }
      />
    </div>
    
    <div className="max-w-7xl mx-auto mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
      <p>© 2023 Kementerian Agama Kabupaten Batu Bara. All rights reserved.</p>
    </div>
  </footer>
);

const FooterSection = ({ title, content, links }) => (
  <div>
    <h3 className="text-xl font-bold text-green-500 mb-3 md:mb-4">{title}</h3>
    {links ? (
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link}>
            <Link 
              to={link === 'Layanan' ? '/layanan' : link === 'Beranda' ? '/' : `/${link.toLowerCase()}`} 
              className="text-gray-400 hover:text-green-400 transition-colors text-sm"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-gray-400 text-sm">{content}</div>
    )}
  </div>
);

export default Footer;