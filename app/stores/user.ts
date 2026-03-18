import { defineStore } from 'pinia'

interface User {
  id?: number
  username: string
  email?: string
  first_name: string
  last_name: string
  phonenumber?: string | null
  bio?: string
  profilePhoto?: string | null
}

interface LoginResponse {
  access: string
  refresh: string
  username?: string
  first_name?: string
  last_name?: string
  email?: string
  profile?: {
    bio?: string | null
    profilephoto?: string | null
  } | null
}

type GetMyProfileResponse = [
  {
    id?: number
    username?: string
    first_name?: string
    last_name?: string
  }?,
  {
    bio?: string | null
    profilephoto?: string | null
  }?,
  unknown?,
  {
    phonenumber?: string | null
    validated?: boolean
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

const normalizeMediaUrl = (url: string | null | undefined, apiBase: string) => {
  if (!url) {
    return null
  }

  if (/^(data:|blob:|https?:\/\/)/i.test(url)) {
    return url
  }

  const trimmedBase = apiBase.replace(/\/$/, '')
  const trimmedUrl = url.startsWith('/') ? url : `/${url}`
  return `${trimmedBase}${trimmedUrl}`
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: (useCookie<User | null>('user_info').value || null) as User | null,
    accessToken: useCookie('access_token').value || null,
    refreshToken: useCookie('refresh_token').value || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  
  actions: {
    setUser(user: User | null) {
      const config = useRuntimeConfig()
      const normalizedUser = user
        ? {
            ...user,
            profilePhoto: normalizeMediaUrl(user.profilePhoto, config.public.apiBase),
          }
        : null

      this.user = normalizedUser
      const userCookie = useCookie<User | null>('user_info')

      if (!normalizedUser) {
        userCookie.value = null
        return
      }

      userCookie.value = {
        id: normalizedUser.id,
        username: normalizedUser.username,
        email: normalizedUser.email,
        first_name: normalizedUser.first_name,
        last_name: normalizedUser.last_name,
        phonenumber: normalizedUser.phonenumber,
        bio: normalizedUser.bio,
        profilePhoto: null,
      }
    },

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
      this.setUser({
        username: data.username ?? username,
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        email: data.email,
        phonenumber: null,
        bio: data.profile?.bio ?? '',
        profilePhoto: data.profile?.profilephoto ?? null,
      })
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
      this.setUser(null)
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
        const profileData = Array.isArray(data) ? data[1] : null
        const phoneData = Array.isArray(data) ? data[3] : null

        if (userData && typeof userData === 'object') {
          this.setUser({
            id: userData.id,
            username: userData.username ?? '',
            first_name: userData.first_name ?? '',
            last_name: userData.last_name ?? '',
            phonenumber: typeof phoneData === 'object' && phoneData ? (phoneData.phonenumber ?? null) : null,
            bio: typeof profileData === 'object' && profileData ? (profileData.bio ?? '') : '',
            profilePhoto: typeof profileData === 'object' && profileData ? (profileData.profilephoto ?? null) : null,
          })
          return
        }

        throw new Error('Unexpected user profile response shape')
      } catch (error: unknown) {
        const parsed = toLoggableError(error)
        console.error('Failed to fetch user', parsed)

        // Do not force logout for transient/profile endpoint issues.
        // Only clear auth when the token is truly unauthorized.
        if (parsed.status === 401) {
          this.clearAuth()
          return
        }

        if (!this.user?.username) {
          this.setUser(null)
        }
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
