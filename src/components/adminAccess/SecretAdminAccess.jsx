import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminKeyModal from './AdminKeyModal.jsx'
import client from '../../api/client.js'

const SecretAdminAccess = ({ children }) => {
  const [clickCount, setClickCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const clickTimeoutRef = useRef(null)
  const navigate = useNavigate()

  const resetClickCount = useCallback(() => {
    setClickCount(0)
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
  }, [])

  const handleLogoClick = useCallback(() => {
    setClickCount((prev) => {
      const newCount = prev + 1

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }

      if (newCount === 3) {
        setIsModalOpen(true)
        setClickCount(0)
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }
        return 0
      }

      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0)
      }, 2000)

      return newCount
    })
  }, [])

  const handleVerifyKey = async (key) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await client.post('/auth/verify-admin-key', {
        key,
      })

      if (response.data.success) {
        sessionStorage.setItem('adminAccessGranted', 'true')
        setIsModalOpen(false)
        navigate('/admin/login')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid access key. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setError('')
  }

  return (
    <>
      <div onClick={handleLogoClick}>{children}</div>
      <AdminKeyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleVerifyKey}
        isLoading={isLoading}
        error={error}
      />
    </>
  )
}

export default SecretAdminAccess
