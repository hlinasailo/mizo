import { useApiClient } from '~/services/apiClient'

import { useUserStore } from '~/stores/user'
import { createApiError } from '~/types/api'

export interface Category {
  id: number
  name: string
  color?: string
}

interface CategoryResponse {
  results?: Category[]
  data?: Category[]
}

export interface PublishPostPayload {
  id: number
  title: string
  category: number
  tags: string[]
  coverimage?: File
  content: string
}

export interface PublishPostPayloadWithCategoryName {
  id: number
  title: string
  category: string // Category name (will be converted to ID)
  tags: string[]
  coverimage?: File
  content: string
}

export interface DraftResponse {
  id: number
}

export interface PublishResponse {
  save: number
  slug: string
  errors?: Record<string, unknown>
}

export interface BlogPostListItem {
  id: number
  title: string
  slug: string
  author: string
  author_name?: string
  authorphoto: string
  coverimage: string | null
  date: string
  published: boolean
}

export interface PaginatedPostsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BlogPostListItem[]
}

export interface BlogPostDetail {
  id: number
  title: string
  author: string
  authorphoto: string | null
  slug: string
  category: string
  content: string
  seo_content?: string
  tags: string[]
  date: string
  coverimage: string | null
}

export interface PostDetailResponse {
  post: BlogPostDetail
  related?: BlogPostListItem[]
  bk?: number
}

export type BookmarkedPostsResponse = BlogPostListItem[]

export interface LikesInfoResponse {
  mylike: number
  likecount: number
}

export interface LikeToggleResponse {
  status: number
  msg: string
}

export interface BookmarkStatusResponse {
  bookmarked: number
}

export interface BookmarkToggleResponse {
  bookmarked: number
  msg: string
}

export interface UpdatePostPayload {
  title?: string
  category?: string | number
  content?: string
  tags?: string[]
  coverimage?: File | null
  published?: boolean
}

let categoriesCache: Category[] | null = null

const normalizeCategories = (response: CategoryResponse | Category[]) => {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response.results)) {
    return response.results
  }

  if (Array.isArray(response.data)) {
    return response.data
  }

  return []
}

export const useBlogService = () => {
  const { request } = useApiClient()
  const userStore = useUserStore()

  const getToken = () => {
    if (!userStore.accessToken) {
      throw createApiError(undefined, 'No authentication token available')
    }
    return userStore.accessToken
  }

  const fetchCategories = async (forceRefresh = false): Promise<Category[]> => {
    if (!forceRefresh && categoriesCache) {
      return categoriesCache
    }

    const response = await request<CategoryResponse | Category[]>('/api/v1/posts/api/categories/', {
      method: 'GET',
    })

    categoriesCache = normalizeCategories(response)
    return categoriesCache
  }

  /**
   * Convert category name to category ID
   */
  const getCategoryId = async (categoryName: string): Promise<number> => {
    try {
      const categories = await fetchCategories()
      const normalizedCategoryName = categoryName.trim().toLowerCase()
      const category = categories.find(cat => cat.name?.trim().toLowerCase() === normalizedCategoryName)

      if (!category) {
        const availableNames = categories.map(c => c.name).join(', ')
        throw createApiError(undefined, `Category "${categoryName}" not found. Available: ${availableNames}`)
      }

      return category.id
    } catch (error) {
      throw createApiError(error, `Failed to convert category name "${categoryName}" to ID`)
    }
  }

  const createDraft = async (content: string, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      return await request<DraftResponse, { content: string }>('/api/v1/posts/createdraft/', {
        method: 'POST',
        requiresAuth: true,
        token: resolvedToken,
        body: { content },
      })
    } catch (error) {
      throw createApiError(error, 'Failed to create draft')
    }
  }

  const updateDraft = async (id: number, content: string, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      return await request<DraftResponse, { id: number; content: string }>('/api/v1/posts/createdraft/', {
        method: 'PATCH',
        requiresAuth: true,
        token: resolvedToken,
        body: { id, content },
      })
    } catch (error) {
      throw createApiError(error, 'Failed to update draft')
    }
  }

  const publishPost = async (payload: PublishPostPayload, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      const formData = new FormData()
      formData.append('id', String(payload.id))
      formData.append('title', payload.title)
      formData.append('category', String(payload.category))
      formData.append('tags', JSON.stringify(payload.tags))
      formData.append('content', payload.content)
      formData.append('published', 'true')

      if (payload.coverimage) {
        formData.append('coverimage', payload.coverimage)
      }

      return await request<PublishResponse, FormData>('/api/v1/posts/create/', {
        method: 'PATCH',
        requiresAuth: true,
        token: resolvedToken,
        body: formData,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to publish post')
    }
  }

  /**
   * Publish post with category as name (converts to ID internally)
   */
  const publishPostWithCategoryName = async (payload: PublishPostPayloadWithCategoryName, token?: string): Promise<PublishResponse> => {
    try {
      const categoryId = await getCategoryId(payload.category)
      return await publishPost({
        id: payload.id,
        title: payload.title,
        category: categoryId,
        tags: payload.tags,
        content: payload.content,
        coverimage: payload.coverimage,
      }, token)
    } catch (error) {
      throw createApiError(error, 'Failed to publish post')
    }
  }

  const fetchPosts = async (page: number, category?: string) => {
    const endpoint = category && category !== 'All'
      ? `/api/v1/posts/api/categoryposts/${encodeURIComponent(category.toLowerCase())}`
      : '/api/v1/posts/'

    return await request<PaginatedPostsResponse>(endpoint, {
      method: 'GET',
      query: {
        page,
      },
    })
  }

  const fetchPostDetail = async (slug: string) => {
    const normalizedSlug = String(slug ?? '').trim().toLowerCase()
    const isInvalidLegacySlug = /^(none)+$/.test(normalizedSlug)

    if (!normalizedSlug || isInvalidLegacySlug || normalizedSlug === 'null' || normalizedSlug === 'undefined' || normalizedSlug === 'nan') {
      throw createApiError(undefined, 'Invalid post link. Please open the post from your profile again.')
    }

    return await request<PostDetailResponse>(`/api/v1/posts/detail/${encodeURIComponent(slug)}`, {
      method: 'GET',
    })
  }

  const fetchDraftDetail = async (id: number, token?: string) => {
    const resolvedToken = token ?? getToken()
    return await request<PostDetailResponse>(`/api/v1/posts/drafts/${id}`, {
      method: 'GET',
      requiresAuth: true,
      token: resolvedToken,
    })
  }

  const fetchBookmarkedPosts = async (token?: string) => {
    return await request<BookmarkedPostsResponse>('/api/v1/posts/api/bookmarkedlist/', {
      method: 'GET',
      requiresAuth: true,
      token,
    })
  }

  const updatePost = async (slug: string, payload: UpdatePostPayload, token?: string) => {
    try {
      const resolvedToken = token ?? getToken()
      const formData = new FormData()

      if (payload.title !== undefined) formData.append('title', payload.title)
      if (payload.category !== undefined) formData.append('category', String(payload.category))
      if (payload.content !== undefined) formData.append('content', payload.content)
      if (payload.tags !== undefined) formData.append('tags', JSON.stringify(payload.tags))
      if (payload.coverimage) formData.append('coverimage', payload.coverimage)
      if (payload.published !== undefined) formData.append('published', String(payload.published))

      return await request<{ message?: string }, FormData>(
        `/api/v1/posts/detail/${encodeURIComponent(slug)}`,
        {
          method: 'PUT',
          requiresAuth: true,
          token: resolvedToken,
          body: formData,
        }
      )
    } catch (error) {
      throw createApiError(error, 'Failed to update post')
    }
  }
const deletePost = async (postId: number, token?: string) => {
  try {
    const resolvedToken = token ?? getToken()
    return await request<{ status?: number }>(  
      `/api/v1/posts/delete/${postId}`,  
      {
        method: 'DELETE',
        requiresAuth: true,
        token: resolvedToken,
      }
    )
  } catch (error) {
    throw createApiError(error, 'Failed to delete post')
  }
}

 const fetchLikes = async (postId: number): Promise<{ mylike: number; likecount: number }> => {
  try {
    const isLoggedIn = !!userStore.accessToken

    const response = await request<{ mylike: number; likecount: number }>(
      `/api/v1/posts/likeinfo/${postId}`,
      {
        method: 'GET',
        requiresAuth: isLoggedIn,
        token: isLoggedIn ? userStore.accessToken! : undefined,
      }
    )
    return response
  } catch (error) {
    throw createApiError(error, `Failed to fetch likes for post ${postId}`)
  }
}

  const toggleLike = async (postId: number, token?: string): Promise<{ isLiked: boolean; likecount: number }> => {
    try {
      const resolvedToken = token ?? getToken()
      const _response = await request<LikeToggleResponse>(
        `/api/v1/posts/like/${postId}`,
        {
          method: 'GET',
          requiresAuth: true,
          token: resolvedToken,
        }
      )
      // After toggling, fetch updated like info
      const likeInfo = await request<LikesInfoResponse>(
        `/api/v1/posts/likeinfo/${postId}`,
        {
          method: 'GET',
          requiresAuth: true,
          token: resolvedToken,
        }
      )
      return {
        isLiked: likeInfo.mylike === 1,
        likecount: likeInfo.likecount,
      }
    } catch (error) {
      throw createApiError(error, `Failed to toggle like for post ${postId}`)
    }
  }

  const toggleBookmark = async (postId: number, token?: string): Promise<{ isBookmarked: boolean }> => {
    try {
      const resolvedToken = token ?? getToken()
      const response = await request<BookmarkToggleResponse>(
        `/api/v1/posts/bookmark/${postId}`,
        {
          method: 'GET',
          requiresAuth: true,
          token: resolvedToken,
        }
      )
      return {
        isBookmarked: response.bookmarked === 1,
      }
    } catch (error) {
      throw createApiError(error, `Failed to toggle bookmark for post ${postId}`)
    }
  }

  const fetchBookmarkStatus = async (postId: number, token?: string): Promise<{ isBookmarked: boolean }> => {
    try {
      const resolvedToken = token ?? getToken()
      const response = await request<BookmarkStatusResponse>(
        `/api/v1/posts/bookmarkinfo/${postId}`,
        {
          method: 'GET',
          requiresAuth: true,
          token: resolvedToken,
        }
      )
      return {
        isBookmarked: response.bookmarked === 1,
      }
    } catch (error) {
      throw createApiError(error, `Failed to fetch bookmark status for post ${postId}`)
    }
  }

  const uploadImage = async (imageBlob: Blob, token?: string): Promise<{ url: string }> => {
    try {
      const resolvedToken = token ?? getToken()
      const formData = new FormData()
      formData.append('image', imageBlob, 'image.jpg')

      return await request<{ url: string }, FormData>('/api/v1/posts/imageupload/', {
        method: 'POST',
        requiresAuth: true,
        token: resolvedToken,
        body: formData,
      })
    } catch (error) {
      throw createApiError(error, 'Failed to upload image')
    }
  }

  return {
    fetchCategories,
    getCategoryId,
    createDraft,
    updateDraft,
    publishPost,
    publishPostWithCategoryName,
    fetchPosts,
    fetchPostDetail,
    fetchDraftDetail,
    fetchBookmarkedPosts,
    updatePost,
    deletePost,
    fetchLikes,
    toggleLike,
    toggleBookmark,
    fetchBookmarkStatus,
    uploadImage,
  }
}
