<template>
  <div class="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
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
  @apply bg-black text-white;
  overflow-x: hidden;
}

/* Minimalist B&W scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-black;
}
::-webkit-scrollbar-thumb {
  @apply bg-zinc-800 hover:bg-zinc-600 transition-colors;
}
</style>
