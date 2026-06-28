// BookVerse — Barra de progresso de leitura

export function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  const done = total > 0 && current >= total

  return (
    <div className="bv-progress-track">
      <div
        className={`bv-progress-fill ${done ? 'bv-progress-fill--done' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
