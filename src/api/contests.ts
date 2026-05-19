import { authFetch } from './authFetch'

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

export type ContestParticipantStatusDto = {
  registered: boolean
  participantType: ParticipationType | null
  teamId: number | null
  teamName: string | null
  isCaptain: boolean | null
  canRegister: boolean
  canSubmit: boolean
}

export type TeamInviteResponseDto = {
  inviteToken: string
  inviteLink: string
  enabled: boolean
}

export type ContestRegistrationResponseDto = {
  invite: TeamInviteResponseDto | null
}

export type ParticipationResponseDto = {
  id: number
  contestId: number
  teamId: number | null
  userId: number
  participantType: ParticipationType
  isCaptain: boolean
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'DISQUALIFIED'
  registeredAt: string
}

type TeamCreateRequestDto = {
  name: string
  contactEmail?: string | null
}

type TeamJoinByTokenRequestDto = {
  token: string
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

type ApiAuthGetOptions = {
  silentErrorStatuses?: number[]
}

async function apiAuthGet<T>(path: string, options: ApiAuthGetOptions = {}): Promise<T> {
  const response = await authFetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    silentErrorStatuses: options.silentErrorStatuses,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

async function apiAuthPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  })

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await authFetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

async function apiAuthDelete(path: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }
}

export function getContests() {
  return apiGet<ContestShortResponseDto[]>('/contests')
}

export function getContestById(contestId: number) {
  return apiGet<ContestFullResponseDto>(`/contests/${contestId}`)
}

export function getContestParticipantStatus(contestId: number) {
  return apiAuthGet<ContestParticipantStatusDto>(`/contests/${contestId}/me`)
}

export async function getMyContestParticipation(contestId: number) {
  try {
    return await apiAuthGet<ParticipationResponseDto>(`/contests/${contestId}/my-participation`, {
      silentErrorStatuses: [404],
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'API request failed with status 404'
    ) {
      return null
    }

    throw error
  }
}

export function registerForContest(contestId: number) {
  return apiAuthPost<ContestRegistrationResponseDto>(`/contests/${contestId}/register`)
}

export function createContestTeam(contestId: number, request: TeamCreateRequestDto) {
  return apiAuthPost<ContestRegistrationResponseDto>(`/contests/${contestId}/teams`, request)
}

export function joinContestTeam(contestId: number, request: TeamJoinByTokenRequestDto) {
  return apiAuthPost<ContestRegistrationResponseDto>(`/contests/${contestId}/teams/join`, request)
}

export function cancelContestParticipation(contestId: number) {
  return apiAuthDelete(`/contests/${contestId}/register`)
}
