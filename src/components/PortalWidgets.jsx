import React, { useEffect, useMemo, useRef, useState } from 'react';

// RunningTicker: displays current time and a scrolling list of headlines
export const RunningTicker = ({ headlines = [], theme = 'dark', latitude = 3.195, longitude = 99.45, method = 20 }) => {
  const [now, setNow] = useState(new Date());
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch monthly prayer times for countdown
  useEffect(() => {
    let aborted = false;
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const run = async () => {
      try {
        const url = `https://api.aladhan.com/v1/calendar?latitude=${latitude}&longitude=${longitude}&method=${method}&month=${month}&year=${year}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('calendar failed');
        const json = await res.json();
        if (!aborted) setCalendar(Array.isArray(json?.data) ? json.data : []);
      } catch (e) {
        if (!aborted) setCalendar([]);
      }
    };
    run();
    return () => { aborted = true; };
  }, [latitude, longitude, method]);

  const timeStr = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }, [now]);

  const dateStr = useMemo(() => {
    const d = now;
    const day = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
    const date = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
    return `${day}, ${date}`;
  }, [now]);

  // Duplicate headlines to make the ticker seamless
  const items = (headlines && headlines.length ? headlines : [
    'Selamat datang di Kemenag Kab. Batu Bara',
    'Transparansi layanan dan peningkatan pelayanan publik',
    'Informasi terbaru dan pengumuman akan tampil di sini'
  ]);
  const tickerItems = [...items, ...items];

  // Compute next prayer and countdown
  const nextPrayer = useMemo(() => {
    if (!calendar.length) return null;
    const today = new Date(now);
    const idx = today.getDate() - 1;
    const keys = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];

    const parseTime = (str) => {
      if (!str) return null;
      const clean = String(str).split(' ')[0];
      const [h, m] = clean.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      const d = new Date(today);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const timingsToday = calendar[idx]?.timings || {};
    for (const k of keys) {
      const t = parseTime(timingsToday[k]);
      if (t && t > now) {
        return { key: k, at: t, label: ({Fajr:'Subuh',Dhuhr:'Dzuhur',Asr:'Ashar',Maghrib:'Maghrib',Isha:'Isya'})[k] };
      }
    }
    // If none left today, use tomorrow Fajr
    const nextIdx = idx + 1 < calendar.length ? idx + 1 : idx; // if month end, fallback same idx
    const tmr = parseTime(calendar[nextIdx]?.timings?.Fajr);
    if (tmr) {
      const base = new Date(today);
      base.setDate(today.getDate() + 1);
      base.setHours(tmr.getHours(), tmr.getMinutes(), 0, 0);
      return { key: 'Fajr', at: base, label: 'Subuh' };
    }
    return null;
  }, [calendar, now]);

  const countdown = useMemo(() => {
    if (!nextPrayer?.at) return null;
    let diff = Math.max(0, Math.floor((nextPrayer.at.getTime() - now.getTime())/1000));
    const h = Math.floor(diff/3600); diff -= h*3600;
    const m = Math.floor(diff/60); diff -= m*60;
    const s = diff;
    const pad = (n) => String(n).padStart(2,'0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [nextPrayer, now]);

  return (
    <div className={`sticky top-16 md:top-20 z-40 w-full overflow-hidden border-y ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-2">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-green-500 font-semibold">🕒 {timeStr}</span>
          <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{dateStr}</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-transparent via-transparent to-transparent pointer-events-none" />
          <div className="animate-[ticker_60s_linear_infinite] inline-block whitespace-nowrap">
            {tickerItems.map((text, idx) => (
              <span key={idx} className="mx-6 inline-flex items-center">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-sm">{text}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
          <span className="text-yellow-400">⏰</span>
          {nextPrayer ? (
            <span className="text-xs sm:text-sm">
              Sholat Berikutnya: <span className="font-semibold">{nextPrayer.label}</span> {countdown ? `dalam ${countdown}` : ''}
            </span>
          ) : (
            <span className="text-xs sm:text-sm opacity-70">Memuat jadwal...</span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

// PrayerTimesWidget: monthly prayer schedule using Aladhan API as default (CORS-friendly)
// Note: The Bimasislam POST endpoint requires cookies and likely violates CORS in a browser-only app.
// If you need to use that endpoint, set up a server-side proxy and call it from this widget.
export const PrayerTimesWidget = ({
  latitude = 3.195, // Lima Puluh approx
  longitude = 99.45,
  method = 20, // 20: Moonsighting Committee; adjust as needed
  month = (new Date().getMonth() + 1),
  year = (new Date().getFullYear()),
  theme = 'dark',
  title = 'Waktu Sholat Bulan Ini',
  fullHeight = false
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aborted = false;
    const fetchTimes = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Try Aladhan API (CORS-enabled)
        const url = `https://api.aladhan.com/v1/calendar?latitude=${latitude}&longitude=${longitude}&method=${method}&month=${month}&year=${year}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Gagal memuat jadwal');
        const json = await res.json();
        if (aborted) return;
        const arr = Array.isArray(json?.data) ? json.data : [];
        setData(arr);
      } catch (e) {
        console.error('Prayer times fetch error:', e);
        if (!aborted) setError('Gagal memuat jadwal sholat.');
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    fetchTimes();
    return () => { aborted = true; };
  }, [latitude, longitude, method, month, year]);

  const today = new Date();
  const todayIdx = today.getDate() - 1;
  const todayData = data[todayIdx]?.timings || {};
  const readableDate = data[todayIdx]?.date?.readable || new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(today);

  const compact = [
    { key: 'Fajr', label: 'Subuh' },
    { key: 'Dhuhr', label: 'Dzuhur' },
    { key: 'Asr', label: 'Ashar' },
    { key: 'Maghrib', label: 'Maghrib' },
    { key: 'Isha', label: 'Isya' }
  ];
  const icons = {
    Fajr: '🌄',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌇',
    Isha: '🌙'
  };

  return (
    <div className={`rounded-xl border shadow ${fullHeight ? 'h-full flex flex-col' : ''} ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-black'}`}>
      <div className="p-4 border-b border-gray-700/30 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs opacity-70">{readableDate}</span>
      </div>
      <div className="p-4 ${fullHeight ? 'flex-1' : ''}">
        {loading && <div className="text-sm opacity-80">Memuat jadwal...</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
            {compact.map(({ key, label }) => (
              <div key={key} className="rounded-lg p-3 bg-gray-800/40 border border-gray-700/50 flex flex-col items-center">
                <div className="text-2xl mb-1" aria-hidden>{icons[key] || '🕰️'}</div>
                <div className="text-xs opacity-80 mb-1">{label}</div>
                <div className="text-lg font-semibold">{String((todayData[key]||'').split(' ')[0]||'-')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <a
          href="https://bimasislam.kemenag.go.id/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300"
          title="Sumber alternatif: Bimas Islam (gunakan proxy backend untuk akses langsung)"
        >
          Sumber jadwal alternatif: Bimas Islam
          <span>↗</span>
        </a>
      </div>
    </div>
  );
};

export default { RunningTicker, PrayerTimesWidget };
