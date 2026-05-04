export interface ApiError extends Error {
  status?: number | null
  statusCode?: number | null
  data?: unknown
  cause?: unknown
}

export const createApiError = (error: unknown, fallback = 'Request failed'): ApiError => {
  const err = error as {
    message?: string
    status?: number
    statusCode?: number
    statusMessage?: string
    data?: unknown
    cause?: unknown
  }

  const payload = typeof err?.data === 'object' && err?.data
    ? err.data as { detail?: string; error?: string; message?: string }
    : null

  const message =
    payload?.detail ||
    payload?.error ||
    payload?.message ||
    err?.statusMessage ||
    err?.message ||
    fallback

  const apiError = new Error(message) as ApiError
  apiError.name = 'ApiError'
  apiError.status = err?.status ?? err?.statusCode ?? null
  apiError.statusCode = err?.statusCode ?? err?.status ?? null
  apiError.data = err?.data ?? null
  apiError.cause = err?.cause ?? error

  return apiError
}

export const isApiError = (error: unknown): error is ApiError => {
  const err = error as Partial<ApiError> | null
  return !!err && err.name === 'ApiError'
}