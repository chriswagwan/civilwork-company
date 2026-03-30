const EmptyState = ({ title, copy }) => (
  <div className="card-panel px-6 py-12 text-center">
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{copy}</p>
  </div>
)

export default EmptyState
