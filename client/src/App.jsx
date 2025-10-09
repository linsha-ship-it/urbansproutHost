import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'

// Import page components
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminRegister from './pages/auth/AdminRegister'
import ResetPassword from './pages/auth/ResetPassword'
import PlantSuggestion from './pages/PlantSuggestion'
import Unauthorized from './pages/Unauthorized'
import Admin from './pages/Admin'
import Blog from './pages/Blog'
import Store from './pages/Store'
import Profile from './pages/Profile'

// Import admin components
import AdminLayout from './components/admin/AdminLayout'
import UnifiedAdminDashboard from './pages/admin/UnifiedAdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminBlogPosts from './pages/admin/AdminBlogPosts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPlants from './pages/admin/AdminPlants'
import InventoryInsights from './pages/admin/InventoryInsights'

// Import dashboard components
import AdminDashboard from './pages/dashboard/AdminDashboard'
import BeginnerDashboard from './pages/dashboard/BeginnerDashboard'
import ExpertDashboard from './pages/dashboard/ExpertDashboard'
import VendorDashboard from './pages/dashboard/VendorDashboard'

// Import My Garden Journal components
import MyGardenJournal from './pages/MyGardenJournal'
import PlantDetail from './pages/PlantDetail'
import NotificationDebug from './pages/NotificationDebug'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [], redirectToSignup = false }) => {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute - user:', user, 'loading:', loading, 'requiredRole:', requiredRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to={redirectToSignup ? "/signup" : "/login"} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch. User role:', user.role, 'Required:', requiredRole);
    return <Navigate to="/unauthorized" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - User role not in allowed roles. User role:', user.role, 'Allowed:', allowedRoles);
    return <Navigate to="/unauthorized" replace />
  }

  console.log('ProtectedRoute - Access granted');
  return children
}

// Dashboard Component - routes to appropriate dashboard based on user role
const Dashboard = () => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  const userRole = user.role || localStorage.getItem('urbansprout_user_role')
  
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />
    case 'expert':
      return <ExpertDashboard />
    case 'vendor':
      return <VendorDashboard />
    case 'beginner':
    default:
      return <BeginnerDashboard />
  }
}

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <Routes>
          {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/community" element={<Blog />} />
          <Route path="/store" element={<Store />} />
          <Route path="/plant-suggestion" element={<PlantSuggestion />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/notification-debug" element={
            <ProtectedRoute>
              <NotificationDebug />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-garden-journal" element={
            <ProtectedRoute>
              <MyGardenJournal />
            </ProtectedRoute>
          } />
          <Route path="/plant-detail/:plantId" element={
            <ProtectedRoute>
              <PlantDetail />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/blog" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminBlogPosts />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory-insights" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <InventoryInsights />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/plants" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminPlants />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App