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
        <div className="border border-[#FF3B30] bg-[#180505] px-6 py-5 font-ibm text-lg text-[#FFD5D2]">
          Некорректный идентификатор соревнования.
        </div>
      </div>
    )
  }

  if (state.status === 'loading' || (state.status === 'ready' && state.contest.id !== parsedContestId)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-[#B7D0D8] sm:px-6 md:px-8 lg:px-12">
        Загрузка соревнования...
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8 lg:px-12">
        <div className="border border-[#FF3B30] bg-[#180505] px-6 py-5 font-ibm text-lg text-[#FFD5D2]">
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
          className="font-jetbrains text-sm tracking-[0.18em] text-[#04CA37] hover:text-[#9DFF00]"
        >
          &lt; НАЗАД К СПИСКУ
        </Link>
      </div>

      <section className="overflow-hidden rounded-[12px] border border-[#04CA37] bg-[#031208]">
        <div className="border-b border-[#04CA37] bg-[#04CA37] px-6 py-5 font-jetbrains text-[22px] font-bold text-[#08110A] sm:text-[32px]">
          {formatContestDateTime(contest.startAt)}
        </div>

        <div className="grid gap-10 px-6 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:px-8 lg:py-10">
          <div>
            <div className={`mb-4 font-jetbrains text-lg ${getContestStatusTone(contest.status)}`}>
              {getParticipationLabel(contest.participationType, contest.maxTeamSize)}
            </div>

            <h1 className="mb-5 font-jetbrains text-[34px] leading-[1.1] tracking-[0.04em] text-[#D3E6EB] sm:text-[48px]">
              {contest.title}
            </h1>

            <div className="mb-6 font-press-start text-[14px] leading-[1.7] text-[#04CA37] sm:text-[16px]">
              {getContestLanguageLabel(contest.supportedLanguages)}
            </div>

            <div className="space-y-5 font-ibm text-lg leading-[1.7] text-[#B7D0D8]">
              <p>
                {contest.description?.trim() ||
                  'Описание соревнования пока не заполнено. Базовые параметры уже доступны, а детальная программа появится позже.'}
              </p>

              {contest.problemSet ? (
                <div className="border border-[#1A3A23] bg-[#08110A] px-5 py-4">
                  <div className="mb-2 font-jetbrains text-sm tracking-[0.18em] text-[#04CA37]">
                    ПРОБЛЕМНЫЙ НАБОР
                  </div>
                  <div className="text-xl text-[#D3E6EB]">{contest.problemSet.title}</div>
                  <div className="mt-2 text-base text-[#9DB4BC]">
                    Задач: {contest.problemSet.taskCount}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4 border border-[#1A3A23] bg-[#08110A] p-5">
            <div className="font-jetbrains text-sm tracking-[0.18em] text-[#04CA37]">
              ПАРАМЕТРЫ
            </div>

            <div className="space-y-3">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="border border-[#14261A] bg-[#061009] px-4 py-3"
                >
                  <div className="mb-1 font-jetbrains text-xs tracking-[0.16em] text-[#7F9F01]">
                    {fact.label}
                  </div>
                  <div className="font-ibm text-base text-[#D3E6EB]">{fact.value}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
