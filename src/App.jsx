import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import MapView from './components/MapView'
import SidePanel from './components/SidePanel'
import LoginModal from './components/LoginModal'
import { FACILITIES } from './data/facilities'

// ── Search bar ────────────────────────────────────────────────────────────────
function SearchBar({ onSelect }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const inputRef          = useRef(null)

  const results = query.trim().length > 0
    ? FACILITIES.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.city.toLowerCase().includes(query.toLowerCase()) ||
        f.county.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7)
    : []

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const close = () => { setOpen(false); setQuery('') }

  const handleSelect = (id) => { onSelect(id); close() }

  return (
    <div className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-200 hover:text-white border border-blue-400/50 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
          aria-label="Search facilities"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close()
              if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].id)
            }}
            placeholder="Search facilities…"
            className="w-44 sm:w-56 bg-white/10 border border-blue-300/60 text-white placeholder-blue-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button onClick={close} className="text-blue-300 hover:text-white p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl z-[900] overflow-hidden border border-gray-100">
          {results.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between gap-3 border-b border-gray-50 last:border-0"
            >
              <span className="text-sm font-medium text-gray-800 truncate">{f.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{f.city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAdmin, logout } = useAuth()
  const [selectedId, setSelectedId] = useState(null)
  const [showLogin, setShowLogin]   = useState(false)

  const handleSelectFacility = useCallback((id) => setSelectedId(id), [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      {/* ── Top nav bar ───────────────────────────────────────────────────── */}
      <header className="
        absolute top-0 left-0 right-0 z-[800]
        flex items-center justify-between
        px-4 py-2.5
        bg-[#1a365d]/95 backdrop-blur-sm shadow-lg
      ">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="#d69e2e" stroke="#92400e" strokeWidth="1">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">NC Prison Ministry</h1>
            <p className="text-blue-300 text-[10px] leading-tight">North Carolina Facilities Map</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar onSelect={handleSelectFacility} />

          {isAdmin ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                Admin
              </span>
              <button
                onClick={logout}
                className="text-xs font-medium text-blue-200 hover:text-white border border-blue-400 hover:border-white px-3 py-1 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-xs font-semibold text-[#1a365d] bg-[#d69e2e] hover:bg-[#b7861f] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Leader Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Hint bar ────────────────────────────────────────────────────────── */}
      {!selectedId && (
        <div className="
          absolute bottom-6 left-1/2 -translate-x-1/2 z-[800] pointer-events-none
          bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg
          flex items-center gap-2 text-sm text-gray-700 font-medium animate-fade-in
        ">
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="#d69e2e" stroke="#92400e" strokeWidth="1">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          Tap a star to view facility events
        </div>
      )}

      {/* ── Map ─────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pt-[52px] z-[1]">
        <MapView onSelectFacility={handleSelectFacility} />
      </div>

      {/* ── Side panel ──────────────────────────────────────────────────────── */}
      {selectedId && (
        <SidePanel facilityId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* ── Login modal ─────────────────────────────────────────────────────── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
