import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import AdminDashboard from './pages/admin/AdminDashboard'
import ResidentDashboard from './pages/resident/ResidentDashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin & Committee Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'committee']} />}>
              <Route path="/admin" element={<div className="p-8"><AdminDashboard /></div>} />
            </Route>
            
            {/* Resident Routes */}
            <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
              <Route path="/resident" element={<ResidentDashboard />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
