export type ContestLevel = 'LITE' | 'MEDIUM' | 'HARD'

export type ContestStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'RUNNING'
  | 'FINISHED'
  | 'CANCELLED'

export type ParticipationType = 'INDIVIDUAL' | 'TEAM'

export type ProgrammingLanguage = 'CPP' | 'JAVA' | 'PYTHON' | 'KOTLIN'

export type ContestShortResponseDto = {
  id: number
  title: string
  startAt: string
  endAt: string
  registrationEndAt: string | null
  level: ContestLevel
  status: ContestStatus
  maxTeamSize: number | null
  participationType: ParticipationType
  supportedLanguages: ProgrammingLanguage[]
}

export type ProblemSetShortResponseDto = {
  id: number
  title: string
  description: string | null
  taskCount: number
}

export type ContestFullResponseDto = ContestShortResponseDto & {
  description: string | null
  format: 'ICPC' | 'IOI' | 'HACKATHON' | 'CUSTOM'
  registrationStartAt: string | null
  problemSet?: ProblemSetShortResponseDto | null
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8080/api'

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export function getContests() {
  return apiGet<ContestShortResponseDto[]>('/contests')
}

export function getContestById(contestId: number) {
  return apiGet<ContestFullResponseDto>(`/contests/${contestId}`)
}
