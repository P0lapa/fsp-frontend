import type { TeamInviteResponseDto } from '../../api/contests'

export type TeamRegistrationMode = 'choose' | 'create' | 'join'

type TeamRegistrationModalProps = {
  isOpen: boolean
  mode: TeamRegistrationMode
  teamName: string
  inviteInput: string
  teamModalError: string | null
  createdInvite: TeamInviteResponseDto | null
  isRegistering: boolean
  isCopyingInvite: boolean
  copyInviteMessage: string | null
  onClose: () => void
  onModeChange: (mode: TeamRegistrationMode) => void
  onTeamNameChange: (value: string) => void
  onInviteInputChange: (value: string) => void
  onResetError: () => void
  onCreateTeam: () => void
  onJoinTeam: () => void
  onCopyInviteToken: () => void
}

export function TeamRegistrationModal({
  isOpen,
  mode,
  teamName,
  inviteInput,
  teamModalError,
  createdInvite,
  isRegistering,
  isCopyingInvite,
  copyInviteMessage,
  onClose,
  onModeChange,
  onTeamNameChange,
  onInviteInputChange,
  onResetError,
  onCreateTeam,
  onJoinTeam,
  onCopyInviteToken,
}: TeamRegistrationModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--color-bg)_72%,transparent)] px-4">
      <div className="w-full max-w-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-acid)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-jetbrains text-xl tracking-[0.08em] text-[var(--color-text)]">
              Командная регистрация
            </h2>
            <p className="mt-2 font-ibm text-sm text-[var(--color-text-muted)]">
              Выберите, хотите создать новую команду или присоединиться по токену.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border border-[var(--color-border-subtle)] px-3 py-2 font-jetbrains text-xs tracking-[0.12em] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            ОТМЕНА
          </button>
        </div>

        {!createdInvite ? (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  onModeChange('create')
                  onResetError()
                }}
                className={`border px-4 py-4 text-left transition ${
                  mode === 'create'
                    ? 'border-[var(--color-accent)] bg-[color:color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))]'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                }`}
              >
                <div className="font-jetbrains text-sm tracking-[0.12em] text-[var(--color-text)]">
                  СОЗДАТЬ КОМАНДУ
                </div>
                <div className="mt-2 font-ibm text-sm text-[var(--color-text-muted)]">
                  Станете капитаном и сразу получите токен для приглашения команды.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onModeChange('join')
                  onResetError()
                }}
                className={`border px-4 py-4 text-left transition ${
                  mode === 'join'
                    ? 'border-[var(--color-accent)] bg-[color:color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))]'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
                }`}
              >
                <div className="font-jetbrains text-sm tracking-[0.12em] text-[var(--color-text)]">
                  ПРИСОЕДИНИТЬСЯ
                </div>
                <div className="mt-2 font-ibm text-sm text-[var(--color-text-muted)]">
                  Вставьте токен приглашения. Старую ссылку тоже можно вставить целиком.
                </div>
              </button>
            </div>

            {mode === 'create' ? (
              <div className="space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-4">
                <label className="block">
                  <div className="mb-2 font-jetbrains text-xs tracking-[0.12em] text-[var(--color-acid)]">
                    НАЗВАНИЕ КОМАНДЫ
                  </div>
                  <input
                    value={teamName}
                    onChange={(event) => onTeamNameChange(event.target.value)}
                    placeholder="Например, Byte Force"
                    className="w-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 font-ibm text-base text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)]"
                  />
                </label>

                <button
                  type="button"
                  onClick={onCreateTeam}
                  disabled={isRegistering}
                  className="w-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-accent-contrast)] transition hover:bg-[var(--color-acid-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRegistering ? 'СОЗДАЁМ...' : 'СОЗДАТЬ И ЗАРЕГИСТРИРОВАТЬ'}
                </button>
              </div>
            ) : null}

            {mode === 'join' ? (
              <div className="space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-4">
                <label className="block">
                  <div className="mb-2 font-jetbrains text-xs tracking-[0.12em] text-[var(--color-acid)]">
                    ТОКЕН ПРИГЛАШЕНИЯ
                  </div>
                  <input
                    value={inviteInput}
                    onChange={(event) => onInviteInputChange(event.target.value)}
                    placeholder="Вставьте токен"
                    className="w-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 font-ibm text-base text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)]"
                  />
                </label>

                <button
                  type="button"
                  onClick={onJoinTeam}
                  disabled={isRegistering}
                  className="w-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-accent-contrast)] transition hover:bg-[var(--color-acid-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRegistering ? 'ПОДКЛЮЧАЕМ...' : 'ПРИСОЕДИНИТЬСЯ К КОМАНДЕ'}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg)] p-4">
            <div className="font-jetbrains text-sm tracking-[0.12em] text-[var(--color-accent)]">
              КОМАНДА СОЗДАНА
            </div>
            <p className="font-ibm text-sm text-[var(--color-text-muted)]">
              Передайте этот токен участникам команды, чтобы они смогли присоединиться.
            </p>

            <div className="break-all border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 font-ibm text-sm text-[var(--color-text)]">
              {createdInvite.inviteToken}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCopyInviteToken}
                disabled={isCopyingInvite}
                className="flex-1 border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-accent-contrast)] transition hover:bg-[var(--color-acid-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCopyingInvite ? 'КОПИРУЕМ...' : 'СКОПИРОВАТЬ ТОКЕН'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-[var(--color-border-subtle)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                ГОТОВО
              </button>
            </div>

            {copyInviteMessage ? (
              <p className="font-ibm text-sm text-[var(--color-text-muted)]">{copyInviteMessage}</p>
            ) : null}
          </div>
        )}

        {teamModalError ? (
          <p className="mt-4 font-ibm text-sm text-[var(--color-danger)]">{teamModalError}</p>
        ) : null}
      </div>
    </div>
  )
}
