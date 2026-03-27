import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import client from '../../api/client.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { formatDate } from '../../utils/formatters.js'

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
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

  const markAsRead = async (messageId) => {
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
      setNotification({ show: true, message: '✓ Message marked as read', type: 'success' })
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' })
      }, 3000)
    } catch (error) {
      // Revert on error
      await loadMessages()
      setNotification({ show: true, message: '✗ Failed to mark as read', type: 'error' })
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'info' })
      }, 3000)
    }
  }

  const sendReply = async (email) => {
    if (!replyMessage.trim()) return

    setNotification({ show: true, message: '📧 Upcoming feature! Reply functionality will be available soon.', type: 'info' })
    setReplyMessage('')
    setReplyingTo(null)

    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' })
    }, 4000)
  }

  const totalPages = Math.ceil(messages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMessages = messages.slice(startIndex, endIndex)

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
                <p className="text-xs text-slate-500">{formatDate(message.createdAt)}</p>
              </div>
            </div>
            {message.subject ? <p className="text-xs font-semibold text-amber-700">{message.subject}</p> : null}
            <p className="text-sm leading-6 text-slate-600 line-clamp-2">{message.message}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMessage(message)}
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
                onClick={() => setReplyingTo(message.email)}
                className="rounded-full border border-blue-500 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 flex-1 sm:flex-initial"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {replyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-950 mb-4">Reply to {replyingTo}</h3>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-2 mb-4"
              rows="4"
              placeholder="Type your reply here..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => sendReply(replyingTo)}
                className="rounded-full bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600"
              >
                Send Reply
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
                <p className="text-sm text-slate-600">{formatDate(selectedMessage.createdAt)}</p>
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
                  setReplyingTo(selectedMessage.email)
                  setSelectedMessage(null)
                }}
                className="rounded-full bg-blue-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Reply to Message
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-6 py-4">
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
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
