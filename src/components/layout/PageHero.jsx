const PageHero = ({ title, copy, eyebrow }) => (
  <section className="site-container pt-6 sm:pt-8 md:pt-10 lg:pt-14">
    <div className="card-panel grid-overlay overflow-hidden px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-16">
      <div className="max-w-3xl fade-in-up">
        <span className="inline-flex rounded-full border border-amber-400/40 dark:border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-500">
          {eyebrow}
        </span>
        <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-slate-600">{copy}</p>
      </div>
    </div>
  </section>
)

export default PageHero
