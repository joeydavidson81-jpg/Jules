import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function AddEventModal({ facilityId, facilityName, onClose }) {
  const [form, setForm] = useState({
    title: '', date: '', time: '', volunteersNeeded: '', description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('Title and date are required.')
      return
    }
    const needed = parseInt(form.volunteersNeeded, 10)
    if (form.volunteersNeeded !== '' && (isNaN(needed) || needed < 1)) {
      setError('Volunteers needed must be a positive number.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const dateStr = form.time ? `${form.date}T${form.time}` : `${form.date}T00:00`
      await addDoc(collection(db, 'facilities', facilityId, 'events'), {
        title:            form.title.trim(),
        description:      form.description.trim(),
        date:             Timestamp.fromDate(new Date(dateStr)),
        volunteersNeeded: form.volunteersNeeded !== '' ? needed : null,
        signups:          [],
        createdAt:        Timestamp.now(),
      })
      onClose()
    } catch (err) {
      setError('Failed to save event. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="bg-[#1a365d] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-base">Add Ministry Event</h3>
            <p className="text-blue-200 text-xs mt-0.5 truncate max-w-xs">{facilityName}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Event Title *
            </label>
            <input
              type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Sunday Morning Worship"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Date + Time side by side */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Date *
              </label>
              <input
                type="date" name="date" value={form.date} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Time
              </label>
              <input
                type="time" name="time" value={form.time} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Volunteers needed */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Volunteers Needed
            </label>
            <input
              type="number" name="volunteersNeeded" value={form.volunteersNeeded}
              onChange={handleChange} min="1" placeholder="e.g. 10"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={5}
              placeholder="Share details about this ministry event — what to expect, what to bring, who to contact…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#1a365d] hover:bg-[#2a4a7f] disabled:opacity-60 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
