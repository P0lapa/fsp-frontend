import type {
  ContestFullResponseDto,
  ContestLevel,
  ContestShortResponseDto,
  ContestStatus,
  ParticipationType,
  ProgrammingLanguage,
} from '../../api/contests'

export type CompetitionLanguageGroup = {
  key: string
  label: string
  languages: ProgrammingLanguage[]
}

export const COMPETITION_LANGUAGE_GROUPS: CompetitionLanguageGroup[] = [
  { key: 'cpp', label: 'C++', languages: ['CPP'] },
  { key: 'java', label: 'Java', languages: ['JAVA'] },
  { key: 'python', label: 'Python', languages: ['PYTHON'] },
  { key: 'kotlin', label: 'Kotlin', languages: ['KOTLIN'] },
]

function getValidDate(date: string | null | undefined) {
  if (!date) {
    return null
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

export function formatContestDate(date: string | null | undefined) {
  const parsedDate = getValidDate(date)

  if (!parsedDate) {
    return '—'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsedDate)
}

export function formatContestDateTime(date: string | null | undefined) {
  const parsedDate = getValidDate(date)

  if (!parsedDate) {
    return '—'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}

export function getContestTimestamp(date: string | null | undefined) {
  return getValidDate(date)?.getTime() ?? Number.NEGATIVE_INFINITY
}

export function getContestLevelLabel(level: ContestLevel) {
  switch (level) {
    case 'LITE':
      return 'Lite'
    case 'MEDIUM':
      return 'Medium'
    case 'HARD':
      return 'Hard'
  }
}

export function getContestLevelTone(level: ContestLevel) {
  switch (level) {
    case 'LITE':
      return 'text-[var(--color-level-lite)]'
    case 'MEDIUM':
      return 'text-[var(--color-level-medium)]'
    case 'HARD':
      return 'text-[var(--color-level-hard)]'
  }
}

export function getContestStatusLabel(status: ContestStatus) {
  switch (status) {
    case 'DRAFT':
      return 'Черновик'
    case 'REGISTRATION_OPEN':
      return 'Регистрация открыта'
    case 'REGISTRATION_CLOSED':
      return 'Регистрация закрыта'
    case 'RUNNING':
      return 'Идёт сейчас'
    case 'FINISHED':
      return 'Завершён'
    case 'CANCELLED':
      return 'Отменён'
  }
}

export function getContestStatusTone(status: ContestStatus) {
  switch (status) {
    case 'DRAFT':
      return 'text-[var(--color-status-draft)]'
    case 'REGISTRATION_OPEN':
      return 'text-[var(--color-status-open)]'
    case 'REGISTRATION_CLOSED':
      return 'text-[var(--color-status-closed)]'
    case 'RUNNING':
      return 'text-[var(--color-status-running)]'
    case 'FINISHED':
      return 'text-[var(--color-status-finished)]'
    case 'CANCELLED':
      return 'text-[var(--color-status-cancelled)]'
  }
}

export function getParticipationLabel(
  participationType: ParticipationType,
  maxTeamSize: number | null,
) {
  if (participationType === 'TEAM') {
    return maxTeamSize ? `Команда: ${maxTeamSize} чел.` : 'Командное участие'
  }

  return 'Индивидуальное'
}

export function getContestRegistrationLabel(
  contest: Pick<ContestShortResponseDto, 'registrationEndAt' | 'status'>,
) {
  switch (contest.status) {
    case 'REGISTRATION_OPEN':
      return contest.registrationEndAt
        ? `Приём заявок: до ${formatContestDate(contest.registrationEndAt)}`
        : 'Приём заявок открыт'
    case 'REGISTRATION_CLOSED':
      return 'Приём заявок: закрыт'
    case 'RUNNING':
      return 'Соревнование уже идёт'
    case 'FINISHED':
      return 'Приём заявок: завершён'
    case 'CANCELLED':
      return 'Соревнование отменено'
    case 'DRAFT':
      return 'Скоро появится'
  }
}

export function getContestCardButtonClass(status: ContestStatus) {
  if (status === 'REGISTRATION_OPEN') {
    return 'border-[var(--color-acid)] bg-[var(--color-acid-strong)] text-[var(--color-acid-contrast)] hover:translate-y-[-1px] hover:shadow-[var(--shadow-acid)]'
  }

  return 'border-[var(--color-acid)] bg-[var(--color-surface)] text-[var(--color-acid)] hover:bg-[color:color-mix(in_srgb,var(--color-surface)_85%,var(--color-acid)_15%)]'
}

export function getContestLanguageLabel(languages: ProgrammingLanguage[]) {
  return languages
    .map((language) => {
      switch (language) {
        case 'CPP':
          return 'C++'
        case 'JAVA':
          return 'Java'
        case 'PYTHON':
          return 'Python'
        case 'KOTLIN':
          return 'Kotlin'
      }
    })
    .join(' / ')
}

export function getContestSummaryLines(title: string) {
  const words = title.split(/\s+/).filter(Boolean)
  const lines: string[] = []

  for (let index = 0; index < words.length; index += 3) {
    lines.push(words.slice(index, index + 3).join(' '))
  }

  return lines
}

export function getContestDetailFacts(contest: ContestFullResponseDto) {
  return [
    { label: 'Формат', value: contest.format },
    { label: 'Уровень', value: getContestLevelLabel(contest.level) },
    { label: 'Статус', value: getContestStatusLabel(contest.status) },
    {
      label: 'Участие',
      value: getParticipationLabel(contest.participationType, contest.maxTeamSize),
    },
    { label: 'Старт', value: formatContestDateTime(contest.startAt) },
    { label: 'Финиш', value: formatContestDateTime(contest.endAt) },
    {
      label: 'Регистрация',
      value: contest.registrationEndAt
        ? `до ${formatContestDateTime(contest.registrationEndAt)}`
        : 'Без дедлайна',
    },
  ]
}
