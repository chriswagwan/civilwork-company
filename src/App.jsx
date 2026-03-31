 import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import HomePage from './pages/HomePage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import DashboardHomePage from './pages/admin/DashboardHomePage.jsx'
import AdminMessagesPage from './pages/admin/AdminMessagesPage.jsx'
import AdminProjectsPage from './pages/admin/AdminProjectsPage.jsx'
import AdminServicesPage from './pages/admin/AdminServicesPage.jsx'
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx'
import AdminStaffPage from './pages/admin/AdminStaffPage.jsx'

const App = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Route>

    <Route path="/admin/login" element={<LoginPage />} />
    <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardHomePage />} />
      <Route path="projects" element={<AdminProjectsPage />} />
      <Route path="services" element={<AdminServicesPage />} />
      <Route path="staff" element={<AdminStaffPage />} />
      <Route path="messages" element={<AdminMessagesPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default App
