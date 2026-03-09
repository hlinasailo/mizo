<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const router = useRouter()

const form = reactive({
    username: '',
    password: '',
    rememberMe: false,
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
    <main class="pt-24 min-h-screen bg-zinc-700 text-white px-6 lg:px-12">
        <section class="max-w-4xl mx-auto py-16 flex items-center justify-center min-h-[600px]">
            <div v-if="userStore.isAuthenticated" class="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                <p class="text-zinc-200">You are already authenticated.</p>
                <NuxtLink to="/" class="inline-block px-6 py-3 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300">
                    Go to Home
                </NuxtLink>
            </div>

            <form v-else class="flex flex-col md:flex-row w-full max-w-3xl shadow-2xl overflow-hidden" @submit.prevent="handleLogin">
                <!-- Left side - White with 20% transparency -->
                <div class="flex-1 bg-white/45 backdrop-blur-md p-6 md:p-12 space-y-6">
                    <div>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/80">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </span>
                            <input
                                id="username"
                                v-model="form.username"
                                type="text"
                                autocomplete="username"
                                class="w-full pl-12 pr-4 py-4 bg-gray-300/50 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="Username"
                            >
                        </div>
                    </div>

                    <div>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/80">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                v-model="form.password"
                                type="password"
                                autocomplete="current-password"
                                class="w-full pl-12 pr-4 py-4 bg-gray-300/50 text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="Password"
                            >
                        </div>
                    </div>

                    <div class="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 text-sm">
                        <button type="button" class="text-gray-900 hover:text-gray-800 transition-colors">
                            Forgot Password?
                        </button>
                        <label class="flex items-center gap-2 text-gray-900 cursor-pointer">
                            <input
                                v-model="form.rememberMe"
                                type="checkbox"
                                class="w-4 h-4 accent-gray-600"
                            >
                            <span>Remember me</span>
                        </label>
                    </div>

                    <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

                    <div class="text-center text-sm pt-2">
                        <span class="text-gray-900">Don't have an account? </span>
                        <NuxtLink to="/signup" class="text-black hover:underline font-medium">
                            Sign up
                        </NuxtLink>
                    </div>
                </div>

                <!-- Right side - Dark button -->
                <div class="w-full md:w-48 bg-zinc-900 flex items-center justify-center">
                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="text-white text-xl font-light tracking-widest uppercase hover:bg-zinc-800 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed w-full h-full py-6 md:py-0"
                    >
                        {{ isSubmitting ? 'Loading...' : 'Login' }}
                    </button>
                </div>
            </form>
        </section>
    </main>
</template>