const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex items-center gap-3 text-sm text-slate-600">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-amber-600" />
    <span>{label}</span>
  </div>
)

export default LoadingSpinner
