// File: src/main.jsx
// Updated to wrap with ThemeProvider and add route for /kontak

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import App from './App';
import Layanan from './Layanan';
import Profil from './Profil';
import Kontak from './Kontak';
import './index.css'; // Assuming you have a global CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/berita" element={<div>Berita Page (TBD)</div>} />
          <Route path="/kontak" element={<Kontak />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);