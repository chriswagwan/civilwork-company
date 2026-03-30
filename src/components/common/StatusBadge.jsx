const statusStyles = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  ongoing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
}

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
  >
    {status}
  </span>
)

export default StatusBadge
