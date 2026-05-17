import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getContestById, type ContestFullResponseDto } from '../api/contests'
import {
  formatContestDateTime,
  getContestDetailFacts,
  getContestLanguageLabel,
  getContestStatusTone,
  getParticipationLabel,
} from '../components/competitions/competitionPresentation'

type DetailsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; contest: ContestFullResponseDto }

export function CompetitionDetailsPage() {
  const { contestId } = useParams()
  const [state, setState] = useState<DetailsState>({ status: 'loading' })
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

  return (
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
        <div className="border-b border-[var(--color-border)] bg-[var(--color-accent)] px-6 py-5 font-jetbrains text-[22px] font-bold text-[var(--color-accent-contrast)] sm:text-[32px]">
          {formatContestDateTime(contest.startAt)}
        </div>

        <div className="grid gap-10 px-6 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:px-8 lg:py-10">
          <div>
            <div className={`mb-4 font-jetbrains text-lg ${getContestStatusTone(contest.status)}`}>
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
  )
}
