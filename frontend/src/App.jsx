import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import AdminDashboard from './pages/admin/AdminDashboard'
import CommitteeDashboard from './pages/committee/CommitteeDashboard'
import ResidentDashboard from './pages/resident/ResidentDashboard'
import { useAuth } from './contexts/AuthContext'

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'committee_member') {
    return <Navigate to="/committee" replace />;
  }
  return <Navigate to="/resident" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/:tab" element={<AdminDashboard />} />
            </Route>
            
            {/* Committee Routes */}
            <Route element={<ProtectedRoute allowedRoles={['committee_member']} />}>
              <Route path="/committee" element={<CommitteeDashboard />} />
              <Route path="/committee/:tab" element={<CommitteeDashboard />} />
            </Route>
            
            {/* Resident Routes */}
            <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
              <Route path="/resident" element={<ResidentDashboard />} />
              <Route path="/resident/:tab" element={<ResidentDashboard />} />
            </Route>
            
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
