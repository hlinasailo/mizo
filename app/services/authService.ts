import { useApiClient } from '~/services/apiClient'
import { createApiError } from '~/types/api'

export interface RegisterPayload {
  username: string
  password1: string
  phone: string
  email: string
}

export interface VerifyOtpPayload {
  phone: string
  otp_value: string
  purpose: string
}

export interface ResendOtpPayload {
  phone: string
  purpose: string
}

export interface UsernameValidationResponse extends Array<number | string> {
  0: number
  1: string
}

export interface LoginResponse {
  access: string
  refresh: string
  username?: string
  first_name?: string
  last_name?: string
  email?: string
  profile?: {
    bio?: string | null
    profilephoto?: string | null
    coverphoto?: string | null
  } | null
}

export type GetMyProfileResponse = [
  {
    id?: number
    username?: string
    first_name?: string
    last_name?: string
  }?,
  {
    bio?: string | null
    profilephoto?: string | null
    coverphoto?: string | null
  }?,
  unknown?,
  {
    phonenumber?: string | null
    validated?: boolean
  }?,
  ...unknown[]
]

export type GetUserProfileByUsernameResponse = [
  {
    id?: number
    username?: string
    first_name?: string
    last_name?: string
  }?,
  {
    bio?: string | null
    profilephoto?: string | null
    coverphoto?: string | null
  }?,
  Array<{
    id?: number
    title?: string
    author?: string
    slug?: string
    coverimage?: string | null
    date?: string
    authorphoto?: string | null
    published?: boolean
  }>?,
  ...unknown[]
]

export interface ProfilePhotoResponse {
  profilephoto?: string | null
}

export const useAuthService = () => {
  const { request } = useApiClient()

  const register = async (payload: RegisterPayload) => {
    try {
      return await request<unknown, RegisterPayload>('/api/v1/user/register/', {
        method: 'POST',
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to register')
    }
  }

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    try {
      return await request<{ message?: string }, VerifyOtpPayload>('/api/v1/user/verify_otp/', {
        method: 'POST',
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to verify OTP')
    }
  }

  const resendOtp = async (payload: ResendOtpPayload) => {
    try {
      return await request<{ message?: string }, ResendOtpPayload>('/api/v1/user/resendotp/', {
        method: 'POST',
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to resend OTP')
    }
  }

  const login = async (username: string, password: string) => {
    try {
      return await request<LoginResponse, { username: string; password: string }>('/api/v1/auth/token/', {
        method: 'POST',
        body: {
          username,
          password,
        },
      })
    } catch (error) {
      throw createApiError(error, 'Failed to log in')
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    try {
      return await request<UsernameValidationResponse>(`/api/v1/user/profile/usernamevalidation/${encodeURIComponent(username)}`, {
        method: 'GET',
      })
    } catch (error) {
      throw createApiError(error, 'Failed to validate username')
    }
  }

  const fetchMyProfile = async (token: string) => {
    try {
      return await request<GetMyProfileResponse>('/api/v1/user/getmyprofile/', {
        method: 'POST',
        requiresAuth: true,
        token,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to fetch my profile')
    }
  }

  const fetchUserProfileByUsername = async (username: string, token?: string) => {
    try {
      return await request<GetUserProfileByUsernameResponse>(`/api/v1/user/profile/${encodeURIComponent(username)}`, {
        method: 'GET',
        requiresAuth: !!token,
        token,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to fetch user profile')
    }
  }

  const fetchProfilePhotoByUsername = async (username: string, token?: string) => {
    try {
      return await request<ProfilePhotoResponse>(`/api/v1/user/profile/getprofilephoto/${encodeURIComponent(username)}`, {
        method: 'GET',
        requiresAuth: !!token,
        token,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to fetch profile photo')
    }
  }

  const logout = async (token: string) => {
    try {
      return await request<unknown>('/api/v1/auth/logout/', {
        method: 'POST',
        requiresAuth: true,
        token,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to log out')
    }
  }

  return {
    register,
    verifyOtp,
    resendOtp,
    login,
    checkUsernameAvailability,
    fetchMyProfile,
    fetchUserProfileByUsername,
    fetchProfilePhotoByUsername,
    logout,
  }
}
