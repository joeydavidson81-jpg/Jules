import { useState, useCallback } from 'react'
import { useAuth } from './contexts/AuthContext'
import MapView from './components/MapView'
import SidePanel from './components/SidePanel'
import LoginModal from './components/LoginModal'

export default function App() {
  const { isAdmin, logout } = useAuth()
  const [selectedId, setSelectedId] = useState(null)
  const [showLogin, setShowLogin]   = useState(false)

  const handleSelectFacility = useCallback((id) => setSelectedId(id), [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      {/* ── Top nav bar ─────────────────────────────────────────────────────── */}
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

      {/* ── Hint bar ─────────────────────────────────────────────────────────── */}
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

      {/* ── Map ──────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pt-[52px] z-[1]">
        <MapView onSelectFacility={handleSelectFacility} />
      </div>

      {/* ── Side panel ───────────────────────────────────────────────────────── */}
      {selectedId && (
        <SidePanel facilityId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {/* ── Login modal ──────────────────────────────────────────────────────── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
