import { useApiClient } from '~/services/apiClient'
import { useUserStore } from '~/stores/user'
import { createApiError } from '~/types/api'

export interface SearchResults {
  users: unknown[]
  posts: unknown[]
}

const normalizeSearchResponse = (data: unknown): SearchResults => {
  let posts: unknown[] = []
  let users: unknown[] = []

  const payload = data as {
    results?: unknown
    posts?: unknown
    users?: unknown
  }

  // Shape A: { results: [ [posts], [users] ] }
  if (Array.isArray(payload?.results)) {
    const nestedResults = payload.results as unknown[]

    if (Array.isArray(nestedResults[0]) || Array.isArray(nestedResults[1])) {
      posts = Array.isArray(nestedResults[0]) ? nestedResults[0] : []
      users = Array.isArray(nestedResults[1]) ? nestedResults[1] : []
      return { posts, users }
    }

    // Shape B: { count, results: [posts...] }
    posts = nestedResults
    return { posts, users }
  }

  // Shape C: { posts: [...], users: [...] }
  if (Array.isArray(payload?.posts) || Array.isArray(payload?.users)) {
    posts = Array.isArray(payload.posts) ? payload.posts : []
    users = Array.isArray(payload.users) ? payload.users : []
    return { posts, users }
  }

  // Shape D: raw array => posts
  if (Array.isArray(data)) {
    posts = data
    return { posts, users }
  }

  return { posts: [], users: [] }
}

export const useSearchService = () => {
  const { request } = useApiClient()
  const userStore = useUserStore()

  const search = async (query: string): Promise<SearchResults> => {
    const normalizedQuery = String(query ?? '').trim()

    if (!normalizedQuery) {
      return { users: [], posts: [] }
    }

    const token = userStore.accessToken

    try {
      const response = await request<unknown>(
        `/api/v1/posts/api/searching/${encodeURIComponent(normalizedQuery)}`,
        {
          method: 'GET',
          requiresAuth: !!token,
          token: token ?? undefined,
        },
      )

      return normalizeSearchResponse(response)
    } catch (error) {
      throw createApiError(error, 'Failed to fetch search results')
    }
  }

  return {
    search,
  }
}