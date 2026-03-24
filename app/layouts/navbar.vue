<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useUserStore } from '~/stores/user'
import { useGroupTypeStore } from '~/stores/groupType'

const userStore = useUserStore()
const groupTypeStore = useGroupTypeStore()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isMobileCategoryOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  if (!isMobileMenuOpen.value) {
    isMobileCategoryOpen.value = false
  }
}

const toggleMobileCategory = () => {
  isMobileCategoryOpen.value = !isMobileCategoryOpen.value
}

const isSearchOpen = ref(false)
const isMobileSearchOpen = ref(false)

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
}


const toggleMobileSearch = () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
}

const isDarkMode = ref(true)

const applyTheme = (dark: boolean) => {
  if (!import.meta.client) return

  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

const categories = computed(() => groupTypeStore.groups)

const formatCategoryName = (name: string) => {
  if (name.toLowerCase() === 'beauty and fashion') return 'Beauty & Fashion'
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme === 'dark' || savedTheme === 'light') {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  applyTheme(isDarkMode.value)

  if (userStore.isAuthenticated && (!userStore.user || !userStore.user.profilePhoto)) {
    void userStore.fetchUser()
  }

  if (!groupTypeStore.groups.length && !groupTypeStore.isLoading) {
    void groupTypeStore.fetchGroupTypes()
  }
})

watch(isDarkMode, (dark) => {
  applyTheme(dark)
})
//login page route check
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
<header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-black/60 border-b border-white/10">
  
  <!-- Brand -->
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-none bg-white flex items-center justify-center font-black text-black tracking-widest text-sm border border-white">
      M
    </div>
    <span class="text-xl font-bold tracking-tight text-white uppercase">
      Mizomade
    </span>
  </div>

  <!-- Desktop Nav -->
  <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400 uppercase tracking-wide">
    <NuxtLink to="/" class="hover:text-white transition-colors duration-300 relative group">
      Home
      <span class="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"/>
    </NuxtLink>
    <NuxtLink to="/about" class="hover:text-white transition-colors duration-300 relative group">
      About
      <span class="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"/>
    </NuxtLink>

    <!-- Dropdown -->
    <div class="relative group">
      <button class="hover:text-white transition-colors duration-300 flex items-center gap-1">
        CATEGORY
        <svg class="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <!-- Dropdown Menu -->
      <div class="absolute top-full left-0 mt-2 w-48 bg-black/90 border border-white/10 backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <NuxtLink to="/blogs" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">All Posts</NuxtLink>
        <hr class="border-white/10 my-1">
        <template v-if="groupTypeStore.isLoading">
          <span class="block px-4 py-2 text-sm text-zinc-500">Loading categories...</span>
        </template>
        <template v-else-if="groupTypeStore.error && !categories.length">
          <span class="block px-4 py-2 text-sm text-zinc-500">Unable to load categories</span>
        </template>
        <template v-else-if="!categories.length">
          <span class="block px-4 py-2 text-sm text-zinc-500">No categories</span>
        </template>
        <template v-else>
          <NuxtLink
            v-for="group in categories"
            :key="`desktop-cat-${group.id ?? group.name}`"
            :to="{ path: '/blogs', query: { category: group.name } }"
            class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {{ formatCategoryName(group.name) }}
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu Button -->
  <button
    aria-label="Toggle menu"
    class="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
    @click="toggleMobileMenu"
  >
    <span class="w-6 h-0.5 bg-white transition-all" :class="isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''"/>
    <span class="w-6 h-0.5 bg-white transition-all" :class="isMobileMenuOpen ? 'opacity-0' : ''"/>
    <span class="w-6 h-0.5 bg-white transition-all" :class="isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"/>
  </button>

  <!-- Right Side: Search + Auth -->
  <div class="hidden md:flex items-center gap-4">

    <!-- Desktop Theme Toggle -->
    <button
      :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      class="w-9 h-9 flex items-center justify-center border border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-full"
      @click="toggleTheme"
    >
      <svg v-if="isDarkMode" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
      </svg>
      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
      </svg>
      <span class="sr-only">{{ isDarkMode ? 'Switch to light mode' : 'Switch to dark mode' }}</span>
    </button>
  
    
    <!-- Desktop Search -->
    <div v-if="!isLoginPage" class="hidden md:flex items-center gap-4">
    <input
    type="search"
    placeholder="Search"
    :class="isSearchOpen ? 'w-36 opacity-100 px-3' : 'w-0 opacity-0 px-0'"
    class="bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 py-1.5 focus:outline-none focus:border-white/30 transition-all duration-300 ease-in-out"
    >
    <button 
    class="px-3 py-1.5 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300 rounded-full"
    @click="toggleSearch"
    >
    {{ isSearchOpen ? 'Cancel' : 'Search' }}
    </button>
  </div>

    <!-- Auth -->
    <template v-if="userStore.isAuthenticated">
      <NuxtLink
        to="/dashboard"
        :title="userStore.user?.username || 'Profile'"
        class="w-9 h-9 rounded-full border border-white/30 hover:border-white/70 transition-all duration-200 flex items-center justify-center bg-zinc-800 text-white text-sm font-semibold uppercase overflow-hidden flex-shrink-0"
      >
        <img
          v-if="userStore.user?.profilePhoto"
          :src="userStore.user.profilePhoto"
          alt="Profile photo"
          class="w-full h-full object-cover"
        >
        <span v-else-if="userStore.user?.username">{{ userStore.user.username.charAt(0) }}</span>
        <svg v-else class="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v1h20v-1c0-3.324-6.663-5-10-5z"/>
        </svg>
      </NuxtLink>
    </template>
    <template v-else-if="!isLoginPage">
      <NuxtLink
        to="/login"
        class="px-5 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      >
        Login
      </NuxtLink>
    </template>
  </div>

  <!-- Mobile Menu Panel -->
  <div
    class="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 transition-all duration-300 overflow-hidden"
    :class="isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'"
  >
    <nav class="flex flex-col px-6 py-4 space-y-4">
      <NuxtLink to="/" class="text-zinc-400 hover:text-white transition-colors uppercase tracking-wide" @click="toggleMobileMenu">
        Home
      </NuxtLink>
      <NuxtLink to="/about" class="text-zinc-400 hover:text-white transition-colors uppercase tracking-wide" @click="toggleMobileMenu">
        About
      </NuxtLink>
      <NuxtLink to="/blogs" class="text-zinc-400 hover:text-white transition-colors uppercase tracking-wide" @click="toggleMobileMenu">
        Blog
      </NuxtLink>

      <div class="border-t border-white/10 pt-3">
        <button
          class="w-full flex items-center justify-between text-zinc-400 hover:text-white transition-colors uppercase tracking-wide"
          type="button"
          @click="toggleMobileCategory"
        >
          <span>CATEGORY</span>
          <svg class="w-4 h-4 transition-transform" :class="isMobileCategoryOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>

        <div class="pl-3 pt-3 space-y-2 overflow-hidden transition-all duration-300" :class="isMobileCategoryOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'">
          <NuxtLink to="/blogs" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">All Posts</NuxtLink>
          <template v-if="groupTypeStore.isLoading">
            <span class="block text-sm text-zinc-500">Loading categories...</span>
          </template>
          <template v-else-if="groupTypeStore.error && !categories.length">
            <span class="block text-sm text-zinc-500">Unable to load categories</span>
          </template>
          <template v-else-if="!categories.length">
            <span class="block text-sm text-zinc-500">No categories</span>
          </template>
          <NuxtLink
            v-for="group in categories"
            v-else
            :key="`mobile-cat-${group.id ?? group.name}`"
            :to="{ path: '/blogs', query: { category: group.name } }"
            class="block text-sm text-zinc-400 hover:text-white transition-colors"
            @click="toggleMobileMenu"
          >
            {{ formatCategoryName(group.name) }}
          </NuxtLink>
        </div>
      </div>
      
      <!-- Mobile Search -->
<div v-if="!isLoginPage" class="pt-2 border-t border-white/10">
  <div class="flex items-center ">
    <input
      type="search"
      placeholder="Search"
      :class="isMobileSearchOpen ? 'flex-1 px-3' : 'w-0 px-0 opacity-0'"
      class="bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 py-2 focus:outline-none focus:border-white/30 transition-all duration-300 ease-in-out"
    >
    <button 
      class="px-4 py-2 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300 rounded-full flex-shrink-0"
      @click="toggleMobileSearch"
    >
      {{ isMobileSearchOpen ? 'Cancel' : 'Search' }}
    </button>
  </div>
</div>

      <!-- Mobile Theme Toggle -->
      <div class="pt-2 border-t border-white/10 flex justify-left">
        <button
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          class="w-10 h-10 flex items-center justify-center border border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-full"
          @click="toggleTheme"
        >
          <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
          </svg>
          <span class="sr-only">{{ isDarkMode ? 'Switch to light mode' : 'Switch to dark mode' }}</span>
        </button>
      </div>

      <!-- Mobile Auth -->
      <div class="pt-2 border-t border-white/10">
        <template v-if="userStore.isAuthenticated">
          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
            @click="toggleMobileMenu"
          >
            <span class="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-zinc-800 text-white text-xs font-semibold uppercase flex-shrink-0">
              <img
                v-if="userStore.user?.profilePhoto"
                :src="userStore.user.profilePhoto"
                alt="Profile photo"
                class="w-full h-full object-cover"
              >
              <span v-else-if="userStore.user?.username">{{ userStore.user.username.charAt(0) }}</span>
              <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v1h20v-1c0-3.324-6.663-5-10-5z"/>
              </svg>
            </span>
            <span class="uppercase tracking-wide text-sm">{{ userStore.user?.username || 'Profile' }}</span>
          </NuxtLink>
        </template>
        <template v-else-if="!isLoginPage">
          <NuxtLink
            to="/login"
            class="block w-full text-center px-5 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300"
            @click="toggleMobileMenu"
          >
            Login
          </NuxtLink>
        </template>
      </div>
    </nav>
  </div>

</header>
</template>