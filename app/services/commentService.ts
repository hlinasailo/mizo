import { useApiClient } from '~/services/apiClient'
import { useUserStore } from '~/stores/user'
import { createApiError } from '~/types/api'

export interface Comment {
  id: number
  author: string
  authorphoto?: string | null
  content: string
  date: string
  post?: number
}

export interface CommentsResponse {
  results: Comment[]
  count?: number
  next?: string | null
  previous?: string | null
}

type RawComment = {
  id?: number
  pk?: number
  author?: string
  author_name?: string
  username?: string
  user_name?: string
  created_by_username?: string
  created_by?: number | string | { id?: number; username?: string } | null
  user?: {
    id?: number
    username?: string
    profilephoto?: string | null
  } | number | string | null
  authorphoto?: string | null
  profilephoto?: string | null
  content?: string
  comment?: string
  text?: string
  date?: string
  created_at?: string
  post?: number
}

type CommentListRawResponse =
  | CommentsResponse
  | RawComment[]
  | { data?: RawComment[]; comments?: RawComment[] }

const pickFirstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return null
}

const toComment = (raw: RawComment, index: number, fallbackAuthor?: string | null): Comment => {
  const userObject = typeof raw.user === 'object' && raw.user ? raw.user : null
  const createdByObject = typeof raw.created_by === 'object' && raw.created_by ? raw.created_by : null

  const author = pickFirstNonEmpty(
    raw.author,
    raw.author_name,
    raw.username,
    raw.user_name,
    raw.created_by_username,
    typeof raw.user === 'string' ? raw.user : undefined,
    typeof raw.created_by === 'string' ? raw.created_by : undefined,
    userObject?.username,
    createdByObject?.username,
    fallbackAuthor,
  ) ?? 'Unknown'

  const authorphoto = raw.authorphoto ?? raw.profilephoto ?? userObject?.profilephoto ?? null
  const content = raw.content ?? raw.comment ?? raw.text ?? ''
  const date = raw.date ?? raw.created_at ?? new Date().toISOString()
  const id = raw.id ?? raw.pk ?? -(index + 1)

  return {
    id,
    author,
    authorphoto,
    content,
    date,
    post: raw.post,
  }
}

const normalizeComments = (response: CommentListRawResponse, fallbackAuthor?: string | null): Comment[] => {
  if (Array.isArray(response)) {
    return response.map((item, index) => toComment(item, index, fallbackAuthor))
  }

  const payload = response as {
    results?: RawComment[]
    data?: RawComment[]
    comments?: RawComment[]
  }

  if (Array.isArray(payload.results)) {
    return payload.results.map((item, index) => toComment(item, index, fallbackAuthor))
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map((item, index) => toComment(item, index, fallbackAuthor))
  }

  if (Array.isArray(payload.comments)) {
    return payload.comments.map((item, index) => toComment(item, index, fallbackAuthor))
  }

  return []
}

export const useCommentService = () => {
  const { request } = useApiClient()
  const userStore = useUserStore()

  const getToken = () => {
    if (!userStore.accessToken) {
      throw createApiError(undefined, 'No authentication token available')
    }
    return userStore.accessToken
  }

  const fetchComments = async (postId: number) => {
    try {
      const response = await request<CommentListRawResponse>(`/api/v1/posts/commentlist/${postId}`, {
        method: 'GET',
      })
      return { results: normalizeComments(response, userStore.user?.username) }
    } catch (error) {
      throw createApiError(error, 'Failed to fetch comments')
    }
  }

  const createComment = async (postId: number, content: string, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      return await request<Comment, { content: string; comment: string; text: string }>(
        `/api/v1/posts/commentlist/${postId}`,
        {
          method: 'POST',
          requiresAuth: true,
          token: resolvedToken,
          body: {
            content,
            comment: content,
            text: content,
          },
        }
      )
    } catch (error) {
      throw createApiError(error, 'Failed to create comment')
    }
  }

  const updateComment = async (commentId: number, content: string, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      return await request<Comment, { content: string; comment: string; text: string }>(
        `/api/v1/posts/commentdetail/${commentId}`,
        {
          method: 'PUT',
          requiresAuth: true,
          token: resolvedToken,
          body: {
            content,
            comment: content,
            text: content,
          },
        }
      )
    } catch (error) {
      throw createApiError(error, 'Failed to update comment')
    }
  }

  const deleteComment = async (commentId: number, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      return await request<void>(
        `/api/v1/posts/commentdetail/${commentId}`,
        {
          method: 'DELETE',
          requiresAuth: true,
          token: resolvedToken,
        }
      )
    } catch (error) {
      throw createApiError(error, 'Failed to delete comment')
    }
  }

  return {
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  }
}