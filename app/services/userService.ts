import { useApiClient } from '~/services/apiClient'

export interface UpdateProfilePayload {
  username: string
  first_name: string
  last_name: string
  phonenumber: string
  bio: string
}

export const useUserService = () => {
  const { request } = useApiClient()

  const updateProfile = async (userId: number, payload: UpdateProfilePayload, token?: string) => {
    return await request<unknown, UpdateProfilePayload>(`/api/v1/user/profile/update/${userId}`, {
      method: 'PUT',
      requiresAuth: true,
      token,
      body: payload,
    })
  }

  const updateProfilePhoto = async (userId: number, payload: FormData, token?: string) => {
    return await request<unknown, FormData>(`/api/v1/user/profile/update/profilephoto/${userId}`, {
      method: 'PUT',
      requiresAuth: true,
      token,
      body: payload,
    })
  }

  return {
    updateProfile,
    updateProfilePhoto,
  }
}
