import { Link } from 'react-router-dom'
import type { ContestShortResponseDto } from '../../api/contests'
import {
  formatContestDate,
  getContestCardButtonClass,
  getContestLanguageLabel,
  getContestLevelLabel,
  getContestRegistrationLabel,
  getContestStatusTone,
  getContestSummaryLines,
  getParticipationLabel,
} from './competitionPresentation'

type CompetitionCardProps = {
  contest: ContestShortResponseDto
}

export function CompetitionCard({ contest }: CompetitionCardProps) {
  const summaryLines = getContestSummaryLines(contest.title)
  const participationLabel = getParticipationLabel(
    contest.participationType,
    contest.maxTeamSize,
  )

  return (
    <article className="rounded-[8px] border border-[#04CA37] bg-[#001A07] shadow-[0_0_0_1px_rgba(4,202,55,0.05)]">
      <div className="flex items-center justify-between gap-4 rounded-t-[7px] bg-[#04CA37] px-5 py-3.5 font-jetbrains text-[18px] font-bold leading-none text-[#08110A] sm:text-[22px]">
        <span>{formatContestDate(contest.startAt)}</span>
        <span className="text-right uppercase tracking-[0.06em]">
          {participationLabel}
        </span>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="space-y-2.5 font-jetbrains text-[14px] tracking-[0.08em] text-[#D3E6EB] sm:text-[15px]">
          <div className={getContestStatusTone(contest.status)}>
            {getContestRegistrationLabel(contest)}
          </div>

          <div className="text-[#04CA37]">
            LEVEL: {getContestLevelLabel(contest.level)}
          </div>
        </div>

        <div className="min-h-24 space-y-1 font-ibm text-[24px] leading-[1.18] tracking-[0.02em] text-[#C5DAE0]">
          {summaryLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        <div className="font-press-start text-[13px] leading-[1.55] text-[#04CA37] sm:text-[15px]">
          {getContestLanguageLabel(contest.supportedLanguages)}
        </div>

        <Link
          to={`/competitions/${contest.id}`}
          className={[
            'rounded-[2px] inline-flex items-center border px-4 py-2.5 font-jetbrains text-[15px] font-bold transition',
            getContestCardButtonClass(contest.status),
          ].join(' ')}
        >
          [Принять участие]
        </Link>
      </div>
    </article>
  )
}
