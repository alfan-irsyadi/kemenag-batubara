import React, { useEffect, useMemo, useState, useContext } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ThemeContext from '../../context/ThemeContext';
import { RunningTicker } from '../../components/PortalWidgets';

// Utility: compute initial bearing from point A (lat1, lon1) to B (lat2, lon2)
function toRad(deg){ return (deg*Math.PI)/180; }
function toDeg(rad){ return (rad*180)/Math.PI; }
function normalizeDeg(d){ return (d%360+360)%360; }

function bearingToQibla(lat, lon) {
  // Kaaba coordinates (Masjid al-Haram)
  const latK = toRad(21.4225);
  const lonK = toRad(39.8262);
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const Δλ = lonK - λ1;
  const y = Math.sin(Δλ) * Math.cos(latK);
  const x = Math.cos(φ1)*Math.sin(latK) - Math.sin(φ1)*Math.cos(latK)*Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return normalizeDeg(toDeg(θ)); // 0-360
}

const KompasKiblat = () => {
  const { theme } = useContext(ThemeContext);
  const [isLayananOpen, setIsLayananOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [locErr, setLocErr] = useState('');

  const [heading, setHeading] = useState(null); // device heading (0-360, degrees from North)
  const [sensorErr, setSensorErr] = useState('');

  const qibla = useMemo(() => {
    if (lat == null || lon == null) return null;
    return bearingToQibla(lat, lon);
  }, [lat, lon]);

  // Request geolocation
  const getLocation = () => {
    setLocErr('');
    if (!('geolocation' in navigator)) {
      setLocErr('Geolocation tidak tersedia di perangkat ini.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
      },
      (err) => setLocErr(err.message || 'Gagal mendapatkan lokasi.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Device orientation
  const requestSensor = async () => {
    setSensorErr('');
    try {
      const handler = (e) => {
        // Prefer absolute heading if available
        // Some browsers provide webkitCompassHeading (iOS)
        const iosHeading = e.webkitCompassHeading;
        // On Android, compass heading can be computed from alpha
        // alpha is the rotation around z-axis (0 at North), but may need calibration
        let deg = null;
        if (typeof iosHeading === 'number') {
          deg = iosHeading; // iOS already gives degrees from north
        } else if (typeof e.alpha === 'number') {
          // alpha: 0 is device facing north, values increase clockwise
          // Apply absolute if available
          deg = 360 - e.alpha; // normalize to clockwise from North
        }
        if (deg != null) setHeading(normalizeDeg(deg));
      };

      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const resp = await DeviceOrientationEvent.requestPermission();
        if (resp !== 'granted') {
          setSensorErr('Izin sensor ditolak.');
          return;
        }
      }
      window.addEventListener('deviceorientation', handler, true);
      // Cleanup
      return () => window.removeEventListener('deviceorientation', handler, true);
    } catch (e) {
      setSensorErr('Sensor orientasi tidak tersedia.');
    }
  };

  const toggleLayananDropdown = () => setIsLayananOpen(o => !o);
  const handleSatkerSelect = () => setIsLayananOpen(false);

  const diff = useMemo(() => {
    if (qibla == null || heading == null) return null;
    // rotate arrow by difference (qibla relative to current heading)
    return normalizeDeg(qibla - heading);
  }, [qibla, heading]);

  return (
    <div className={`min-h-screen ${theme==='dark'?'bg-black text-white':'bg-white text-black'}`}>
      <Navbar
        scrolled={scrolled}
        isLayananOpen={isLayananOpen}
        toggleLayananDropdown={toggleLayananDropdown}
        handleSatkerSelect={handleSatkerSelect}
      />
      <div className="h-16 md:h-20" />
      <RunningTicker headlines={["Kompas Arah Kiblat","Aktifkan lokasi & izin sensor untuk akurasi"]} theme={theme} />

      <section className="px-4 md:px-8 lg:px-16 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Kompas Arah Kiblat</h1>
        <p className="opacity-80 mb-6 text-sm md:text-base">
          Gunakan kompas ini untuk menentukan arah Kiblat. Aktifkan lokasi dan izinkan akses sensor orientasi (pada perangkat mobile) untuk akurasi yang lebih baik.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <div className={`rounded-xl border ${theme==='dark'?'border-gray-800 bg-gray-900':'border-gray-200 bg-white'} p-6 flex flex-col items-center justify-center`}>
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-green-600 relative overflow-hidden" aria-label="Kompas Kiblat">
                {/* Background compass */}
                <div className="absolute inset-0 flex items-center justify-center text-xs opacity-60 select-none">
                  <div className="absolute top-2">N</div>
                  <div className="absolute right-2">E</div>
                  <div className="absolute bottom-2">S</div>
                  <div className="absolute left-2">W</div>
                </div>
                {/* Needle toward Qibla relative to heading */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-1 bg-green-500 rounded origin-bottom"
                    style={{ height: '40%', transform: `rotate(${diff ?? 0}deg) translateY(-20%)` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm w-full">
                <div className={`rounded-lg p-3 ${theme==='dark'?'bg-gray-800':'bg-gray-100'}`}>
                  <div className="opacity-70">Heading (derajat dari Utara)</div>
                  <div className="font-semibold">{heading != null ? heading.toFixed(0) + '°' : '-'}</div>
                </div>
                <div className={`rounded-lg p-3 ${theme==='dark'?'bg-gray-800':'bg-gray-100'}`}>
                  <div className="opacity-70">Arah Kiblat (bearing)</div>
                  <div className="font-semibold">{qibla != null ? qibla.toFixed(0) + '°' : '-'}</div>
                </div>
              </div>
              {diff != null && (
                <div className="mt-2 text-xs opacity-75">Putar perangkat hingga jarum hijau mengarah ke atas (posisi 0°)</div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className={`rounded-xl border ${theme==='dark'?'border-gray-800 bg-gray-900':'border-gray-200 bg-white'} p-4 mb-4`}>
              <h3 className="font-semibold mb-2">Lokasi</h3>
              <div className="text-sm mb-2">Lat: {lat?.toFixed?.(6) || '-'} | Lon: {lon?.toFixed?.(6) || '-'}</div>
              {locErr && <div className="text-xs text-red-400 mb-2">{locErr}</div>}
              <button className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm" onClick={getLocation}>Dapatkan Lokasi</button>
            </div>

            <div className={`rounded-xl border ${theme==='dark'?'border-gray-800 bg-gray-900':'border-gray-200 bg-white'} p-4`}>
              <h3 className="font-semibold mb-2">Sensor Orientasi</h3>
              {sensorErr && <div className="text-xs text-red-400 mb-2">{sensorErr}</div>}
              <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={requestSensor}>Aktifkan Kompas</button>
              <p className="text-xs opacity-70 mt-2">Pada iOS, Anda mungkin perlu mengizinkan akses sensor terlebih dahulu.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KompasKiblat;
