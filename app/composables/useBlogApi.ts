import { useUserStore } from '~/stores/user'

interface FetchError {
  data?: {
    detail?: string
  }
  message?: string
}

interface Category {
  id: number
  name: string
}

interface CategoryResponse {
  results?: Category[]
  data?: Category[]
  [key: string]: unknown
}

interface CreateDraftPayload {
  content: string
}

interface PublishPostPayload {
  id: number
  title: string
  category: string // Category name (will be converted to ID)
  tags: string[] // Will be converted to JSON string
  coverimage?: File
  content: string
}



interface DraftResponse {
  id: number
}

interface PublishResponse {
  save: number
  slug: string
  errors?: Record<string, unknown>
}

export const useBlogApi = () => {
  const config = useRuntimeConfig()
  const userStore = useUserStore()
  let categoriesCache: Category[] | null = null

  const getAuthHeaders = () => {
    const token = userStore.accessToken
    if (!token) {
      throw new Error('No authentication token available')
    }
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  /**
   * Fetch all categories
   */
  const fetchCategories = async (): Promise<Category[]> => {
    if (categoriesCache) {
      return categoriesCache
    }

    try {
      const response = await $fetch<CategoryResponse | Category[]>('/api/v1/posts/api/categories/', {
        method: 'GET',
        baseURL: config.public.apiBase,
      })
      console.log('Raw categories response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response as Record<string, unknown>))
      
      // Handle different response structures
      let categories: Category[] = []
      if (Array.isArray(response)) {
        categories = response
      } else if (response?.results && Array.isArray(response.results)) {
        categories = response.results
      } else if (response?.data && Array.isArray(response.data)) {
        categories = response.data
      }
      
      console.log('Parsed categories:', categories)
      categoriesCache = categories
      return categories
    } catch (error) {
      const err = error as FetchError
      console.error('Failed to fetch categories:', err)
      throw new Error(err?.data?.detail || 'Failed to fetch categories')
    }
  }

  /**
   * Convert category name to ID
   */
  const getCategoryId = async (categoryName: string): Promise<number> => {
    const categories = await fetchCategories()
    console.log(`Looking for category: "${categoryName}"`)
    console.log('Available categories:', categories.map(c => c.name))
    
    const category = categories.find(cat => cat.name === categoryName)
    if (!category) {
      const availableNames = categories.map(c => c.name).join(', ')
      throw new Error(`Category "${categoryName}" not found. Available: ${availableNames}`)
    }
    return category.id
  }

  /**
   * Create a new blog post draft
   */
  const createDraft = async (payload: CreateDraftPayload): Promise<DraftResponse> => {
    try {
      const response = await $fetch<DraftResponse>('/api/v1/posts/createdraft/', {
        method: 'POST',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
        body: {
          content: payload.content,
        },
      })
      return response
    } catch (error) {
      const err = error as FetchError
      console.error('Failed to create draft:', err)
      throw new Error(err?.data?.detail || 'Failed to create draft')
    }
  }

  /**
   * Update and publish a draft post
   */
  const publishPost = async (payload: PublishPostPayload): Promise<PublishResponse> => {
    try {
      // Convert category name to ID
      const categoryId = await getCategoryId(payload.category)

      const formData = new FormData()
      formData.append('id', String(payload.id))
      formData.append('title', payload.title)
      formData.append('category', String(categoryId)) // Send ID, not name
      formData.append('tags', JSON.stringify(payload.tags))
      formData.append('content', payload.content)
      formData.append('published', 'true')

      if (payload.coverimage) {
        formData.append('coverimage', payload.coverimage)
      }

      const response = await $fetch<PublishResponse>('/api/v1/posts/create/', {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
        body: formData,
      })
      return response
    } catch (error) {
      const err = error as FetchError
      console.error('Failed to publish post:', err)
      throw new Error(err?.data?.detail || 'Failed to publish post')
    }
  }

  /**
   * Update an existing draft
   */
  const updateDraft = async (draftId: number, content: string): Promise<DraftResponse> => {
    try {
      const response = await $fetch<DraftResponse>('/api/v1/posts/createdraft/', {
        method: 'PATCH',
        baseURL: config.public.apiBase,
        headers: getAuthHeaders(),
        body: {
          id: draftId,
          content: content,
        },
      })
      return response
    } catch (error) {
      const err = error as FetchError
      console.error('Failed to update draft:', err)
      throw new Error(err?.data?.detail || 'Failed to update draft')
    }
  }


  return {
    createDraft,
    publishPost,
    updateDraft,
  }
}