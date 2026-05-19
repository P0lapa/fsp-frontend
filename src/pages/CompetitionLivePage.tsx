import { useParams } from 'react-router-dom'

export function CompetitionLivePage() {
  const { contestId } = useParams()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-12 text-[var(--color-text)] sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-10">
        <div className="mb-4 font-jetbrains text-sm tracking-[0.18em] text-[var(--color-accent)]">
          CONTEST #{contestId}
        </div>
        <h1 className="font-jetbrains text-3xl tracking-[0.06em] text-[var(--color-text)]">
          Страница проведения соревнования
        </h1>
      </div>
    </div>
  )
}
