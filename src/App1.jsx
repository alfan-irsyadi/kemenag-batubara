import { Menu, Bell, Settings, User } from "lucide-react";
import './App.css'

// DashboardLayout.jsx
// Tailwind + Vite + React
// - Layout only (no real content)
// - Responsive sidebar, topbar, main content area, and optional right rail
// Usage: import DashboardLayout from './DashboardLayout.jsx' and wrap pages with <DashboardLayout>...</DashboardLayout>

export default function App({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">A</div>
          <div>
            <div className="font-semibold">My Dashboard</div>
            <div className="text-xs text-slate-500">Organization</div>
          </div>
        </div>

        <nav className="mt-6 flex-1">
          <ul className="space-y-1">
            <li>
              <a className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100" href="#">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-sm font-medium">Overview</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100" href="#">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20v-6M6 12V6h12v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-sm font-medium">Reports</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100" href="#">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a7 7 0 10-14.8 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-sm font-medium">Analytics</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="mt-auto px-3 py-4">
          <button className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 bg-red-100">
            <User className="h-4 w-4" /> <span className="text-sm">Profile</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-md hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </button>

            <div className="text-lg font-semibold">Dashboard</div>
            <div className="hidden sm:block text-sm text-slate-500">Layout without content — slot ready</div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-slate-100" aria-label="search">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="p-2 rounded-md hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-slate-100">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* CONTENT WRAPPER */}
        <main className="p-6">
          {/* Grid skeleton: empty slots for cards / charts / tables. No actual content inserted. */}
          <section aria-label="main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary column (spans 2 on large screens) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
              <div className="min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
            </div>

            {/* Right column / rail */}
            <div className="flex flex-col gap-6">
              <div className="min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
              <div className="min-h-[120px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
            </div>
          </section>
          {/* Optional bottom area */}
          <section aria-label="bottom-row" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
            <div className="h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
            <div className="h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-white/30" aria-hidden="true" />
          </section>
        </main>
      </div>
    </div>
  );
}
