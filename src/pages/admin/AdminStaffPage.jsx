import { Trash2, Pencil, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'

const emptyStaffForm = {
  name: '',
  title: '',
  description: '',
  photo: '',
}

const AdminStaffPage = () => {
  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [staffForm, setStaffForm] = useState(emptyStaffForm)
  const [editingStaffId, setEditingStaffId] = useState('')
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [staffPhoto, setStaffPhoto] = useState(null)
  const [savingStaff, setSavingStaff] = useState(false)
  const [staffFeedback, setStaffFeedback] = useState({ type: '', message: '' })

  // Load staff on mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const { data } = await client.get('/staff')
        setStaff(data)
      } catch (error) {
        console.error('Error loading staff:', error)
      } finally {
        setStaffLoading(false)
      }
    }

    loadStaff()
  }, [])

  const handleStaffChange = (event) => {
    const { name, value } = event.target
    setStaffForm((current) => ({
      ...current,
      [name]: value,
    }))
    setStaffFeedback({ type: '', message: '' })
  }

  const handleStaffPhotoChange = (event) => {
    setStaffPhoto(event.target.files?.[0] || null)
  }

  const handleStaffSubmit = async (event) => {
    event.preventDefault()
    setSavingStaff(true)
    setStaffFeedback({ type: '', message: '' })

    try {
      const payload = new FormData()
      Object.entries(staffForm).forEach(([key, value]) => {
        if (value) payload.append(key, value)
      })
      if (staffPhoto) payload.append('photo', staffPhoto)

      if (editingStaffId) {
        await client.put(`/staff/${editingStaffId}`, payload)
        setStaffFeedback({ type: 'success', message: 'Staff member updated successfully.' })
      } else {
        await client.post('/staff', payload)
        setStaffFeedback({ type: 'success', message: 'Staff member added successfully.' })
      }

      // Reload staff
      const { data } = await client.get('/staff')
      setStaff(data)
      resetStaffForm()
    } catch (error) {
      setStaffFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to save staff member.',
      })
    } finally {
      setSavingStaff(false)
    }
  }

  const handleEditStaff = (member) => {
    setEditingStaffId(member._id)
    setStaffForm({
      name: member.name,
      title: member.title,
      description: member.description,
      photo: member.photo || '',
    })
    setStaffPhoto(null)
    setShowStaffForm(true)
  }

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return

    try {
      await client.delete(`/staff/${staffId}`)
      const { data } = await client.get('/staff')
      setStaff(data)
      setStaffFeedback({ type: 'success', message: 'Staff member deleted successfully.' })
      if (editingStaffId === staffId) resetStaffForm()
    } catch (error) {
      setStaffFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete staff member.',
      })
    }
  }

  const resetStaffForm = () => {
    setStaffForm(emptyStaffForm)
    setStaffPhoto(null)
    setEditingStaffId('')
    setShowStaffForm(false)
  }

  if (staffLoading) {
    return (
      <div className="card-panel px-6 py-14">
        <LoadingSpinner label="Loading staff..." />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-950">Manage Staff Members</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Add, edit, and remove team members with photos.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetStaffForm()
            setShowStaffForm(!showStaffForm)
          }}
          className="rounded-full bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 whitespace-nowrap"
        >
          {showStaffForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {showStaffForm && (
        <form onSubmit={handleStaffSubmit} className="card-panel space-y-4 sm:space-y-5 px-4 sm:px-6 py-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-950">{editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Full Name</span>
              <input
                type="text"
                name="name"
                value={staffForm.name}
                onChange={handleStaffChange}
                className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Title / Position</span>
              <input
                type="text"
                name="title"
                value={staffForm.title}
                onChange={handleStaffChange}
                className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
                required
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Description / Bio</span>
            <textarea
              name="description"
              value={staffForm.description}
              onChange={handleStaffChange}
              rows="3"
              className="w-full rounded-3xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Staff Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleStaffPhotoChange}
              className="w-full rounded-2xl border border-dashed border-slate-300 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              {staffForm.photo && !staffPhoto ? 'Current photo exists. Upload a new file to replace it.' : 'Select an image file to upload'}
            </p>
          </label>

          {(staffForm.photo || staffPhoto) && (
            <div className="relative inline-block">
              <img
                src={staffPhoto ? URL.createObjectURL(staffPhoto) : staffForm.photo}
                alt="Staff preview"
                className="h-24 sm:h-32 w-24 sm:w-32 rounded-2xl object-cover"
              />
            </div>
          )}

          {staffFeedback.message ? (
            <div
              className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
                staffFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {staffFeedback.message}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={savingStaff}
              className="rounded-full bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap"
            >
              {savingStaff ? 'Saving...' : editingStaffId ? 'Update Staff' : 'Add Staff'}
            </button>
            {editingStaffId && (
              <button
                type="button"
                onClick={resetStaffForm}
                className="rounded-full border border-slate-200 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {staff.length === 0 ? (
        <EmptyState title="No staff members created" copy="Use the form above to add your first staff member." />
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((member) => (
              <div key={member._id} className="card-panel overflow-hidden flex flex-col border border-slate-200">
                <div className="h-24 sm:h-28 lg:h-32 w-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>
                <div className="px-3 sm:px-4 py-3 sm:py-4 flex-grow flex flex-col">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-950 line-clamp-2">{member.name}</h3>
                  <p className="text-xs font-medium text-amber-700 mt-1">{member.title}</p>
                  <p className="text-xs text-slate-600 leading-4 sm:leading-5 mt-1.5 sm:mt-2 line-clamp-2">{member.description}</p>
                </div>
                <div className="flex gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleEditStaff(member)}
                    className="rounded-full border border-slate-200 p-1.5 sm:p-2 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 flex-1 flex items-center justify-center"
                    title="Edit staff member"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(member._id)}
                    className="rounded-full border border-slate-200 p-1.5 sm:p-2 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 flex-1 flex items-center justify-center"
                    title="Delete staff member"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminStaffPage
