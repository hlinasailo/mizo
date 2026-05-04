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
html,
body {
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 #f4f4f5;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
html::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {
  background: #f4f4f5;
}
html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 9999px;
  border: 2px solid #f4f4f5;
}

html::-webkit-scrollbar-thumb:hover,
body::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}

html.dark,
html.dark body {
  scrollbar-color: #52525b #000000;
}

html.dark::-webkit-scrollbar-track,
html.dark body::-webkit-scrollbar-track {
  background: #000000;
}

html.dark::-webkit-scrollbar-thumb,
html.dark body::-webkit-scrollbar-thumb {
  background: #52525b;
  border-color: #000000;
}

html.dark::-webkit-scrollbar-thumb:hover,
html.dark body::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}

/* Hide viewport scrollbar but keep scrolling */
html,
body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
