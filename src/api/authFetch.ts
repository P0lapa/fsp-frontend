import keycloak from '../auth/keycloak'
import { notifyApiError } from './apiErrorBus'

type AuthFetchInit = RequestInit & {
  silentError?: boolean
  silentErrorStatuses?: number[]
}

export async function authFetch(
  input: RequestInfo | URL,
  init: AuthFetchInit = {},
): Promise<Response> {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30)
  }

  const { silentError = false, silentErrorStatuses = [], ...requestInit } = init
  const headers = new Headers(init.headers)

  if (keycloak.token) {
    headers.set('Authorization', `Bearer ${keycloak.token}`)
  }

  const response = await fetch(input, {
    ...requestInit,
    headers,
  })

  const shouldSilenceStatus = silentErrorStatuses.includes(response.status)

  if (!response.ok && !silentError && !shouldSilenceStatus && response.status !== 401) {
    try {
      const errorPayload = (await response.clone().json()) as Partial<{
        status: number
        error: string
        message: string
        path: string
      }>

      if (typeof errorPayload.message === 'string' && errorPayload.message.trim()) {
        notifyApiError({
          status: typeof errorPayload.status === 'number' ? errorPayload.status : response.status,
          error:
            typeof errorPayload.error === 'string' && errorPayload.error.trim()
              ? errorPayload.error
              : 'Ошибка',
          message: errorPayload.message,
          path:
            typeof errorPayload.path === 'string' && errorPayload.path.trim()
              ? errorPayload.path
              : typeof input === 'string'
                ? input
                : input.toString(),
        })
      }
    } catch {
      // Ignore non-JSON responses and let local handlers proceed.
    }
  }

  return response
}
