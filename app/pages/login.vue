<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const router = useRouter()

const form = reactive({
    username: '',
    password: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
    errorMessage.value = ''

    if (!form.username || !form.password) {
        errorMessage.value = 'Please enter both username and password.'
        return
    }

    isSubmitting.value = true

    try {
        await userStore.login(form.username, form.password)
        await userStore.fetchUser()

        const redirectCookie = useCookie<string | null>('redirect_after_login')
        const redirectPath = redirectCookie.value || '/'
        redirectCookie.value = null

        await router.push(redirectPath)
    } catch (error: unknown) {
        const statusMessage = (error as { statusMessage?: string })?.statusMessage
        const data = (error as { data?: { detail?: string } })?.data
        errorMessage.value = data?.detail || statusMessage || 'Invalid credentials. Please try again.'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <main class="pt-24 min-h-screen bg-black text-white px-6 lg:px-12">
        <section class="max-w-2xl mx-auto py-16">
            <div class="w-full">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">Welcome Back</h1>
                <p class="text-zinc-400 font-light text-lg mb-8 leading-relaxed">
                    Log in with your credentials to continue to Mizomade.
                </p>

                <div v-if="userStore.isAuthenticated" class="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                    <p class="text-zinc-200">You are already authenticated.</p>
                    <NuxtLink to="/" class="inline-block px-6 py-3 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300">
                        Go to Home
                    </NuxtLink>
                </div>

                <form v-else class="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-5" @submit.prevent="handleLogin">
                    <div>
                        <label for="username" class="block text-sm text-zinc-300 mb-2 uppercase tracking-wide">Username</label>
                        <input
                            id="username"
                            v-model="form.username"
                            type="text"
                            autocomplete="username"
                            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                            placeholder="Enter your username"
                        >
                    </div>

                    <div>
                        <label for="password" class="block text-sm text-zinc-300 mb-2 uppercase tracking-wide">Password</label>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            autocomplete="current-password"
                            class="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                            placeholder="Enter your password"
                        >
                    </div>

                    <p v-if="errorMessage" class="text-red-400 text-sm">{{ errorMessage }}</p>

                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full px-6 py-3 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {{ isSubmitting ? 'Logging in...' : 'Login' }}
                    </button>
                </form>
            </div>
        </section>
    </main>
</template>