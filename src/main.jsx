// File: src/main.jsx
// Updated to wrap with ThemeProvider and add route for /kontak

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Layanan from './pages/portal/Layanan'
import Profil from "./pages/portal/Profil";
import Kontak from "./pages/portal/Kontak";
import "./index.css"; 
import Dashboard from "./pages/portal/Dashboard";
import { ThemeProvider } from "./context/ThemeContext";
import KompasKiblat from "./pages/portal/KompasKiblat";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/berita" element={<div>Berita Page (TBD)</div>} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kompas-kiblat" element={<KompasKiblat />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
