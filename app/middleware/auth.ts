import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore()

    // Public routes that don't need authentication
    const isPublicRoute = to.path.startsWith('/login') ||
        to.path.startsWith('/register') ||
        to.path === '/'

    // If the user is authenticated but visits login/register, redirect them to home/dashboard
    if (userStore.isAuthenticated && (to.path.startsWith('/login') || to.path.startsWith('/register'))) {
        return navigateTo('/') // Adjust target path like '/dashboard' based on the app
    }

    // If the user is NOT authenticated and visits a protected route, redirect to login
    if (!userStore.isAuthenticated && !isPublicRoute) {
        // Save the intended route to redirect back after login
        const cookie = useCookie('redirect_after_login')
        cookie.value = to.fullPath

        return navigateTo('/login')
    }
})
