import { Link } from 'react-router-dom'
import type { ContestShortResponseDto } from '../../api/contests'
import {
  formatContestDate,
  getContestCardButtonClass,
  getContestLanguageLabel,
  getContestLevelLabel,
  getContestLevelTone,
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
    <article className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-info-ring)]">
      <div className="flex items-center justify-between gap-4 rounded-t-[8px] bg-[var(--color-card-accent)] px-5 py-3.5 font-jetbrains text-[18px] font-bold leading-none text-[var(--color-card-accent-contrast)] sm:text-[22px]">
        <span>{formatContestDate(contest.startAt)}</span>
        <span className="text-right uppercase tracking-[0.06em]">
          {participationLabel}
        </span>
      </div>

      <div className="rounded-[8px] space-y-2 bg-[var(--color-surface-soft)] px-4 py-4">
        <div className="space-y-1 font-jetbrains text-[14px] tracking-[0.08em] text-[var(--color-text)] sm:text-[15px]">
          <div className={getContestStatusTone(contest.status)}>
            {getContestRegistrationLabel(contest)}
          </div>

          <div className={getContestLevelTone(contest.level)}>
            LEVEL: {getContestLevelLabel(contest.level)}
          </div>
        </div>

        <div className="min-h-24 space-y-1 font-ibm text-[24px] leading-[1.18] tracking-[0.02em] text-[var(--color-text)]">
          {summaryLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        <div className="font-press-start text-[13px] leading-[1.55] text-[var(--color-accent)] sm:text-[15px]">
          {getContestLanguageLabel(contest.supportedLanguages)}
        </div>

        <Link
          to={`/competitions/${contest.id}`}
          className={[
            'inline-flex items-center rounded-[2px] border px-4 py-2.5 font-jetbrains text-[15px] font-bold transition',
            getContestCardButtonClass(contest.status),
          ].join(' ')}
        >
          [Принять участие]
        </Link>
      </div>
    </article>
  )
}
