import { useUserStore } from '~/stores/user'
import { createApiError } from '~/types/api'

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

interface TokenRefreshResponse {
  access?: string
  refresh?: string
}

let refreshTokenPromise: Promise<string | null> | null = null
let redirectToLoginPromise: Promise<unknown> | null = null

const isUnauthorizedError = (error: unknown) => {
  const err = error as {
    status?: number
    statusCode?: number
  }

  return err?.status === 401 || err?.statusCode === 401
}

const clearAuthAndRedirectToLogin = async () => {
  const userStore = useUserStore()
  userStore.clearAuth()

  if (!import.meta.client) {
    return null
  }

  if (!redirectToLoginPromise) {
    redirectToLoginPromise = Promise.resolve(navigateTo('/login')).finally(() => {
      redirectToLoginPromise = null
    })
  }

  return await redirectToLoginPromise
}

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshTokenPromise) {
    return await refreshTokenPromise
  }

  refreshTokenPromise = (async () => {
    const config = useRuntimeConfig()
    const userStore = useUserStore()
    const refreshToken = userStore.refreshToken

    if (!refreshToken) {
      return null
    }

    try {
      const response = await $fetch<TokenRefreshResponse>('/api/v1/auth/token/refresh/', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: {
          refresh: refreshToken,
        },
      })

      if (!response?.access) {
        return null
      }

      userStore.setTokens(response.access, response.refresh)
      return response.access
    } catch {
      return null
    } finally {
      refreshTokenPromise = null
    }
  })()

  return await refreshTokenPromise
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

    const buildFetchOptions = (accessToken?: string | null) => {
      const mergedHeaders: Record<string, string> = {
        ...(headers || {}),
      }

      if (requiresAuth) {
        const tokenToUse = accessToken ?? resolvedToken

        if (!tokenToUse) {
          throw createApiError(undefined, 'No authentication token available')
        }

        mergedHeaders.Authorization = `Bearer ${tokenToUse}`
      }

      return {
        baseURL: config.public.apiBase,
        ...(fetchOptions as Record<string, unknown>),
        headers: mergedHeaders,
      }
    }

    const execute = async (accessTokenOverride?: string | null, allowRefresh = true): Promise<TResponse> => {
      try {
        return await $fetch<TResponse>(path, buildFetchOptions(accessTokenOverride))
      } catch (error) {
        const shouldTryRefresh = allowRefresh && requiresAuth && isUnauthorizedError(error)

        if (!shouldTryRefresh) {
          throw error
        }

        const refreshedAccessToken = await refreshAccessToken()

        if (!refreshedAccessToken) {
          await clearAuthAndRedirectToLogin()
          throw error
        }

        try {
          return await $fetch<TResponse>(path, buildFetchOptions(refreshedAccessToken))
        } catch (retryError) {
          if (isUnauthorizedError(retryError)) {
            await clearAuthAndRedirectToLogin()
          }

          throw retryError
        }
      }
    }

    return await execute(token, true)
  }

  return {
    request,
  }
}
