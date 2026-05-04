import { defineStore } from 'pinia'
import { useAuthService } from '~/services/authService'
import { resolveMediaUrl } from '~/utils/mediaUrl'

interface User {
  id?: number
  username: string
  email?: string
  first_name: string
  last_name: string
  phonenumber?: string | null
  bio?: string
  profilePhoto?: string | null
  coverPhoto?: string | null
}

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

const getUserIdFromJwt = (token?: string | null): number | undefined => {
  if (!token) {
    return undefined
  }

  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) {
      return undefined
    }

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized)) as { user_id?: unknown; id?: unknown }
    const id = Number(decoded.user_id ?? decoded.id)
    return Number.isFinite(id) ? id : undefined
  } catch {
    return undefined
  }
}

const CACHE_KEY = 'mizomade_user_cache'

const getCachedUser = (): User | null => {
  if (import.meta.server) return null
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const setCacheUser = (user: User | null) => {
  if (import.meta.server) return
  try {
    if (user) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CACHE_KEY)
    }
  } catch {
    // Ignore cache errors
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: (useCookie<User | null>('user_info').value || getCachedUser() || null) as User | null,
    accessToken: useCookie('access_token').value || null,
    refreshToken: useCookie('refresh_token').value || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  
  actions: {
    setUser(user: User | null) {
      const normalizedUser = user
        ? {
            ...user,
            profilePhoto: resolveMediaUrl(user.profilePhoto),
            coverPhoto: resolveMediaUrl(user.coverPhoto),
          }
        : null

      this.user = normalizedUser
      const userCookie = useCookie<User | null>('user_info')

      if (!normalizedUser) {
        userCookie.value = null
        setCacheUser(null)
        return
      }
      
      setCacheUser(normalizedUser)

      userCookie.value = {
        id: normalizedUser.id,
        username: normalizedUser.username,
        email: normalizedUser.email,
        first_name: normalizedUser.first_name,
        last_name: normalizedUser.last_name,
        phonenumber: normalizedUser.phonenumber,
        bio: normalizedUser.bio,
        profilePhoto: null,
        coverPhoto: null,
      }
    },

    async login(username: string, password: string) {
      const authService = useAuthService()
      const data = await authService.login(username, password)

      this.setTokens(data.access, data.refresh)

      const tokenUserId = getUserIdFromJwt(data.access)

      this.setUser({
        id: tokenUserId,
        username: data.username ?? username,
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        email: data.email,
        phonenumber: null,
        bio: data.profile?.bio ?? '',
        profilePhoto: data.profile?.profilephoto ?? null,
        coverPhoto: data.profile?.coverphoto ?? null,
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

    ensureUserIdFromToken() {
      if (!this.user || this.user.id || !this.accessToken) {
        return !!this.user?.id
      }

      const tokenUserId = getUserIdFromJwt(this.accessToken)
      if (!tokenUserId) {
        return false
      }

      this.setUser({
        ...this.user,
        id: tokenUserId,
      })

      return true
    },

    updateLocalProfile(partial: Partial<User>) {
      if (!this.user) {
        return
      }

      this.setUser({
        ...this.user,
        ...partial,
      })
    },
    
    clearAuth() {
      this.setUser(null)
      setCacheUser(null)
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
        const authService = useAuthService()
        const data = await authService.fetchMyProfile(this.accessToken)

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
            coverPhoto: typeof profileData === 'object' && profileData ? (profileData.coverphoto ?? null) : null,
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

    async fetchMyPosts() {
      if (!this.accessToken) return []

      try {
        const authService = useAuthService()
        const data = await authService.fetchMyProfile(this.accessToken)

        if (!Array.isArray(data)) {
          return []
        }

        return Array.isArray(data[2]) ? data[2] : []
      } catch (error: unknown) {
        const parsed = toLoggableError(error)
        console.error('Failed to fetch profile posts', parsed)

        if (parsed.status === 401) {
          this.clearAuth()
        }

        return []
      }
    },
    
    async logout() {
      if (this.accessToken) {
        try {
          const authService = useAuthService()
          await authService.logout(this.accessToken)
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
