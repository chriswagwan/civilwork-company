import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle, X } from 'lucide-react'
import client from '../../api/client.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { formatDateTime } from '../../utils/formatters.js'

const normalizeWhatsAppNumber = (phone = '') => {
  const trimmedPhone = phone.trim()

  if (!trimmedPhone) {
    return ''
  }

  if (trimmedPhone.startsWith('+')) {
    return `+${trimmedPhone.slice(1).replace(/\D/g, '')}`
  }

  const digitsOnly = trimmedPhone.replace(/\D/g, '')

  if (digitsOnly.startsWith('00')) {
    return digitsOnly.slice(2)
  }

  return digitsOnly
}

const buildWhatsAppLink = (phone, message) => {
  const normalizedPhone = normalizeWhatsAppNumber(phone)

  if (!normalizedPhone) {
    return ''
  }

  const phonePath = normalizedPhone.startsWith('+') ? normalizedPhone.slice(1) : normalizedPhone
  const textQuery = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''

  return `https://wa.me/${phonePath}${textQuery}`
}

const messageFilters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('unread')
  const [replyMessage, setReplyMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' })
  const itemsPerPage = 4

  const loadMessages = async () => {
    const { data } = await client.get('/messages')
    setMessages(data)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadMessages()
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const markAsRead = async (messageId, options = {}) => {
    const { showNotification = true } = options

    // Optimistically update the UI
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId ? { ...msg, isRead: true } : msg
      )
    )

    // Update selected message if it's currently open
    if (selectedMessage && selectedMessage._id === messageId) {
      setSelectedMessage({ ...selectedMessage, isRead: true })
    }

    try {
      await client.patch(`/messages/${messageId}/read`)
      window.dispatchEvent(new Event('messages:updated'))

      if (showNotification) {
        setNotification({ show: true, message: '✓ Message marked as read', type: 'success' })
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'info' })
        }, 3000)
      }
    } catch (error) {
      // Revert on error
      await loadMessages()
      setNotification({ show: true, message: '✗ Failed to mark as read', type: 'error' })
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' })
      }, 3000)
    }
  }

  const handleOpenMessage = (message) => {
    const nextSelectedMessage = message.isRead ? message : { ...message, isRead: true }

    setSelectedMessage(nextSelectedMessage)

    if (!message.isRead) {
      markAsRead(message._id, { showNotification: false })
    }
  }

  const openWhatsAppReply = (message) => {
    const whatsappLink = buildWhatsAppLink(message.phone, replyMessage)

    if (!whatsappLink) {
      setNotification({ show: true, message: '✗ This customer did not provide a valid phone number for WhatsApp.', type: 'error' })
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' })
      }, 4000)
      return
    }

    window.open(whatsappLink, '_blank', 'noopener,noreferrer')
    setNotification({ show: true, message: 'WhatsApp opened in a new tab with your draft reply.', type: 'success' })
    setReplyMessage('')
    setReplyingTo(null)

    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' })
    }, 4000)
  }

  const unreadCount = messages.filter((message) => !message.isRead).length
  const readCount = messages.length - unreadCount
  const filteredMessages = messages
    .filter((message) => {
      if (statusFilter === 'unread') {
        return !message.isRead
      }

      if (statusFilter === 'read') {
        return message.isRead
      }

      return true
    })
    .sort((leftMessage, rightMessage) => new Date(rightMessage.createdAt) - new Date(leftMessage.createdAt))

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMessages = filteredMessages.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <div className="card-panel px-6 py-14">
        <LoadingSpinner label="Loading messages..." />
      </div>
    )
  }

  if (messages.length === 0) {
    return <EmptyState title="No messages yet" copy="Messages from the public contact form will appear here." />
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Message Filter</p>
          <p className="mt-1 text-sm text-slate-600">Switch between unread and read messages while keeping the original received timestamp.</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {messageFilters.map((filter) => {
            const count = filter.value === 'unread' ? unreadCount : filter.value === 'read' ? readCount : messages.length
            const isActive = statusFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                    : 'text-slate-600 hover:bg-white hover:text-slate-950'
                }`}
              >
                {filter.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <EmptyState
          title={statusFilter === 'read' ? 'No read messages yet' : 'No unread messages right now'}
          copy={statusFilter === 'read' ? 'Messages marked as read will appear here.' : 'New incoming messages will appear here until they are marked as read.'}
        />
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {paginatedMessages.map((message) => (
          <div key={message._id} className="card-panel flex flex-col gap-3 px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-950">{message.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      message.isRead ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {message.isRead ? 'Read' : 'New'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {message.email}
                  {message.phone ? ` • ${message.phone}` : ''}
                </p>
                <p className="text-xs text-slate-500">Received {formatDateTime(message.createdAt)}</p>
              </div>
            </div>
            {message.subject ? <p className="text-xs font-semibold text-amber-700">{message.subject}</p> : null}
            <p className="text-sm leading-6 text-slate-600 line-clamp-2">{message.message}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleOpenMessage(message)}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex-1 sm:flex-initial"
              >
                Read Message
              </button>
              {!message.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(message._id)}
                  className="rounded-full border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex-1 sm:flex-initial"
                >
                  Mark as Read
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setReplyMessage(`Hello ${message.name},`)
                  setReplyingTo(message)
                }}
                disabled={!normalizeWhatsAppNumber(message.phone)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-emerald-500 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent sm:flex-initial"
              >
                <MessageCircle size={14} />
                WhatsApp Reply
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {replyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-950 mb-2">Reply on WhatsApp</h3>
            <p className="mb-4 text-sm text-slate-500">
              Opening chat for {replyingTo.name}
              {replyingTo.phone ? ` • ${replyingTo.phone}` : ''}
            </p>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-2 mb-4"
              rows="4"
              placeholder="Draft your WhatsApp reply here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyMessage('')
                }}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => openWhatsAppReply(replyingTo)}
                className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 rounded-t-3xl px-6 sm:px-8 py-4 sm:py-6 flex items-start justify-between gap-4">
              <div className="flex-grow min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-950">Message from {selectedMessage.name}</h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500">{selectedMessage.email}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex-shrink-0 rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 sm:px-8 py-6 overflow-y-auto max-h-[calc(100vh-200px)] space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.1em]">Received</p>
                <p className="text-sm text-slate-600">{formatDateTime(selectedMessage.createdAt)}</p>
              </div>

              {selectedMessage.phone && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.1em]">Phone</p>
                  <p className="text-sm text-slate-600">{selectedMessage.phone}</p>
                </div>
              )}

              {selectedMessage.subject && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.1em]">Subject</p>
                  <p className="text-sm font-medium text-slate-950">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.1em] mb-2">Message</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedMessage.isRead ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedMessage.isRead ? 'Read' : 'New'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 rounded-b-3xl px-6 sm:px-8 py-4 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-end">
              {!selectedMessage.isRead && (
                <button
                  type="button"
                  onClick={() => {
                    markAsRead(selectedMessage._id)
                    setSelectedMessage(null)
                  }}
                  className="rounded-full border border-emerald-200 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                >
                  Mark as Read
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setReplyMessage(`Hello ${selectedMessage.name},`)
                  setReplyingTo(selectedMessage)
                  setSelectedMessage(null)
                }}
                disabled={!normalizeWhatsAppNumber(selectedMessage.phone)}
                className="rounded-full bg-emerald-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Reply on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-full border border-slate-200 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMessages.length > 0 && totalPages > 1 && (
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Pagination</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Page <span className="text-slate-950">{currentPage}</span> of <span className="text-slate-950">{totalPages}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:px-5 sm:text-sm"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100 disabled:shadow-none sm:px-5 sm:text-sm"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tailwind Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full sm:w-96 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`rounded-2xl px-6 py-4 shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-grow">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'info' })}
                className="flex-shrink-0 text-opacity-70 hover:text-opacity-100 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminMessagesPage
