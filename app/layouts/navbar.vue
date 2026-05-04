<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useUserStore } from '~/stores/user'
import { useGroupTypeStore } from '~/stores/groupType'
import { resolveMediaUrl } from '~/utils/mediaUrl'

const userStore = useUserStore()
const groupTypeStore = useGroupTypeStore()
const route = useRoute()
const getProfilePhotoSrc = (url?: string | null) => resolveMediaUrl(url) || ''
const isMobileMenuOpen = ref(false)
const isMobileCategoryOpen = ref(false)
const isNavbarVisible = ref(true)
const lastScrollY = ref(0)

//search
const router = useRouter()
const searchQuery = ref('')
const isSearchOpen = ref(false)
const isMobileSearchOpen = ref(false)
const searchDebounceMs = 300
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const navigateToSearch = async (rawQuery: string) => {
  const query = rawQuery.trim()
  if (!query) return

  const targetPath = `/search/${encodeURIComponent(query)}`
  if (route.path === targetPath) return

  try {
    await router.push(targetPath)
  } catch {
    // Ignore duplicate navigation race conditions.
  }
}

const submitSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) return false

  void navigateToSearch(query)
  if (isMobileSearchOpen.value || isMobileMenuOpen.value) {
    isMobileSearchOpen.value = false
    isMobileCategoryOpen.value = false
    isMobileMenuOpen.value = false
  }
  // Keep search open and preserve typed text after submit.
  return true
}

const closeDesktopSearch = () => {
  isSearchOpen.value = false
  if (!isMobileSearchOpen.value) searchQuery.value = ''
}

const closeMobileSearch = () => {
  isMobileSearchOpen.value = false
  if (!isSearchOpen.value) searchQuery.value = ''
}

const onDesktopSearchButton = () => {
  if (!isSearchOpen.value) {
    isSearchOpen.value = true
    isMobileSearchOpen.value = false
    return
  }

  if (!submitSearch()) {
    closeDesktopSearch()
  }
}

const onMobileSearchButton = () => {
  if (!isMobileSearchOpen.value) {
    isMobileSearchOpen.value = true
    isSearchOpen.value = false
    return
  }

  if (!submitSearch()) {
    closeMobileSearch()
  }
}

const onSearchEscape = () => {
  closeDesktopSearch()
  closeMobileSearch()
}

watch(searchQuery, (value) => {
  if (!isSearchOpen.value && !isMobileSearchOpen.value) return

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }

  const query = value.trim()
  if (!query) return

  searchDebounceTimer = setTimeout(() => {
    void navigateToSearch(query)
  }, searchDebounceMs)
})

const handleScroll = () => {
  const currentScrollY = window.scrollY || 0

  if (currentScrollY <= 0) {
    isNavbarVisible.value = true
    lastScrollY.value = 0
    return
  }

  // Keep navbar visible while mobile menu is expanded.
  if (isMobileMenuOpen.value) {
    isNavbarVisible.value = true
    lastScrollY.value = currentScrollY
    return
  }

  const delta = currentScrollY - lastScrollY.value

  // Ignore tiny scroll changes to reduce flicker.
  if (Math.abs(delta) < 8) return

  if (delta > 0 && currentScrollY > 80) {
    isNavbarVisible.value = false
  } else if (delta < 0) {
    isNavbarVisible.value = true
  }

  lastScrollY.value = currentScrollY
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  if (!isMobileMenuOpen.value) {
    isMobileCategoryOpen.value = false
  }
}

const toggleMobileCategory = () => {
  isMobileCategoryOpen.value = !isMobileCategoryOpen.value
}

const isDarkMode = ref(false)

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

const isUserDropdownOpen = ref(false)

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

const closeUserDropdown = () => {
  isUserDropdownOpen.value = false
}

const handleLogout = async () => {
  closeUserDropdown()
  isMobileMenuOpen.value = false
  await userStore.logout()
}

const onSettingsClick = async () => {
  closeUserDropdown()
  isMobileMenuOpen.value = false
  try {
    await router.push('/settings')
  } catch {
    // Ignore navigation errors
  }
}

const handleClickOutsideDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target?.closest('#user-dropdown-wrapper')) {
    closeUserDropdown()
  }
}

onMounted(() => {
  lastScrollY.value = window.scrollY || 0
  window.addEventListener('scroll', handleScroll, { passive: true })

  const savedTheme = localStorage.getItem('theme')

  if (savedTheme === 'dark' || savedTheme === 'light') {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = false
  }

  applyTheme(isDarkMode.value)

  if (userStore.isAuthenticated && (!userStore.user || !userStore.user.profilePhoto)) {
    void userStore.fetchUser()
  }

  if (!groupTypeStore.groups.length && !groupTypeStore.isLoading) {
    void groupTypeStore.fetchGroupTypes()
  }

  window.addEventListener('click', handleClickOutsideDropdown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('click', handleClickOutsideDropdown)
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
    searchDebounceTimer = null
  }
})

watch(isDarkMode, (dark) => {
  applyTheme(dark)
})

watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    isNavbarVisible.value = true
  }
})
//login page route check
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
<header
  class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-black/60 border-b border-white/10 transition-transform duration-300 ease-in-out"
  :class="isNavbarVisible ? 'translate-y-0' : '-translate-y-full'"
>
  
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
    <NuxtLink to="/ServicesPage" class="hover:text-white transition-colors duration-300 relative group">
      Services
      <span class="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"/>
    </NuxtLink>

    <!-- Dropdown -->
    <div class="relative group">
      <button class="hover:text-white transition-colors duration-300 flex items-center gap-1">
        BLOG
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
     v-model="searchQuery"
     type="search"
     placeholder="Search"
     :class="[
       isSearchOpen ? 'w-36 opacity-100 px-3' : 'w-0 opacity-0 px-0',
        isDarkMode
          ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-white/30'
          : 'bg-white/70 border border-black/15 text-zinc-900 placeholder-zinc-700 focus:border-black/30',
        'text-sm py-1.5 focus:outline-none transition-all duration-300 ease-in-out'
     ]"
     @keyup.enter="submitSearch"
     @keyup.esc="onSearchEscape"
    >
    <button 
      class="px-3 py-1.5 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300 rounded-full"
      :aria-label="isSearchOpen ? (searchQuery.trim() ? 'Search now' : 'Close search') : 'Open search'"
      @click="onDesktopSearchButton"
    >
      <span v-if="isSearchOpen && !searchQuery.trim()">Close</span>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/>
      </svg>
    </button>

    <NuxtLink
      v-if="userStore.isAuthenticated"
      to="/create"
      class="px-3 py-1.5 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300 rounded-full"
    >
      Create
    </NuxtLink>

    <!-- Auth -->
    <template v-if="userStore.isAuthenticated">
      <div id="user-dropdown-wrapper" class="relative">
        <button
          :title="userStore.user?.username || 'Profile'"
          class="w-9 h-9 rounded-full border border-white/30 hover:border-white/70 transition-all duration-200 flex items-center justify-center bg-zinc-800 text-white text-sm font-semibold uppercase overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/30"
          @click.stop="toggleUserDropdown"
        >
          <img
            v-if="userStore.user?.profilePhoto"
            :src="getProfilePhotoSrc(userStore.user.profilePhoto)"
            alt="Profile photo"
            class="w-full h-full object-cover"
          >
          <span v-else-if="userStore.user?.username">{{ userStore.user.username.charAt(0) }}</span>
          <svg v-else class="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v1h20v-1c0-3.324-6.663-5-10-5z"/>
          </svg>
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="isUserDropdownOpen"
            class="absolute top-full right-0 mt-3 w-52 backdrop-blur-md origin-top-right"
            :class="isDarkMode
              ? 'bg-black/95 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
              : 'bg-white border-2 border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)]'"
          >
            <div
              class="px-4 py-3"
              :class="isDarkMode ? 'border-b border-white/10' : 'border-b-2 border-black/10'"
            >
              <p class="text-xs uppercase tracking-wider" :class="isDarkMode ? 'text-zinc-500' : 'text-zinc-400'">Signed in as</p>
              <p class="text-sm font-semibold truncate mt-0.5" :class="isDarkMode ? 'text-white' : 'text-black'">{{ userStore.user?.username || 'User' }}</p>
            </div>

            <div class="py-1">
              <NuxtLink
                to="/user-profile"
                class="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                :class="isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-black hover:bg-black/5'"
                @click="closeUserDropdown"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                My Profile
              </NuxtLink>

              <NuxtLink
                to="/dashboard"
                class="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                :class="isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-black hover:bg-black/5'"
                @click="closeUserDropdown"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h7v5H3zM3 16h7v2H3zM14 3h7v8h-7zM14 15h7v6h-7z"/>
                </svg>
                Dashboard
              </NuxtLink>

              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                :class="isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-black hover:bg-black/5'"
                @click="onSettingsClick"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Settings
              </button>
            </div>

            <div
              class="py-1"
              :class="isDarkMode ? 'border-t border-white/10' : 'border-t-2 border-black/10'"
            >
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:text-red-500 hover:bg-red-500/5"
                :class="isDarkMode ? 'text-zinc-400' : 'text-zinc-600'"
                @click="handleLogout"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </Transition>
      </div>
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
      <NuxtLink to="/ServicesPage" class="text-zinc-400 hover:text-white transition-colors uppercase tracking-wide" @click="toggleMobileMenu">
        Services
      </NuxtLink>

      <div class="border-t border-white/10 pt-3">
        <button
          class="w-full flex items-center justify-between text-zinc-400 hover:text-white transition-colors uppercase tracking-wide"
          type="button"
          @click="toggleMobileCategory"
        >
          <span>BLOG</span>
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
     v-model="searchQuery"
      type="search"
      placeholder="Search"
     :class="[
      isMobileSearchOpen ? 'flex-1 px-3' : 'w-0 px-0 opacity-0',
      isDarkMode
        ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-white/30'
        : 'bg-white/70 border border-black/15 text-zinc-900 placeholder-zinc-700 focus:border-black/30',
      'text-sm py-2 focus:outline-none transition-all duration-300 ease-in-out'
  ]"
     @keyup.enter="submitSearch"
     @keyup.esc="onSearchEscape"
>
    <button 
      class="px-4 py-2 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300 rounded-full flex-shrink-0"
      :aria-label="isMobileSearchOpen ? (searchQuery.trim() ? 'Search now' : 'Close search') : 'Open search'"
      @click="onMobileSearchButton"
    >
      <span v-if="isMobileSearchOpen && !searchQuery.trim()">Close</span>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/>
      </svg>
    </button>
  </div>
</div>

      <div v-if="userStore.isAuthenticated" class="pt-2 border-t border-white/10">
        <NuxtLink
          to="/create"
          class="block w-full text-center px-5 py-2 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300 rounded-full"
          @click="toggleMobileMenu"
        >
          Create
        </NuxtLink>
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
          <div class="flex items-center gap-3 mb-3">
            <span class="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-zinc-800 text-white text-xs font-semibold uppercase flex-shrink-0 overflow-hidden">
              <img
                v-if="userStore.user?.profilePhoto"
                :src="getProfilePhotoSrc(userStore.user.profilePhoto)"
                alt="Profile photo"
                class="w-full h-full object-cover"
              >
              <span v-else-if="userStore.user?.username">{{ userStore.user.username.charAt(0) }}</span>
              <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v1h20v-1c0-3.324-6.663-5-10-5z"/>
              </svg>
            </span>
            <span class="text-sm text-zinc-400 uppercase tracking-wide truncate">{{ userStore.user?.username || 'User' }}</span>
          </div>

          <div class="space-y-1 pl-1">
            <NuxtLink
              to="/user-profile"
              class="flex items-center gap-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              @click="toggleMobileMenu"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              My Profile
            </NuxtLink>

            <NuxtLink
              to="/dashboard"
              class="flex items-center gap-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              @click="toggleMobileMenu"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7h7v5H3zM3 16h7v2H3zM14 3h7v8h-7zM14 15h7v6h-7z"/>
              </svg>
              Dashboard
            </NuxtLink>

            <button
              type="button"
              class="w-full flex items-center gap-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              @click="onSettingsClick"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Settings
            </button>

            <button
              class="w-full flex items-center gap-3 py-2 text-sm text-zinc-400 hover:text-red-400 transition-colors"
              @click="handleLogout"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </button>
          </div>
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