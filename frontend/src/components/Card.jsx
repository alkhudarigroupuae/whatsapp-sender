export function Card({ title, subtitle, right, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || right) && (
        <header className="card-head">
          <div className="card-titles">
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          {right && <div className="card-right">{right}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  )
}
