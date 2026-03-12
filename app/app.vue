<template>
  <div class="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans transition-colors duration-300">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
body {
  @apply bg-white text-zinc-900 dark:bg-black dark:text-white;
  overflow-x: hidden;
  transition: background-color 300ms ease, color 300ms ease;
}

/* Minimalist B&W scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-zinc-100 dark:bg-black;
}
::-webkit-scrollbar-thumb {
  @apply bg-zinc-800 hover:bg-zinc-600 transition-colors;
}
</style>
