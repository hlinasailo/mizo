import { useApiClient } from '~/services/apiClient'

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
  }?,
  unknown?,
  {
    phonenumber?: string | null
    validated?: boolean
  }?,
  ...unknown[]
]

export const useAuthService = () => {
  const { request } = useApiClient()

  const register = async (payload: RegisterPayload) => {
    return await request<unknown, RegisterPayload>('/api/v1/user/register/', {
      method: 'POST',
      body: payload,
    })
  }

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    return await request<{ message?: string }, VerifyOtpPayload>('/api/v1/user/verify_otp/', {
      method: 'POST',
      body: payload,
    })
  }

  const resendOtp = async (payload: ResendOtpPayload) => {
    return await request<{ message?: string }, ResendOtpPayload>('/api/v1/user/resendotp/', {
      method: 'POST',
      body: payload,
    })
  }

  const login = async (username: string, password: string) => {
    return await request<LoginResponse, { username: string; password: string }>('/api/v1/auth/token/', {
      method: 'POST',
      body: {
        username,
        password,
      },
    })
  }

  const fetchMyProfile = async (token: string) => {
    return await request<GetMyProfileResponse>('/api/v1/user/getmyprofile/', {
      method: 'POST',
      requiresAuth: true,
      token,
    })
  }

  const logout = async (token: string) => {
    return await request<unknown>('/api/v1/auth/logout/', {
      method: 'POST',
      requiresAuth: true,
      token,
    })
  }

  return {
    register,
    verifyOtp,
    resendOtp,
    login,
    fetchMyProfile,
    logout,
  }
}
