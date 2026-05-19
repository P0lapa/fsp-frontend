import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  cancelContestParticipation,
  createContestTeam,
  getContestById,
  getContestParticipantStatus,
  getMyContestParticipation,
  joinContestTeam,
  registerForContest,
  type ContestFullResponseDto,
  type ContestParticipantStatusDto,
  type ParticipationResponseDto,
  type TeamInviteResponseDto,
} from '../api/contests'
import { useAuth } from '../auth/AuthContext'
import {
  formatContestDateTime,
  getContestDetailFacts,
  getContestLanguageLabel,
  getContestStatusTone,
  getContestTimestamp,
  getParticipationLabel,
} from '../components/competitions/competitionPresentation'
import {
  TeamRegistrationModal,
  type TeamRegistrationMode,
} from '../components/competitions/TeamRegistrationModal'

type DetailsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; contest: ContestFullResponseDto }

type ParticipantState =
  | { status: 'idle' }
  | { status: 'error'; contestId: number; message: string }
  | { status: 'ready'; contestId: number; participant: ContestParticipantStatusDto }

type ParticipationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; participation: ParticipationResponseDto | null }

function extractInviteToken(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(trimmedValue, window.location.origin)
    const tokenFromQuery = parsedUrl.searchParams.get('token')

    if (tokenFromQuery) {
      return tokenFromQuery.trim()
    }
  } catch {
    const queryPart = trimmedValue.includes('?')
      ? trimmedValue.slice(trimmedValue.indexOf('?'))
      : trimmedValue

    try {
      const params = new URLSearchParams(queryPart)
      const tokenFromQuery = params.get('token')

      if (tokenFromQuery) {
        return tokenFromQuery.trim()
      }
    } catch {
      return trimmedValue
    }
  }

  return trimmedValue
}

export function CompetitionDetailsPage() {
  const { contestId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isInitialized, login } = useAuth()
  const [state, setState] = useState<DetailsState>({ status: 'loading' })
  const [participantState, setParticipantState] = useState<ParticipantState>({ status: 'idle' })
  const [participationState, setParticipationState] = useState<ParticipationState>({
    status: 'idle',
  })
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isCancellingParticipation, setIsCancellingParticipation] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [teamRegistrationMode, setTeamRegistrationMode] =
    useState<TeamRegistrationMode>('choose')
  const [teamName, setTeamName] = useState('')
  const [inviteInput, setInviteInput] = useState('')
  const [teamModalError, setTeamModalError] = useState<string | null>(null)
  const [createdInvite, setCreatedInvite] = useState<TeamInviteResponseDto | null>(null)
  const [isCopyingInvite, setIsCopyingInvite] = useState(false)
  const [copyInviteMessage, setCopyInviteMessage] = useState<string | null>(null)
  const parsedContestId = Number(contestId)
  const hasInvalidContestId = !Number.isFinite(parsedContestId)

  useEffect(() => {
    if (hasInvalidContestId) {
      return
    }

    let isMounted = true

    getContestById(parsedContestId)
      .then((contest) => {
        if (isMounted) {
          setState({ status: 'ready', contest })
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            status: 'error',
            message: 'Не удалось загрузить данные о соревновании.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [hasInvalidContestId, parsedContestId])

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || hasInvalidContestId || state.status !== 'ready') {
      return
    }

    let isMounted = true

    getMyContestParticipation(parsedContestId)
      .then((participation) => {
        if (isMounted) {
          setParticipationState({ status: 'ready', participation })
        }
      })
      .catch(() => {
        if (isMounted) {
          setParticipationState({
            status: 'error',
            message: 'Не удалось определить, участвуете ли вы в соревновании.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [hasInvalidContestId, isAuthenticated, isInitialized, parsedContestId, state.status])

  useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      hasInvalidContestId ||
      state.status !== 'ready' ||
      state.contest.status !== 'REGISTRATION_OPEN'
    ) {
      return
    }

    let isMounted = true

    getContestParticipantStatus(parsedContestId)
      .then((participant) => {
        if (isMounted) {
          setParticipantState({ status: 'ready', contestId: parsedContestId, participant })
        }
      })
      .catch(() => {
        if (isMounted) {
          setParticipantState({
            status: 'error',
            contestId: parsedContestId,
            message: 'Не удалось проверить статус регистрации.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [hasInvalidContestId, isAuthenticated, isInitialized, parsedContestId, state])

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || state.status !== 'ready') {
      return
    }

    if (participationState.status !== 'ready' || !participationState.participation) {
      return
    }

    const hasContestStarted =
      state.contest.status === 'RUNNING' || Date.now() >= getContestTimestamp(state.contest.startAt)

    if (!hasContestStarted) {
      return
    }

    navigate(`/competitions/${state.contest.id}/live`, { replace: true })
  }, [isAuthenticated, isInitialized, navigate, participationState, state])

  function closeTeamModal() {
    setIsTeamModalOpen(false)
    setTeamRegistrationMode('choose')
    setTeamName('')
    setInviteInput('')
    setTeamModalError(null)
    setCreatedInvite(null)
    setCopyInviteMessage(null)
    setIsCopyingInvite(false)
  }

  async function refreshParticipationState() {
    const [participant, participation] = await Promise.all([
      getContestParticipantStatus(parsedContestId).catch(() => null),
      getMyContestParticipation(parsedContestId),
    ])

    if (participant) {
      setParticipantState({ status: 'ready', contestId: parsedContestId, participant })
    } else {
      setParticipantState({ status: 'idle' })
    }

    setParticipationState({ status: 'ready', participation })
  }

  async function handleRegisterButtonClick(contest: ContestFullResponseDto) {
    if (!isAuthenticated) {
      await login()
      return
    }

    if (contest.participationType === 'TEAM') {
      setRegistrationError(null)
      setTeamModalError(null)
      setCreatedInvite(null)
      setCopyInviteMessage(null)
      setTeamRegistrationMode('choose')
      setIsTeamModalOpen(true)
      return
    }

    try {
      setRegistrationError(null)
      setIsRegistering(true)
      await registerForContest(parsedContestId)
      await refreshParticipationState()
    } catch {
      setRegistrationError('Не удалось зарегистрироваться на соревнование.')
    } finally {
      setIsRegistering(false)
    }
  }

  async function handleCancelParticipation() {
    try {
      setRegistrationError(null)
      setIsCancellingParticipation(true)
      await cancelContestParticipation(parsedContestId)
      await refreshParticipationState()
    } catch {
      setRegistrationError('Не удалось отменить участие в соревновании.')
    } finally {
      setIsCancellingParticipation(false)
    }
  }

  async function handleCreateTeam() {
    const trimmedTeamName = teamName.trim()

    if (!trimmedTeamName) {
      setTeamModalError('Введите название команды.')
      return
    }

    try {
      setTeamModalError(null)
      setRegistrationError(null)
      setIsRegistering(true)
      const response = await createContestTeam(parsedContestId, {
        name: trimmedTeamName,
      })
      setCreatedInvite(response.invite)
      await refreshParticipationState()
    } catch {
      setTeamModalError('Не удалось создать команду и зарегистрироваться.')
    } finally {
      setIsRegistering(false)
    }
  }

  async function handleJoinTeam() {
    const token = extractInviteToken(inviteInput)

    if (!token) {
      setTeamModalError('Вставьте токен приглашения.')
      return
    }

    try {
      setTeamModalError(null)
      setRegistrationError(null)
      setIsRegistering(true)
      await joinContestTeam(parsedContestId, { token })
      await refreshParticipationState()
      closeTeamModal()
    } catch {
      setTeamModalError('Не удалось присоединиться к команде по этому токену.')
    } finally {
      setIsRegistering(false)
    }
  }

  async function handleCopyInviteToken() {
    if (!createdInvite?.inviteToken) {
      return
    }

    try {
      setCopyInviteMessage(null)
      setIsCopyingInvite(true)
      await navigator.clipboard.writeText(createdInvite.inviteToken)
      setCopyInviteMessage('Токен скопирован.')
    } catch {
      setCopyInviteMessage('Не удалось скопировать токен автоматически.')
    } finally {
      setIsCopyingInvite(false)
    }
  }

  if (hasInvalidContestId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12">
        <div className="border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,var(--color-danger)_16%)] px-6 py-5 font-ibm text-lg text-[var(--color-danger)]">
          Некорректный идентификатор соревнования.
        </div>
      </div>
    )
  }

  if (
    state.status === 'loading' ||
    (state.status === 'ready' && state.contest.id !== parsedContestId)
  ) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 font-ibm text-[var(--color-text-muted)] sm:px-6 md:px-8 lg:px-12">
        Загрузка соревнования...
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12">
        <div className="border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,var(--color-danger)_16%)] px-6 py-5 font-ibm text-lg text-[var(--color-danger)]">
          {state.message}
        </div>
      </div>
    )
  }

  const { contest } = state
  const facts = getContestDetailFacts(contest)
  const isParticipantStateCurrent =
    participantState.status !== 'idle' && participantState.contestId === parsedContestId
  const participantInfo =
    participantState.status === 'ready' && participantState.contestId === parsedContestId
      ? participantState.participant
      : null
  const isParticipantStateLoading =
    isInitialized &&
    isAuthenticated &&
    contest.status === 'REGISTRATION_OPEN' &&
    !participantInfo &&
    participantState.status !== 'error'
  const participationInfo =
    participationState.status === 'ready' ? participationState.participation : null
  const isParticipating = Boolean(participationInfo)
  const participationLabel =
    participantInfo?.teamName && contest.participationType === 'TEAM'
      ? `Вы участвуете в команде «${participantInfo.teamName}»`
      : 'Вы участвуете в соревновании'
  const canShowRegistrationSection =
    contest.status === 'REGISTRATION_OPEN' &&
    isInitialized &&
    (!isAuthenticated ||
      isParticipantStateLoading ||
      (participantState.status === 'error' && isParticipantStateCurrent) ||
      !!(participantInfo && !participantInfo.registered && participantInfo.canRegister))
  const canShowRegistrationButton =
    contest.status === 'REGISTRATION_OPEN' &&
    isInitialized &&
    (!isAuthenticated ||
      (!!participantInfo && !participantInfo.registered && participantInfo.canRegister))

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8 lg:px-12 lg:py-14">
        <div className="mb-6">
          <Link
            to="/competitions"
            className="font-jetbrains text-sm tracking-[0.18em] text-[var(--color-accent)] transition hover:text-[var(--color-acid-strong)]"
          >
            &lt; НАЗАД К СПИСКУ
          </Link>
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-soft)]">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-accent)] px-6 py-5 font-jetbrains text-[22px] font-bold text-[var(--color-accent-contrast)] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:text-[32px]">
            <span>{formatContestDateTime(contest.startAt)}</span>

            {isInitialized &&
            isAuthenticated &&
            state.status === 'ready' &&
            participationState.status === 'idle' ? (
              <span className="mt-3 block text-sm font-normal tracking-[0.1em] sm:mt-0">
                Проверяем участие...
              </span>
            ) : null}

            {isParticipating ? (
              <div className="mt-4 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-base font-normal tracking-[0.08em] text-[var(--color-accent-contrast)] sm:text-lg">
                  {participationLabel}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCancelParticipation()}
                  disabled={isCancellingParticipation}
                  className="border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_82%,var(--color-danger)_18%)] px-4 py-2 text-sm font-normal tracking-[0.08em] text-[var(--color-danger)] transition hover:bg-[color:color-mix(in_srgb,var(--color-surface)_74%,var(--color-danger)_26%)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCancellingParticipation ? 'ОТМЕНЯЕМ...' : 'ОТМЕНИТЬ УЧАСТИЕ'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-10 px-6 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:px-8 lg:py-10">
            <div>
              <div
                className={`mb-4 font-jetbrains text-lg ${getContestStatusTone(contest.status)}`}
              >
                {getParticipationLabel(contest.participationType, contest.maxTeamSize)}
              </div>

              <h1 className="mb-5 font-jetbrains text-[34px] leading-[1.1] tracking-[0.04em] text-[var(--color-text)] sm:text-[48px]">
                {contest.title}
              </h1>

              <div className="mb-6 font-press-start text-[14px] leading-[1.7] text-[var(--color-accent)] sm:text-[16px]">
                {getContestLanguageLabel(contest.supportedLanguages)}
              </div>

              <div className="space-y-5 font-ibm text-lg leading-[1.7] text-[var(--color-text-muted)]">
                <p>
                  {contest.description?.trim() ||
                    'Описание соревнования пока не заполнено. Базовые параметры уже доступны, а детальная программа появится позже.'}
                </p>

                {contest.problemSet ? (
                  <div className="border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 py-4">
                    <div className="mb-2 font-jetbrains text-sm tracking-[0.18em] text-[var(--color-accent)]">
                      ПРОБЛЕМНЫЙ НАБОР
                    </div>
                    <div className="text-xl text-[var(--color-text)]">
                      {contest.problemSet.title}
                    </div>
                    <div className="mt-2 text-base text-[var(--color-text-muted)]">
                      Задач: {contest.problemSet.taskCount}
                    </div>
                  </div>
                ) : null}

                {canShowRegistrationSection ? (
                  <div className="border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 py-4">
                    {canShowRegistrationButton ? (
                      <button
                        type="button"
                        onClick={() => void handleRegisterButtonClick(contest)}
                        disabled={isRegistering || isParticipantStateLoading}
                        className="w-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-3 font-jetbrains text-sm tracking-[0.12em] text-[var(--color-accent-contrast)] transition hover:bg-[var(--color-acid-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRegistering ? 'ОБРАБОТКА...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
                      </button>
                    ) : null}

                    {contest.participationType === 'TEAM' && canShowRegistrationButton ? (
                      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                        Для командного участия можно создать новую команду или присоединиться по
                        токену приглашения.
                      </p>
                    ) : null}

                    {isParticipantStateLoading ? (
                      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                        Проверяем возможность регистрации...
                      </p>
                    ) : null}

                    {participantState.status === 'error' && isParticipantStateCurrent ? (
                      <p className="mt-3 text-sm text-[var(--color-danger)]">
                        {participantState.message}
                      </p>
                    ) : null}

                    {participationState.status === 'error' ? (
                      <p className="mt-3 text-sm text-[var(--color-danger)]">
                        {participationState.message}
                      </p>
                    ) : null}

                    {registrationError ? (
                      <p className="mt-3 text-sm text-[var(--color-danger)]">{registrationError}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="space-y-4 border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
              <div className="font-jetbrains text-sm tracking-[0.18em] text-[var(--color-accent)]">
                ПАРАМЕТРЫ
              </div>

              <div className="space-y-3">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="border border-[var(--color-border-subtle)] bg-[var(--color-bg)] px-4 py-3"
                  >
                    <div className="mb-1 font-jetbrains text-xs tracking-[0.16em] text-[var(--color-acid)]">
                      {fact.label}
                    </div>
                    <div className="font-ibm text-base text-[var(--color-text)]">{fact.value}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>

      <TeamRegistrationModal
        isOpen={isTeamModalOpen}
        mode={teamRegistrationMode}
        teamName={teamName}
        inviteInput={inviteInput}
        teamModalError={teamModalError}
        createdInvite={createdInvite}
        isRegistering={isRegistering}
        isCopyingInvite={isCopyingInvite}
        copyInviteMessage={copyInviteMessage}
        onClose={closeTeamModal}
        onModeChange={setTeamRegistrationMode}
        onTeamNameChange={setTeamName}
        onInviteInputChange={setInviteInput}
        onResetError={() => setTeamModalError(null)}
        onCreateTeam={() => void handleCreateTeam()}
        onJoinTeam={() => void handleJoinTeam()}
        onCopyInviteToken={() => void handleCopyInviteToken()}
      />
    </>
  )
}
