const SectionHeading = ({ eyebrow, title, copy, align = 'left' }) => (
  <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
    {eyebrow ? (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
        {eyebrow}
      </span>
    ) : null}
    <h2 className="section-title mt-4">{title}</h2>
    {copy ? <p className="section-copy mt-4">{copy}</p> : null}
  </div>
)

export default SectionHeading
