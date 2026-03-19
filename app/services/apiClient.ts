import { useUserStore } from '~/stores/user'

export interface ApiClientRequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: TBody
  query?: Record<string, string | number | boolean | null | undefined>
  params?: Record<string, string | number | boolean | null | undefined>
  credentials?: RequestCredentials
  mode?: RequestMode
  cache?: RequestCache
  requiresAuth?: boolean
  token?: string | null
  headers?: Record<string, string>
}

export const toApiErrorMessage = (error: unknown, fallback = 'Request failed'): string => {
  const err = error as {
    message?: string
    statusMessage?: string
    data?: {
      detail?: string
      error?: string
      message?: string
    } | string
  }

  if (typeof err?.data === 'string' && err.data.trim()) {
    return err.data
  }

  const payload = typeof err?.data === 'object' && err?.data
    ? err.data as { detail?: string; error?: string; message?: string }
    : null

  return (
    payload?.detail ||
    payload?.error ||
    payload?.message ||
    err?.statusMessage ||
    err?.message ||
    fallback
  )
}

export const useApiClient = () => {
  const config = useRuntimeConfig()
  const userStore = useUserStore()

  const request = async <TResponse, TBody = unknown>(
    path: string,
    options: ApiClientRequestOptions<TBody> = {},
  ): Promise<TResponse> => {
    const {
      requiresAuth = false,
      token,
      headers,
      ...fetchOptions
    } = options

    const resolvedToken = token ?? userStore.accessToken

    const mergedHeaders: Record<string, string> = {
      ...(headers || {}),
    }

    if (requiresAuth) {
      if (!resolvedToken) {
        throw new Error('No authentication token available')
      }
      mergedHeaders.Authorization = `Bearer ${resolvedToken}`
    }

    return await $fetch<TResponse>(path, {
      baseURL: config.public.apiBase,
      ...(fetchOptions as Record<string, unknown>),
      headers: mergedHeaders,
    })
  }

  return {
    request,
  }
}
