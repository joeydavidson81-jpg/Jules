import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { FACILITIES } from '../data/facilities'
import AddEventModal from './AddEventModal'

// ── helpers ─────────────────────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const datePart = d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
  const h = d.getHours(), m = d.getMinutes()
  if (h === 0 && m === 0) return datePart
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${datePart} · ${timePart}`
}

// ── Badge ────────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  'Maximum Security': 'bg-red-100 text-red-800',
  'Close Security':   'bg-orange-100 text-orange-800',
  'Medium Security':  'bg-blue-100 text-blue-800',
  'Work Farm':        'bg-green-100 text-green-800',
  "Women's Facility": 'bg-purple-100 text-purple-800',
  'Medical Facility': 'bg-teal-100 text-teal-800',
}

function TypeBadge({ type }) {
  const cls = TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {type}
    </span>
  )
}

// ── EventCard ─────────────────────────────────────────────────────────────────
function EventCard({ event, facilityId }) {
  const { user, canManage } = useAuth()
  const [busy, setBusy] = useState(false)

  const signedUp    = user && Array.isArray(event.signups) && event.signups.includes(user.uid)
  const signupCount = Array.isArray(event.signups) ? event.signups.length : 0
  const needed      = typeof event.volunteersNeeded === 'number' && event.volunteersNeeded > 0
                        ? event.volunteersNeeded : null
  const spotsLeft   = needed !== null ? Math.max(0, needed - signupCount) : null
  const isFull      = needed !== null && signupCount >= needed

  const handleSignup = useCallback(async () => {
    if (!user) return
    setBusy(true)
    try {
      const ref = doc(db, 'facilities', facilityId, 'events', event.id)
      if (signedUp) {
        await updateDoc(ref, { signups: arrayRemove(user.uid) })
      } else {
        await updateDoc(ref, { signups: arrayUnion(user.uid) })
      }
    } finally {
      setBusy(false)
    }
  }, [user, facilityId, event.id, signedUp])

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-semibold text-gray-900 leading-tight">
          {event.title}
        </h4>
      </div>

      {/* Date / time */}
      <p className="text-xs text-gray-400 mb-2">{formatDate(event.date)}</p>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3 whitespace-pre-line">
          {event.description}
        </p>
      )}

      {/* Volunteer count / spots bar */}
      {needed !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={isFull ? 'text-red-500 font-semibold' : 'text-gray-500'}>
              {isFull ? 'Event full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining`}
            </span>
            <span className="text-gray-400">{signupCount} / {needed} filled</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, (signupCount / needed) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        {needed === null && (
          <span className="text-xs text-gray-400">
            {signupCount} volunteer{signupCount !== 1 ? 's' : ''} signed up
          </span>
        )}
        {needed !== null && <span />}

        {/* Volunteers see Sign Up / Withdraw */}
        {!canManage && user && (
          <button
            onClick={handleSignup}
            disabled={busy || (isFull && !signedUp)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
              signedUp
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : isFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {busy ? '…' : signedUp ? 'Withdraw' : isFull ? 'Full' : 'Sign Up'}
          </button>
        )}
        {!canManage && !user && (
          <span className="text-xs italic text-gray-400">Log in to sign up</span>
        )}
      </div>
    </div>
  )
}

// ── SidePanel ─────────────────────────────────────────────────────────────────
export default function SidePanel({ facilityId, onClose }) {
  const { canManage } = useAuth()
  const [events, setEvents]           = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [showAddEvent, setShowAddEvent]   = useState(false)

  const facility = FACILITIES.find((f) => f.id === facilityId)

  // ── Real-time events subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!facilityId) return
    setEventsLoading(true)
    const q = query(
      collection(db, 'facilities', facilityId, 'events'),
      orderBy('date', 'asc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setEventsLoading(false)
    })
    return unsub
  }, [facilityId])

  if (!facility) return null

  return (
    <>
      {/* Overlay backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/20 z-[900] lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="
        fixed right-0 top-0 h-full w-full max-w-sm
        bg-gray-50 shadow-2xl z-[1000]
        flex flex-col
        animate-slide-in
      ">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-[#1a365d] text-white px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Gold star */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="#d69e2e" stroke="#92400e" strokeWidth="1">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                <h2 className="text-base font-bold leading-tight truncate">
                  {facility.name}
                </h2>
              </div>
              <p className="text-blue-200 text-xs">
                {facility.city} · {facility.county} County
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white transition-colors mt-0.5 shrink-0"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3">
            <TypeBadge type={facility.type} />
          </div>
        </div>

        {/* ── Events section ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            {/* Section header + Add Event button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Ministry Events
              </h3>
              {canManage && (
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="
                    flex items-center gap-1.5 text-xs font-semibold
                    bg-[#d69e2e] hover:bg-[#b7861f]
                    text-white px-3 py-1.5 rounded-lg
                    transition-colors shadow-sm
                  "
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Event
                </button>
              )}
            </div>

            {/* Events list */}
            {eventsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No events scheduled</p>
                {canManage && (
                  <p className="text-xs mt-1">Click <strong>Add Event</strong> to create one</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    facilityId={facilityId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Add Event Modal */}
      {showAddEvent && (
        <AddEventModal
          facilityId={facilityId}
          facilityName={facility.name}
          onClose={() => setShowAddEvent(false)}
        />
      )}
    </>
  )
}
