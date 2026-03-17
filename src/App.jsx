import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import MapView from './components/MapView'
import SidePanel from './components/SidePanel'
import LoginModal from './components/LoginModal'

// Role badge colours
const ROLE_STYLES = {
  admin:     'bg-red-100 text-red-800',
  leader:    'bg-amber-100 text-amber-800',
  volunteer: 'bg-green-100 text-green-800',
}

export default function App() {
  const { user, role, logout } = useAuth()

  const [selectedId, setSelectedId]     = useState(null)
  const [showLogin, setShowLogin]       = useState(false)

  const handleSelectFacility = (id) => {
    setSelectedId(id)
  }

  const handleClosePanel = () => setSelectedId(null)

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      {/* ── Top nav bar ──────────────────────────────────────────────────── */}
      <header className="
        absolute top-0 left-0 right-0 z-[800]
        flex items-center justify-between
        px-4 py-2.5
        bg-[#1a365d]/95 backdrop-blur-sm
        shadow-lg
      ">
        {/* Logo / title */}
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="#d69e2e" stroke="#92400e" strokeWidth="1">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">NC Prison Ministry</h1>
            <p className="text-blue-300 text-[10px] leading-tight">North Carolina Facilities Map</p>
          </div>
        </div>

        {/* Right side: role badge + auth */}
        <div className="flex items-center gap-2">
          {user && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_STYLES[role]}`}>
              {role}
            </span>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-blue-200 text-xs hidden sm:block truncate max-w-[120px]">
                {user.displayName || user.email}
              </span>
              <button
                onClick={logout}
                className="text-xs font-medium text-blue-200 hover:text-white border border-blue-400 hover:border-white px-3 py-1 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-xs font-semibold text-[#1a365d] bg-[#d69e2e] hover:bg-[#b7861f] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Hint bar (shown when no facility selected) ───────────────────── */}
      {!selectedId && (
        <div className="
          absolute bottom-6 left-1/2 -translate-x-1/2
          z-[800] pointer-events-none
          bg-white/90 backdrop-blur-sm
          px-4 py-2 rounded-full shadow-lg
          flex items-center gap-2
          text-sm text-gray-700 font-medium
          animate-fade-in
        ">
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="#d69e2e" stroke="#92400e" strokeWidth="1">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          Click a star to view a facility and its events
        </div>
      )}

      {/* ── Full-screen map ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pt-[52px] z-[1]">
        <MapView
          selectedId={selectedId}
          onSelectFacility={handleSelectFacility}
        />
      </div>

      {/* ── Side panel ───────────────────────────────────────────────────── */}
      {selectedId && (
        <SidePanel
          facilityId={selectedId}
          onClose={handleClosePanel}
        />
      )}

      {/* ── Login modal ───────────────────────────────────────────────────── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
