import { useEffect, useMemo, useState } from 'react'
import {
  getContests,
  type ContestLevel,
  type ContestShortResponseDto,
  type ContestStatus,
} from '../api/contests'
import { CompetitionCard } from '../components/competitions/CompetitionCard'
import { CompetitionsFilters } from '../components/competitions/CompetitionsFilters'
import { CompetitionsHero } from '../components/competitions/CompetitionsHero'
import {
  COMPETITION_LANGUAGE_GROUPS,
  getContestTimestamp,
} from '../components/competitions/competitionPresentation'
import { SectionFolderLabel } from '../components/home/SectionFolderLabel'

type CompetitionsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; contests: ContestShortResponseDto[] }

const INITIAL_VISIBLE_COUNT = 6
const LOAD_MORE_STEP = 3

export function CompetitionsPage() {
  const [state, setState] = useState<CompetitionsState>({ status: 'loading' })
  const [search, setSearch] = useState('')
  const [selectedStack, setSelectedStack] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<ContestLevel | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<ContestStatus | 'ALL'>('ALL')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

  useEffect(() => {
    let isMounted = true

    getContests()
      .then((contests) => {
        if (isMounted) {
          const sortedContests = [...contests].sort(
            (left, right) => getContestTimestamp(right.startAt) - getContestTimestamp(left.startAt),
          )

          setState({ status: 'ready', contests: sortedContests })
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            status: 'error',
            message: 'Не удалось загрузить список соревнований.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  function resetVisibleCount() {
    setVisibleCount(INITIAL_VISIBLE_COUNT)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    resetVisibleCount()
  }

  function handleStackChange(value: string) {
    setSelectedStack(value)
    resetVisibleCount()
  }

  function handleLevelChange(value: ContestLevel | 'ALL') {
    setSelectedLevel(value)
    resetVisibleCount()
  }

  function handleStatusChange(value: ContestStatus | 'ALL') {
    setSelectedStatus(value)
    resetVisibleCount()
  }

  const filteredContests = useMemo(() => {
    if (state.status !== 'ready') {
      return []
    }

    return state.contests.filter((contest) => {
      const normalizedSearch = search.trim().toLowerCase()
      const matchesSearch =
        normalizedSearch.length === 0 ||
        contest.title.toLowerCase().includes(normalizedSearch)

      const selectedLanguageGroup = COMPETITION_LANGUAGE_GROUPS.find(
        (group) => group.key === selectedStack,
      )

      const matchesStack =
        !selectedLanguageGroup ||
        selectedLanguageGroup.languages.some((language) =>
          contest.supportedLanguages.includes(language),
        )

      const matchesLevel =
        selectedLevel === 'ALL' || contest.level === selectedLevel

      const matchesStatus =
        selectedStatus === 'ALL' || contest.status === selectedStatus

      return matchesSearch && matchesStack && matchesLevel && matchesStatus
    })
  }, [search, selectedLevel, selectedStack, selectedStatus, state])

  const visibleContests = filteredContests.slice(0, visibleCount)
  const canLoadMore = visibleContests.length < filteredContests.length

  return (
    <>
      <CompetitionsHero />

      <section
        id="competitions-list"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12 lg:py-14"
      >
        <div className="mb-8">
          <SectionFolderLabel path={String.raw`C:\SYSTEM_COMPETITIONS\ROOT-EXECUTE PROTOCOL_V2.EXE`} />

          <div className="mb-4 font-press-start text-[18px] text-[var(--color-accent)] sm:text-[22px]">
            //СОРЕВНОВАНИЯ
          </div>

          <CompetitionsFilters
            search={search}
            selectedStack={selectedStack}
            selectedLevel={selectedLevel}
            selectedStatus={selectedStatus}
            onSearchChange={handleSearchChange}
            onStackChange={handleStackChange}
            onLevelChange={handleLevelChange}
            onStatusChange={handleStatusChange}
          />
        </div>

        {state.status === 'loading' ? (
          <div className="grid gap-5 md:grid-cols-2 xl:[grid-template-columns:repeat(3,minmax(286px,1fr))]">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-[360px] animate-pulse rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)]"
              />
            ))}
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="border border-[var(--color-danger)] bg-[color:color-mix(in_srgb,var(--color-surface)_84%,var(--color-danger)_16%)] px-6 py-5 font-ibm text-lg text-[var(--color-danger)]">
            {state.message}
          </div>
        ) : null}

        {state.status === 'ready' ? (
          <>
            {filteredContests.length > 0 ? (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:[grid-template-columns:repeat(3,minmax(286px,1fr))]">
                  {visibleContests.map((contest) => (
                    <CompetitionCard key={contest.id} contest={contest} />
                  ))}
                </div>

                {canLoadMore ? (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((current) => current + LOAD_MORE_STEP)}
                      className="border border-[var(--color-button-active-border)] bg-[var(--color-button-active-bg)] px-6 py-3 font-jetbrains text-lg font-bold text-[var(--color-button-active-text)] transition hover:translate-y-[-1px] hover:bg-[var(--color-button-active-hover-bg)] hover:text-[var(--color-button-active-hover-text)] hover:shadow-[var(--shadow-acid)]"
                    >
                      [Показать ещё]
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] px-6 py-10 text-center font-ibm text-xl text-[var(--color-text-muted)]">
                По заданным фильтрам соревнования не найдены.
              </div>
            )}
          </>
        ) : null}
      </section>
    </>
  )
}
