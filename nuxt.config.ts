// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['three']
      }
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://127.0.0.1:8000',
      mediaBase: process.env.MEDIA_BASE_URL || process.env.NUXT_PUBLIC_MEDIA_BASE_URL || '',
    }
  }
})