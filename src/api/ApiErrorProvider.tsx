import { useEffect, useState, type ReactNode } from 'react'
import { registerApiErrorHandler, type ApiErrorPayload } from './apiErrorBus'

type ApiErrorProviderProps = {
  children: ReactNode
}

export function ApiErrorProvider({ children }: ApiErrorProviderProps) {
  const [error, setError] = useState<ApiErrorPayload | null>(null)

  useEffect(() => {
    registerApiErrorHandler((payload) => {
      setError(payload)
    })

    return () => {
      registerApiErrorHandler(null)
    }
  }, [])

  return (
    <>
      {children}

      {error ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:color-mix(in_srgb,var(--color-bg)_74%,transparent)] px-4">
          <div className="w-full max-w-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-acid)]">
            <div className="mb-4 font-jetbrains text-lg tracking-[0.08em] text-[var(--color-danger)]">
              {error.error || 'Ошибка'}
            </div>

            <p className="mb-6 font-ibm text-base leading-[1.7] text-[var(--color-text)]">
              {error.message}
            </p>

            <button
              type="button"
              onClick={() => setError(null)}
              className="w-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-accent-contrast)] transition hover:bg-[var(--color-acid-strong)]"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
