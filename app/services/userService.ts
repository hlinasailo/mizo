import { useApiClient } from '~/services/apiClient'
import { createApiError } from '~/types/api'

export interface UpdateProfilePayload {
  username: string
  first_name: string
  last_name: string
  bio: string
}

export interface ChangePasswordPayload {
  phone: string
  password: string
  otp_value: string
  purpose: string
}

export interface OtpPayload {
  phone: string
  purpose: string
}

export interface ChangePhonePayload {
  old_phone: string
  new_phone: string
  otp_value: string
  purpose: string
}

export const useUserService = () => {
  const { request } = useApiClient()

  const updateProfile = async (userId: number, payload: UpdateProfilePayload, token?: string) => {
    try {
      return await request<unknown, UpdateProfilePayload>(`/api/v1/user/profile/update/${userId}`, {
        method: 'PUT',
        requiresAuth: true,
        token,
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to update profile')
    }
  }

  const updateProfilePhoto = async (userId: number, payload: FormData, token?: string) => {
    try {
      return await request<unknown, FormData>(`/api/v1/user/profile/update/profilephoto/${userId}`, {
        method: 'PUT',
        requiresAuth: true,
        token,
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to update profile photo')
    }
  }

  const updateCoverPhoto = async (userId: number, payload: FormData, token?: string) => {
    try {
      return await request<unknown, FormData>(`/api/v1/user/profile/update/coverphoto/${userId}`, {
        method: 'PUT',
        requiresAuth: true,
        token,
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to update cover photo')
    }
  }

  const changePassword = async (payload: ChangePasswordPayload, token?: string) => {
    try {
      return await request<{ message?: string }, ChangePasswordPayload>('/api/v1/user/change_password/', {
        method: 'POST',
        requiresAuth: true,
        token,
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to change password')
    }
  }

  const changePhone = async (payload: ChangePhonePayload, token?: string) => {
    try {
      return await request<{ message?: string }, ChangePhonePayload>('/api/v1/user/change_phone/', {
        method: 'POST',
        requiresAuth: true,
        token,
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to change phone number')
    }
  }

  const initOtp = async (payload: OtpPayload, token?: string) => {
    try {
      return await request<{ status?: number }, OtpPayload>('/api/v1/user/init_otp/', {
        method: 'POST',
        requiresAuth: true,
        token,
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to send OTP')
    }
  }

  const resendOtp = async (payload: OtpPayload) => {
    try {
      return await request<{ message?: string }, OtpPayload>('/api/v1/user/resendotp/', {
        method: 'POST',
        body: payload,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to resend OTP')
    }
  }

  return {
    updateProfile,
    updateProfilePhoto,
    updateCoverPhoto,
    changePassword,
    changePhone,
    initOtp,
    resendOtp,
  }
}
