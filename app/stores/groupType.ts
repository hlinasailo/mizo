import { defineStore } from 'pinia'
import { useBlogService } from '~/services/blogService'

interface GroupType {
    id?: number
    name: string
    slug?: string
    description?: string
}

const toLoggableError = (error: unknown) => {
    const e = error as {
        name?: string
        message?: string
        status?: number
        statusCode?: number
        statusMessage?: string
    }

    return {
        name: e?.name ?? 'Error',
        message: e?.message ?? String(error),
        status: e?.statusCode ?? e?.status ?? null,
        statusMessage: e?.statusMessage ?? null,
    }
}

export const useGroupTypeStore = defineStore('groupType', {
    state: () => ({
        groups: [] as GroupType[],
        isLoading: false,
        error: null as string | null
    }),

    getters: {
        getGroupById: (state) => {
            return (id: number) => state.groups.find(group => group.id === id)
        }
    },

    actions: {
        async fetchGroupTypes() {
            this.isLoading = true
            this.error = null

            try {
                const blogService = useBlogService()
                const data = await blogService.fetchCategories()
                this.groups = data || []
            } catch (err: unknown) {
                console.error('Failed to fetch group types', toLoggableError(err))
                this.error = err instanceof Error ? err.message : String(err)
            } finally {
                this.isLoading = false
            }
        }
    }
})
