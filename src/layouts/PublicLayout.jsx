import { Outlet } from 'react-router-dom'
import Footer from '../components/layout/Footer.jsx'
import Navbar from '../components/layout/Navbar.jsx'

const PublicLayout = () => (
  <div className="page-shell">
    <Navbar />
    <main className="pb-8">
      <Outlet />
    </main>
    <Footer />
  </div>
)

export default PublicLayout
