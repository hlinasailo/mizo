import { defineStore } from 'pinia'

interface User {
  id?: number
  username: string
  email?: string
  first_name: string
  last_name: string
}

interface LoginResponse {
  access: string
  refresh: string
  username?: string
  first_name?: string
  last_name?: string
  email?: string
}

type GetMyProfileResponse = [
  {
    id?: number
    username?: string
    first_name?: string
    last_name?: string
  }?,
  ...unknown[]
]

const toLoggableError = (error: unknown) => {
  const e = error as {
    message?: string
    status?: number
    statusCode?: number
    statusMessage?: string
    data?: unknown
    name?: string
  }

  return {
    name: e?.name ?? 'Error',
    message: e?.message ?? String(error),
    status: e?.statusCode ?? e?.status ?? null,
    statusMessage: e?.statusMessage ?? null,
    data: typeof e?.data === 'string' ? e.data : null,
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    accessToken: useCookie('access_token').value || null,
    refreshToken: useCookie('refresh_token').value || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  
  actions: {
    async login(username: string, password: string) {
      const config = useRuntimeConfig()
      const data = await $fetch<LoginResponse>('/api/v1/auth/token/', {
        method: 'POST',
        baseURL: config.public.apiBase,
        body: {
          username,
          password,
        }
      })

      this.setTokens(data.access, data.refresh)
      this.user = {
        username: data.username ?? username,
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        email: data.email,
      }
    },

    setTokens(access: string, refresh?: string) {
      this.accessToken = access
      const accessCookie = useCookie('access_token')
      accessCookie.value = access

      if (refresh) {
        this.refreshToken = refresh
        const refreshCookie = useCookie('refresh_token')
        refreshCookie.value = refresh
      }
    },
    
    clearAuth() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      
      const accessCookie = useCookie('access_token')
      accessCookie.value = null
      
      const refreshCookie = useCookie('refresh_token')
      refreshCookie.value = null
    },

    async fetchUser() {
      if (!this.accessToken) return

      try {
        const config = useRuntimeConfig()
        const data = await $fetch<GetMyProfileResponse>('/api/v1/user/getmyprofile/', {
          method: 'POST',
          baseURL: config.public.apiBase,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })

        const userData = Array.isArray(data) ? data[0] : null

        if (userData && typeof userData === 'object') {
          this.user = {
            id: userData.id,
            username: userData.username ?? '',
            first_name: userData.first_name ?? '',
            last_name: userData.last_name ?? '',
          }
          return
        }

        throw new Error('Unexpected user profile response shape')
      } catch (error: unknown) {
        console.error('Failed to fetch user', toLoggableError(error))
        this.clearAuth()
      }
    },
    
    async logout() {
      if (this.accessToken) {
        try {
          const config = useRuntimeConfig()
          await $fetch('/api/v1/auth/logout/', {
            method: 'POST',
            baseURL: config.public.apiBase,
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          })
        } catch (error: unknown) {
          console.error('Logout failed on server', toLoggableError(error))
        }
      }
      this.clearAuth()
      const router = useRouter()
      router.push('/login')
    }
  }
})
