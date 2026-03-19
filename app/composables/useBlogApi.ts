import { useUserStore } from '~/stores/user'
import { toApiErrorMessage } from '~/services/apiClient'
import { useBlogService } from '~/services/blogService'

interface Category {
  id: number
  name: string
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
  const userStore = useUserStore()
  const blogService = useBlogService()

  const getToken = () => {
    if (!userStore.accessToken) {
      throw new Error('No authentication token available')
    }

    return userStore.accessToken
  }

  /**
   * Fetch all categories
   */
  const fetchCategories = async (): Promise<Category[]> => {
    try {
      return await blogService.fetchCategories()
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Failed to fetch categories'))
    }
  }

  /**
   * Convert category name to ID
   */
  const getCategoryId = async (categoryName: string): Promise<number> => {
    const categories = await fetchCategories()

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
      return await blogService.createDraft(payload.content, getToken())
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Failed to create draft'))
    }
  }

  /**
   * Update and publish a draft post
   */
  const publishPost = async (payload: PublishPostPayload): Promise<PublishResponse> => {
    try {
      const categoryId = await getCategoryId(payload.category)

      return await blogService.publishPost({
        id: payload.id,
        title: payload.title,
        category: categoryId,
        tags: payload.tags,
        content: payload.content,
        coverimage: payload.coverimage,
      }, getToken())
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Failed to publish post'))
    }
  }

  /**
   * Update an existing draft
   */
  const updateDraft = async (draftId: number, content: string): Promise<DraftResponse> => {
    try {
      return await blogService.updateDraft(draftId, content, getToken())
    } catch (error) {
      throw new Error(toApiErrorMessage(error, 'Failed to update draft'))
    }
  }

  return {
    createDraft,
    publishPost,
    updateDraft,
  }
}