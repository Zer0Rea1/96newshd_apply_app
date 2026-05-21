import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function PendingApproval() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  useEffect(() => {
    if (user?.paymentStatus === 'approved') {
      navigate('/dashboard')
      return
    }

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
        if (data.paymentStatus === 'approved') {
          navigate('/dashboard')
        }
      } catch {
        // ignore
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, navigate, setUser])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {user.paymentStatus === 'rejected' ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">&#10060;</span>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Application Rejected</h1>
              <p className="text-gray-600 mb-4">
                {user.rejectionReason || 'Your payment could not be verified.'}
              </p>
              <a
                href="/payment"
                className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Re-upload Screenshot
              </a>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">&#9203;</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Under Review</h1>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-right" dir="rtl">
                <p className="text-gray-700">
                  آپ کی درخواست زیر غور ہے۔ منظوری کے بعد آپ کو اطلاع ملے گی۔
                </p>
              </div>
              <div className="space-y-2 text-left">
                <p><span className="text-gray-500">Name:</span> <strong>{user.name}</strong></p>
                <p><span className="text-gray-500">Role:</span> <strong>{user.role}</strong></p>
                <p><span className="text-gray-500">Fee:</span> <strong>Rs {user.channelFee?.toLocaleString()}</strong></p>
                <p>
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                    Pending Approval
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
