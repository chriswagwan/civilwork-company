import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // Require admin key verification for admin routes
  const adminAccessGranted = sessionStorage.getItem('adminAccessGranted')
  if (roles.includes('admin') && !adminAccessGranted) {
    return <Navigate to="/" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
