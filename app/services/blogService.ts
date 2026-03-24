import { useApiClient, toApiErrorMessage  } from '~/services/apiClient'

import { useUserStore } from '~/stores/user'

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

export type BookmarkedPostsResponse = BlogPostListItem[]

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
      throw new Error('No authentication token available')
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
        throw new Error(`Category "${categoryName}" not found. Available: ${availableNames}`)
      }

      return category.id
    } catch (error) {
      throw new Error(toApiErrorMessage(error, `Failed to convert category name "${categoryName}" to ID`))
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
      throw new Error(toApiErrorMessage(error, 'Failed to create draft'))
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
      throw new Error(toApiErrorMessage(error, 'Failed to update draft'))
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
      throw new Error(toApiErrorMessage(error, 'Failed to publish post'))
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
      throw new Error(toApiErrorMessage(error, 'Failed to publish post'))
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

  const fetchBookmarkedPosts = async (token?: string) => {
    return await request<BookmarkedPostsResponse>('/api/v1/posts/api/bookmarkedlist/', {
      method: 'GET',
      requiresAuth: true,
      token,
    })
  }

  return {
    fetchCategories,
    getCategoryId,
    createDraft,
    updateDraft,
    publishPost,
    publishPostWithCategoryName,
    fetchPosts,
    fetchBookmarkedPosts,
  }
}
