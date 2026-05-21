import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RecruitmentForm from './pages/RecruitmentForm'
import Register from './pages/Register'
import Login from './pages/Login'
import PaymentInstructions from './pages/PaymentInstructions'
import PendingApproval from './pages/PendingApproval'
import MemberDashboard from './pages/MemberDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<RecruitmentForm />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/payment"   element={<ProtectedRoute><PaymentInstructions /></ProtectedRoute>} />
        <Route path="/pending"   element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requireApproved><MemberDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
