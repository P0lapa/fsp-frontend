export type ApiErrorPayload = {
  status: number
  error: string
  message: string
  path: string
}

type ApiErrorHandler = (payload: ApiErrorPayload) => void

let apiErrorHandler: ApiErrorHandler | null = null

export function registerApiErrorHandler(handler: ApiErrorHandler | null) {
  apiErrorHandler = handler
}

export function notifyApiError(payload: ApiErrorPayload) {
  apiErrorHandler?.(payload)
}
