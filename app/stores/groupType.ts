import { defineStore } from 'pinia'

interface GroupType {
    id?: number
    name: string
    slug?: string
    description?: string
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
                const config = useRuntimeConfig()
                // Replace with the actual group types / categories endpoint if needed
                const data = await $fetch<GroupType[]>('/api/v1/posts/api/categories/', {
                    baseURL: config.public.apiBase,
                })
                this.groups = data || []
            } catch (err) {
                console.error('Failed to fetch group types', err)
                this.error = err instanceof Error ? err.message : String(err)
            } finally {
                this.isLoading = false
            }
        }
    }
})
