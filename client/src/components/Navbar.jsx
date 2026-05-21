import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-red-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">96 News HD</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">{user.name}</Link>
              <button onClick={logout} className="bg-white text-red-700 px-3 py-1 rounded font-medium text-sm hover:bg-gray-100">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-white text-red-700 px-3 py-1 rounded font-medium text-sm hover:bg-gray-100">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
