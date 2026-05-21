import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApplication } from '../hooks/useApplication'
import ScreenshotUpload from '../components/ScreenshotUpload'
import Navbar from '../components/Navbar'

export default function PaymentInstructions() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { uploadScreenshot, uploading } = useApplication()

  const handleUpload = async (file) => {
    try {
      const data = await uploadScreenshot(file)
      setUser(data.user)
      navigate('/pending')
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Instructions</h1>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-lg">Position: <strong>{user?.role}</strong></p>
            <p className="text-red-600 font-bold text-2xl">Rs {user?.channelFee?.toLocaleString()}</p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-700">Bank Transfer Details</h2>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Punjab Bank Account</p>
                <p className="font-mono text-lg font-bold select-all">6020266587200018</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">JazzCash Account</p>
                <p className="font-mono text-lg font-bold select-all">0300-8687435</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Name</p>
                <p className="font-semibold">96 News HD Pakistan LIMITED</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Payment Screenshot</h2>
            <p className="text-gray-500 text-sm mb-4">
              After sending the payment, take a screenshot and upload it below for verification.
            </p>
            <ScreenshotUpload onUpload={handleUpload} uploading={uploading} />
          </div>
        </div>
      </div>
    </div>
  )
}
