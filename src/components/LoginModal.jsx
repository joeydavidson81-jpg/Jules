import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginModal({ onClose }) {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login(password)) {
      onClose()
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-[#1a365d] px-6 py-5 text-center relative">
          <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-2" fill="#d69e2e" stroke="#92400e" strokeWidth="1">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          <h2 className="text-white font-bold text-lg">Leader / Admin Sign In</h2>
          <p className="text-blue-200 text-xs mt-1">Enter your access password</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            required
          />
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#1a365d] hover:bg-[#2a4a7f] rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
