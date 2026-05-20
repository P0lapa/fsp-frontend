type FinishCompetitionModalProps = {
  isOpen: boolean
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function FinishCompetitionModal({
  isOpen,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: FinishCompetitionModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--color-bg)_72%,transparent)] px-4">
      <div className="w-full max-w-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-acid)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-jetbrains text-xl tracking-[0.08em] text-[var(--color-text)]">
              Завершить участие
            </h2>
            <p className="mt-2 font-ibm text-sm text-[var(--color-text-muted)]">
              После подтверждения отправка решений станет недоступна, и вы вернётесь на страницу
              соревнования.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="border border-[var(--color-border-subtle)] px-3 py-2 font-jetbrains text-xs tracking-[0.12em] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Отмена
          </button>
        </div>

        <div className="space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-4">
          <div className="font-ibm text-base leading-[1.7] text-[var(--color-text)]">
            Вы уверены, что хотите завершить участие в этом соревновании?
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_82%,var(--color-danger)_18%)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-danger)] transition hover:bg-[color:color-mix(in_srgb,var(--color-surface)_74%,var(--color-danger)_26%)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'ЗАВЕРШАЕМ...' : 'ПОДТВЕРДИТЬ'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-[var(--color-border-subtle)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              ОТМЕНА
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 font-ibm text-sm text-[var(--color-danger)]">{error}</p> : null}
      </div>
    </div>
  )
}
