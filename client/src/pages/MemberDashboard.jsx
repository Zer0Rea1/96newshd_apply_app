import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

export default function MemberDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-red-700 text-white p-6 text-center">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-800 flex items-center justify-center mx-auto border-4 border-white text-3xl font-bold">
                {user.name?.charAt(0)}
              </div>
            )}
            <h1 className="text-2xl font-bold mt-3">{user.name}</h1>
            <p className="text-red-200">{user.role}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="CNIC" value={user.cnic} />
              <InfoRow label="Address" value={user.address} />
              <InfoRow label="City" value={user.city} />
              <InfoRow label="Channel Fee" value={`Rs ${user.channelFee?.toLocaleString()}`} />
              <InfoRow
                label="Status"
                value={
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    Approved
                  </span>
                }
              />
              <InfoRow
                label="Subscribed Date"
                value={user.subscribedDate ? new Date(user.subscribedDate).toLocaleDateString() : '-'}
              />
              <InfoRow
                label="Next Due Date"
                value={user.nextDueDate ? new Date(user.nextDueDate).toLocaleDateString() : '-'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  )
}
