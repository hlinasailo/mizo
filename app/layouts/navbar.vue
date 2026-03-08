<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
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
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Zirna</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Gospel</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Hriselna</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Thiamna</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Beuty & Fashion</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Story</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Politics</a>
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Infiamna</a>
        <hr class="border-white/10 my-1">
        <a href="#" class="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Others</a>
      </div>
    </div>

    <!-- Disabled -->
    <span class="text-zinc-600 uppercase tracking-wide cursor-not-allowed select-none">
      Disabled
    </span>
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
    
    <!-- Search -->
    <div class="flex items-center gap-2">
      <input
        type="search"
        placeholder="Search"
        class="bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 px-3 py-1.5 focus:outline-none focus:border-white/30 transition-colors w-36"
      >
      <button class="px-3 py-1.5 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300">
        Search
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
    <template v-else>
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
      <NuxtLink to="/explore" class="text-zinc-400 hover:text-white transition-colors uppercase tracking-wide" @click="toggleMobileMenu">
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
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Zirna</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Gospel</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Hriselna</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Thiamna</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Beuty &amp; Fashion</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Story</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Politics</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Infiamna</a>
          <a href="#" class="block text-sm text-zinc-400 hover:text-white transition-colors" @click="toggleMobileMenu">Others</a>
        </div>
      </div>
      
      <!-- Mobile Search -->
      <div class="pt-2 border-t border-white/10">
        <div class="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search"
            class="flex-1 bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-500 px-3 py-2 focus:outline-none focus:border-white/30 transition-colors"
          >
          <button class="px-4 py-2 text-sm font-bold border border-white text-white hover:bg-white hover:text-black uppercase tracking-wide transition-all duration-300">
            Search
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
        <template v-else>
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