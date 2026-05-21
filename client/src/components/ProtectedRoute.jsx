import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, requireApproved }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (requireApproved && user.paymentStatus !== 'approved') return <Navigate to="/pending" />

  return children
}
