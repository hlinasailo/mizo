<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
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
        <NuxtLink to="/zirna" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Zirna</NuxtLink>
        <NuxtLink to="/gospel" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Gospel</NuxtLink>
        <NuxtLink to="/hriselna" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Hriselna</NuxtLink>
        <NuxtLink to="/thiamna" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Thiamna</NuxtLink>
        <NuxtLink to="/beauty-fashion" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Beuty & Fashion</NuxtLink>
        <NuxtLink to="/story" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Story</NuxtLink>
        <NuxtLink to="/politics" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Politics</NuxtLink>
        <NuxtLink to="/infiamna" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Infiamna</NuxtLink>
        <hr class="border-white/10 my-1">
        <NuxtLink to="/others" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Others</NuxtLink>
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
      <NuxtLink to="/dashboard" class="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 uppercase tracking-wide">
        Dashboard
      </NuxtLink>
      <button
        class="px-5 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        @click="userStore.logout"
      >
        Logout
      </button>
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
          <NuxtLink to="/zirna" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Zirna</NuxtLink>
          <NuxtLink to="/gospel" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Gospel</NuxtLink>
          <NuxtLink to="/hriselna" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Hriselna</NuxtLink>
          <NuxtLink to="/thiamna" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Thiamna</NuxtLink>
          <NuxtLink to="/beauty-fashion" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Beauty &amp; Fashion</NuxtLink>
          <NuxtLink to="/story" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Story</NuxtLink>
          <NuxtLink to="/politics" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Politics</NuxtLink>
          <NuxtLink to="/infiamna" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Infiamna</NuxtLink>
          <NuxtLink to="/others" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Others</NuxtLink>
        </div>
      </div>
      
      <!-- Mobile Search -->
<div v-if="!isLoginPage" class="pt-2 border-t border-white/10">
  <div class="flex items-center gap-2">
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

      <!-- Mobile Auth -->
      <div class="pt-2 border-t border-white/10">
        <template v-if="userStore.isAuthenticated">
          <NuxtLink to="/dashboard" class="block text-zinc-400 hover:text-white transition-colors uppercase tracking-wide mb-3" @click="toggleMobileMenu">
            Dashboard
          </NuxtLink>
          <button
            class="w-full px-5 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300"
            @click="userStore.logout(); toggleMobileMenu()"
          >
            Logout
          </button>
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