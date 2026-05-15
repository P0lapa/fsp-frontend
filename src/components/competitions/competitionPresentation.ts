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

export function formatContestDate(date: string | null | undefined) {
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatContestDateTime(date: string | null | undefined) {
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
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
    case 'REGISTRATION_OPEN':
      return 'text-[#9DFF00]'
    case 'RUNNING':
      return 'text-[#04CA37]'
    case 'FINISHED':
    case 'CANCELLED':
      return 'text-[#FF3B30]'
    case 'REGISTRATION_CLOSED':
      return 'text-[#D3E6EB]'
    case 'DRAFT':
      return 'text-[#7F9F01]'
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
    return 'border-[#7F9F01] bg-[#C0F000] text-[#111111] hover:translate-y-[-1px] hover:shadow-[0_0_24px_rgba(127,159,1,0.35)]'
  }

  return 'border-[#7F9F01] bg-[#0b0b0b] text-[#94B300] hover:bg-[#101010]'
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
