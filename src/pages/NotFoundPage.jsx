import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <section className="site-container flex min-h-[70vh] items-center justify-center py-12">
    <div className="card-panel max-w-xl px-8 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-950">The page you requested could not be found.</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Head back to the home page to continue exploring the Civil Works Company platform.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
      >
        Return Home
      </Link>
    </div>
  </section>
)

export default NotFoundPage
