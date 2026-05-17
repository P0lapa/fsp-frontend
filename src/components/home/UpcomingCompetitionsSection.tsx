import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContests, type ContestShortResponseDto } from '../../api/contests'
import { CompetitionCard } from '../competitions/CompetitionCard'
import {
  getContestTimestamp,
} from '../competitions/competitionPresentation'
import { SectionFolderLabel } from './SectionFolderLabel'

type UpcomingCompetitionsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; contests: ContestShortResponseDto[] }

const VISIBLE_CONTESTS_COUNT = 3

function sortByStartAscending(contests: ContestShortResponseDto[]) {
  return [...contests].sort(
    (left, right) => getContestTimestamp(left.startAt) - getContestTimestamp(right.startAt),
  )
}

export function UpcomingCompetitionsSection() {
  const [state, setState] = useState<UpcomingCompetitionsState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    getContests()
      .then((contests) => {
        if (!isMounted) {
          return
        }

        setState({ status: 'ready', contests })
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setState({ status: 'error' })
      })

    return () => {
      isMounted = false
    }
  }, [])

  const upcomingContests = useMemo(() => {
    if (state.status !== 'ready') {
      return []
    }

    const activeUpcomingContests = sortByStartAscending(
      state.contests.filter((contest) => {
        const isDisplayableStatus =
          contest.status !== 'FINISHED' && contest.status !== 'CANCELLED'

        return isDisplayableStatus
      }),
    )

    if (activeUpcomingContests.length >= VISIBLE_CONTESTS_COUNT) {
      return activeUpcomingContests.slice(0, VISIBLE_CONTESTS_COUNT)
    }

    return sortByStartAscending(state.contests).slice(0, VISIBLE_CONTESTS_COUNT)
  }, [state])

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12 lg:py-14">
      <SectionFolderLabel path={String.raw`C:\SYSTEM_COMPETITIONS\ROOT-EXECUTE PROTOCOL_V2.EXE`} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-press-start text-[18px] text-[var(--color-accent)] sm:text-[22px]">
          //БЛИЖАЙШИЕ СОРЕВНОВАНИЯ
        </div>

        <Link
          to="/competitions"
          className="inline-flex items-center gap-3 font-jetbrains text-[18px] font-bold tracking-[0.04em] text-[var(--color-text-muted)] transition hover:text-[var(--color-accent)]"
        >
          <span>Ко всем соревнованиям</span>
          <span className="text-[28px] leading-none">→</span>
        </Link>
      </div>

      {state.status === 'loading' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:[grid-template-columns:repeat(3,minmax(286px,1fr))]">
          {Array.from({ length: VISIBLE_CONTESTS_COUNT }, (_, index) => (
            <div
              key={index}
              className="h-[320px] animate-pulse rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)]"
            />
          ))}
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] px-6 py-8 font-ibm text-lg text-[var(--color-text-muted)]">
          Не удалось загрузить ближайшие соревнования.
        </div>
      ) : null}

      {state.status === 'ready' ? (
        upcomingContests.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:[grid-template-columns:repeat(3,minmax(286px,1fr))]">
            {upcomingContests.map((contest) => (
              <CompetitionCard key={contest.id} contest={contest} />
            ))}
          </div>
        ) : (
          <div className="border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] px-6 py-8 font-ibm text-lg text-[var(--color-text-muted)]">
            Ближайшие соревнования скоро появятся.
          </div>
        )
      ) : null}
    </section>
  )
}
