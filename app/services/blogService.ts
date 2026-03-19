import { useApiClient } from '~/services/apiClient'

export interface Category {
  id: number
  name: string
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

  const createDraft = async (content: string, token?: string) => {
    return await request<DraftResponse, { content: string }>('/api/v1/posts/createdraft/', {
      method: 'POST',
      requiresAuth: true,
      token,
      body: { content },
    })
  }

  const updateDraft = async (id: number, content: string, token?: string) => {
    return await request<DraftResponse, { id: number; content: string }>('/api/v1/posts/createdraft/', {
      method: 'PATCH',
      requiresAuth: true,
      token,
      body: { id, content },
    })
  }

  const publishPost = async (payload: PublishPostPayload, token?: string) => {
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
      token,
      body: formData,
    })
  }

  const fetchPosts = async (page: number, category?: string) => {
    const endpoint = category && category !== 'All'
      ? `/api/v1/posts/api/categoryposts/${encodeURIComponent(category)}`
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
    createDraft,
    updateDraft,
    publishPost,
    fetchPosts,
    fetchBookmarkedPosts,
  }
}
