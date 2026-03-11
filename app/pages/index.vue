
<template>
  <main class="relative min-h-screen bg-black overflow-hidden font-sans text-white">
    <!-- Subtle Monochromatic Glow Backgrounds -->
    <div class="pointer-events-none absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/[0.03] blur-[150px] mix-blend-screen animate-pulse" style="animation-duration: 8s;"/>
    <div class="pointer-events-none absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-zinc-400/[0.02] blur-[150px] mix-blend-screen animate-pulse" style="animation-duration: 10s;"/>

    <!-- Navigation -->
    

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
      <!-- Text Content -->
      <div class="flex-1 text-center lg:text-left z-10">
        <div class="inline-block px-4 py-1.5 mb-6 border border-zinc-700 bg-zinc-900/50 backdrop-blur-md text-xs font-bold text-zinc-300 uppercase tracking-widest">
          The New Standard
        </div>
        <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-black tracking-tighter leading-[1] mb-8 text-white text-balance uppercase mix-blend-difference">
          Discover. <br>
          Share. <br>
          <span class="text-zinc-500">Connect.</span>
        </h1>
        <p class="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-balance font-light">
          Experience Mizomade. Premium content, deep analytics, and an integrated community interface powered by stark contrast and beautiful simplicity.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 uppercase tracking-widest text-sm font-bold">
          <NuxtLink to="/register" class="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-zinc-200 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)] text-center border border-white">
            Start Exploring
          </NuxtLink>
          <NuxtLink to="/about" class="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white hover:text-black text-white border border-zinc-600 transition-all duration-300 hover:scale-[1.02] text-center">
            Learn More
          </NuxtLink>
        </div>
      </div>

      <!-- Conceptual B&W 3D Model Image -->
      <div class="flex-1 w-full relative z-10 flex justify-center perspective-1000">
        <div class="relative w-full max-w-md aspect-[4/5] overflow-hidden border border-zinc-800 bg-zinc-900/20 backdrop-blur-xl shadow-2xl flex items-center justify-center transform hover:rotate-y-[5deg] hover:rotate-x-[5deg] transition-transform duration-700 pointer-events-none group">
           <img src="/hero-shape-bw.png" alt="Black and White Abstract 3D Shape" class="w-full h-full object-cover mix-blend-lighten opacity-90 transition-transform duration-1000 group-hover:scale-105" >
           <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 mix-blend-overlay"/>
        </div>
      </div>
    </section>

    <!-- Stark Grid Features Section -->
    <section class="py-24 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
      <div class="mb-20 md:text-center">
        <h2 class="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">Platform <span class="text-zinc-600">Features</span></h2>
        <p class="text-zinc-400 max-w-xl md:mx-auto text-lg font-light">Engineered for speed. Designed for clarity.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
        <!-- Large Card -->
        <div class="md:col-span-2 md:row-span-1 p-10 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-colors group relative overflow-hidden flex flex-col justify-end">
          <div class="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
          <Icon name="lucide:zap" class="w-10 h-10 text-white mb-6" />
          <h3 class="text-2xl font-bold text-white mb-3 uppercase tracking-wide">High Velocity Architecture</h3>
          <p class="text-zinc-400 font-light max-w-md">Built on a cutting edge Nuxt stack. Zero latency state management for a seamless experience everywhere you go.</p>
        </div>

        <!-- Small Card 1 -->
        <div class="p-10 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-colors relative flex flex-col justify-end group">
           <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon name="lucide:shield-check" class="w-32 h-32 text-white" />
           </div>
          <Icon name="lucide:lock" class="w-8 h-8 text-zinc-300 mb-6 z-10" />
          <h3 class="text-xl font-bold text-white mb-3 z-10 uppercase tracking-wide">Enterprise Security</h3>
          <p class="text-zinc-400 font-light text-sm z-10 leading-relaxed">JWT driven authentication enforcing uncompromised security.</p>
        </div>

        <!-- Small Card 2 -->
        <div class="p-10 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-colors relative flex flex-col justify-end group">
          <Icon name="lucide:layout-template" class="w-8 h-8 text-zinc-300 mb-6" />
          <h3 class="text-xl font-bold text-white mb-3 uppercase tracking-wide">Structured Taxonomy</h3>
          <p class="text-zinc-400 font-light text-sm leading-relaxed">Dynamic category structuring fetched beautifully through Pinia stores.</p>
        </div>

        <!-- Wide Card -->
        <div class="md:col-span-2 p-10 bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-colors flex items-center justify-between group overflow-hidden relative">
          <div class="absolute right-[-10%] top-[-50%] w-[60%] h-[200%] bg-white/[0.02] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"/>
          <div class="z-10 relative">
             <Icon name="lucide:message-square-text" class="w-10 h-10 text-white mb-6" />
            <h3 class="text-2xl font-bold text-white mb-3 uppercase tracking-wide">Deep Interaction</h3>
            <p class="text-zinc-400 font-light max-w-md leading-relaxed">Like, bookmark, and enter real-time discussions across independent post threads instantly.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-zinc-900 bg-black pt-20 pb-10 relative z-10">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div class="col-span-1 md:col-span-2">
           <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 border border-white bg-white flex items-center justify-center font-black text-black tracking-widest text-sm">M</div>
              <span class="text-xl font-bold text-white tracking-tight uppercase">Mizomade</span>
            </div>
            <p class="text-zinc-500 font-light text-sm max-w-sm leading-relaxed">The premier black-tie experience for discovering content. Built with uncompromising standards.</p>
        </div>
        <div>
          <h4 class="text-white font-bold mb-6 uppercase tracking-widest text-sm">Directory</h4>
          <ul class="space-y-3 text-sm text-zinc-500 font-light tracking-wide">
            <li><NuxtLink to="/explore" class="hover:text-white transition-colors">Explore</NuxtLink></li>
            <li><NuxtLink to="/categories" class="hover:text-white transition-colors">Categories</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-white transition-colors">Contact</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold mb-6 uppercase tracking-widest text-sm">Legal</h4>
          <ul class="space-y-3 text-sm text-zinc-500 font-light tracking-wide">
            <li><NuxtLink to="/privacy" class="hover:text-white transition-colors">Privacy Policy</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-white transition-colors">Terms of Use</NuxtLink></li>
          </ul>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-sm font-light uppercase tracking-wider">
        <p>&copy; {{ new Date().getFullYear() }} Mizomade. All Rights Reserved.</p>
        <div class="flex items-center gap-6 mt-6 md:mt-0">
          <NuxtLink to="#" class="hover:text-white transition-colors"><Icon name="uil:twitter" class="w-5 h-5" /></NuxtLink>
          <NuxtLink to="#" class="hover:text-white transition-colors"><Icon name="uil:github" class="w-5 h-5" /></NuxtLink>
          <NuxtLink to="#" class="hover:text-white transition-colors"><Icon name="uil:discord" class="w-5 h-5" /></NuxtLink>
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
/* Any custom scoped styles for animations if needed */
</style>
