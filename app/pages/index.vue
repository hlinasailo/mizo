<template>
  <main style="background: var(--bg); color: var(--fg);" class="font-sans">

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 1 · BACKD (Hero with 3D Model)                 -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div class="relative min-h-screen overflow-hidden">

      <!-- Grid Background -->
      <div class="grid-bg"></div>

      <!-- Glow -->
      <div class="pointer-events-none absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[150px] mix-blend-screen animate-pulse" style="background: var(--glow-1); animation-duration: 8s;"/>
      <div class="pointer-events-none absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[150px] mix-blend-screen animate-pulse" style="background: var(--glow-2); animation-duration: 10s;"/>

      <!-- 3D Model -->
      <div ref="modelContainer" class="absolute inset-0 w-full h-full z-0">
        <canvas ref="canvas" class="w-full h-full" />
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 rounded-full animate-spin" style="border: 1px solid var(--border); border-top-color: var(--fg-muted);"/>
            <span class="text-sm tracking-widest uppercase font-semibold" style="color: var(--fg-soft);">Loading</span>
          </div>
        </div>
      </div>

      <!-- Hero Content -->
      <section class="relative z-10 min-h-screen flex items-center px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div class="w-full">
          <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight uppercase mb-4" style="color: var(--fg);">
            MIZO<span style="color: var(--fg-muted);">made</span>
          </h1>
          <p class="text-base sm:text-lg md:text-xl lg:text-2xl mt-6 sm:mt-8 max-w-2xl font-medium leading-relaxed" style="color: var(--fg);">
            MIZOMADE is a technology-driven company building
            <br class="hidden sm:block">digital platforms, software solutions, and structured
            <br class="hidden sm:block">data systems to support modern infrastructure, research,
            <br class="hidden sm:block">and AI innovation.
          </p>
          <br>
          <div class="discover-btn-wrap">
            <NuxtLink to="/ServicesPage" class="discover-btn">
              <span>Explore</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 2 · PUBLISH (Social Publishing Hero)           -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div class="relative min-h-screen overflow-hidden" style="background: var(--bg);">
      <div class="pointer-events-none absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[150px] mix-blend-screen animate-pulse" style="background: var(--glow-1); animation-duration: 8s;"></div>
      <div class="pointer-events-none absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[150px] mix-blend-screen animate-pulse" style="background: var(--glow-2); animation-duration: 10s;"></div>

      <section class="relative pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row-reverse items-center gap-6 sm:gap-8 lg:gap-20">

        <!-- Text -->
        <div class="flex-1 text-center lg:text-left z-10 lg:pl-10">
          <p class="text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4" style="color: var(--fg-soft);">Our Platform</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 sm:mb-6 uppercase" style="color: var(--fg);">
            A social publishing home for low-resource languages
          </h2>
          <p class="text-sm sm:text-base md:text-lg lg:text-2xl mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium" style="color: var(--fg-muted);">
            Mizomade pairs thoughtful publishing tools with community care so every voice can publish, collaborate, and grow.
          </p>

          <!-- Stats -->
          <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
            <div>
              <p class="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight" style="color: var(--fg);">1,200+</p>
              <p class="text-xs sm:text-sm uppercase tracking-widest mt-1 sm:mt-2 font-semibold" style="color: var(--fg-soft);">Registered creators</p>
            </div>
            <div class="hidden sm:block w-px h-12" style="background: var(--border);"></div>
            <div>
              <p class="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight" style="color: var(--fg);">4,800+</p>
              <p class="text-xs sm:text-sm uppercase tracking-widest mt-1 sm:mt-2 font-semibold" style="color: var(--fg-soft);">Stories published</p>
            </div>
            <div class="hidden sm:block w-px h-12" style="background: var(--border);"></div>
            <div>
              <p class="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight" style="color: var(--fg);">12</p>
              <p class="text-xs sm:text-sm uppercase tracking-widest mt-1 sm:mt-2 font-semibold" style="color: var(--fg-soft);">Districts sharing</p>
            </div>
          </div>
          <br>
          <div class="discover-btn-wrap">
            <NuxtLink to="/blogs" class="discover-btn">
              <span>Start Creating</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Animated Cards -->
        <div class="flex-1 w-full flex justify-center" ref="heroRef">
          <div class="pub-cards">
            <div class="pub-card" v-for="(card, i) in pubCards" :key="i">
              <div class="pub-icon" v-html="card.icon"></div>
              {{ card.label }}
            </div>
          </div>
        </div>
      </section>
    </div>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 3 · PUBLISH2 (Features Grid)                   -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <section class="relative py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden" style="background: var(--bg);">
      <div class="pointer-events-none absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full blur-[120px]" style="background: var(--glow-1);"></div>
      <div class="max-w-7xl mx-auto">
        <p class="text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4" style="color: var(--fg-soft);">Why Mizomade</p>
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-10 sm:mb-12 md:mb-16 max-w-3xl leading-tight" style="color: var(--fg);">
          Designed for low-resource communities
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 overflow-hidden rounded-9xl" style="gap: 1px; background: var(--border); border: 1px solid var(--border);" ref="featuresRef">
          <div class="feature-card p-10 flex flex-col gap-6 group transition-colors duration-300" style="background: var(--bg);">
            <div class="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-black tracking-tight mb-3" style="color: var(--fg);">Community-first publishing</h3>
              <p class="text-base leading-relaxed" style="color: var(--fg-soft);">Create, edit, and share with prompts and live feedback from your community.</p>
            </div>
          </div>
          <div class="feature-card p-10 flex flex-col gap-6 group transition-colors duration-300" style="background: var(--bg);">
            <div class="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-black tracking-tight mb-3" style="color: var(--fg);">Respectful social tools</h3>
              <p class="text-base leading-relaxed" style="color: var(--fg-soft);">Trust-based circles and reactions that honor cultural heritage.</p>
            </div>
          </div>
          <div class="feature-card p-10 flex flex-col gap-6 group transition-colors duration-300" style="background: var(--bg);">
            <div class="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" class="icon-stroke"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon-stroke"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-black tracking-tight mb-3" style="color: var(--fg);">Storytelling tools</h3>
              <p class="text-base leading-relaxed" style="color: var(--fg-soft);">Layouts, galleries, and translation helpers all in one place.</p>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 4 · PRODUCT (Horizontal Scroll Gallery)        -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <section class="relative py-12 sm:py-16 md:py-20 lg:py-20 px-4 sm:px-6 lg:px-12 overflow-hidden" style="background: var(--bg);">
      <div class="max-w-7xl mx-auto">
        <p class="text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4" style="color: var(--fg-soft);">What We Build</p>
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-none" style="color: var(--fg);">
          Our Products &amp; Services
        </h2>
      </div>
    </section>

    <section class="portfolio-section" ref="portfolio">
      <div class="gallery-container" ref="gallery">
        <div class="gallery-card" v-for="(card, index) in productCards" :key="index" :class="{ 'featured': card.featured }">
          <div class="card-image-wrapper">
            <img :src="card.img" :alt="card.title" loading="lazy" />
            <div class="card-overlay"></div>
          </div>
          <div class="card-content">
            <span class="card-category">{{ card.category }}</span>
            <h3 class="card-title">{{ card.title }}</h3>
            <p class="card-description">{{ card.text }}</p>
            
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="discover-btn-wrap">
        <NuxtLink to="/ServicesPage" class="discover-btn">
          <span>View All Services</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </NuxtLink>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 5 · BLOGGER (Blog Posts)                       -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <section class="relative py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden" style="background: var(--bg);">
      <div class="pointer-events-none absolute inset-0" style="
        background-image: linear-gradient(var(--grid-c) 1px, transparent 1px),
                          linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
        background-size: 40px 40px;">
      </div>
      <div class="max-w-7xl mx-auto">
        <div class="mb-8 sm:mb-12">
          <h2 class="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black tracking-tight leading-none mb-4 sm:mb-6">
            <span style="color: var(--fg);">BLOG </span>
            <span style="color: var(--fg-soft);">POSTS</span>
          </h2>
          <div class="w-10 sm:w-12 h-1 mb-4 sm:mb-8" style="background: var(--fg);"></div>
          <p class="text-base sm:text-lg md:text-xl font-medium max-w-xl leading-relaxed" style="color: var(--fg-muted);">
            Discover stories, ideas and perspectives from the Mizomade community.
          </p>
        </div>
        <p class="text-xs sm:text-sm font-bold uppercase tracking-widest mb-8 sm:mb-10" style="color: var(--fg-soft);">14 Posts</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" ref="blogRef">
          <div class="blog-card group cursor-pointer" v-for="(post, i) in blogPosts" :key="i">
            <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6" style="background: var(--card-bg); border: 1px solid var(--border);">
              <div class="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-md" style="background: var(--bg-alt); border: 1px solid var(--border);">
                <span class="text-xs font-bold uppercase tracking-widest" style="color: var(--fg);">{{ post.tag }}</span>
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-base font-bold uppercase tracking-widest" style="color: var(--fg-soft);">{{ post.tag }}</span>
              </div>
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background: var(--card-bg);"></div>
            </div>
            <div class="px-1">
              <h3 class="font-bold text-xl leading-snug tracking-tight mb-4 transition-colors duration-200" style="color: var(--fg);">{{ post.title }}</h3>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--card-bg); border: 1px solid var(--border);">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                    <circle cx="12" cy="8" r="4" stroke-width="1.5" class="avatar-stroke"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-width="1.5" stroke-linecap="round" class="avatar-stroke"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold" style="color: var(--fg-muted);">{{ post.author }}</p>
                  <p class="text-sm" style="color: var(--fg-soft);">{{ post.date }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center mt-12 sm:mt-16">
        <NuxtLink to="/blogs" class="discover-btn">
          <span>View All Posts</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </NuxtLink>
      </div>
    </section>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 6 · MARQUEE                                    -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div class="marquee-wrapper" style="padding: 20px 0; margin-bottom: 20px;">
      <div class="marquee-track">
        <div ref="marqueeContent" class="marquee-content">
          <span v-for="i in 6" :key="i" class="marquee-item">
            <span class="marquee-text">Your voice, your blog ✶ Write what matters ✶ &nbsp;</span>
          </span>
        </div>
      </div>
    </div>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 7 · APP FOOTER                                 -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <footer class="border-t border-zinc-900 bg-black pt-12 sm:pt-16 md:pt-20 lg:pt-20 pb-8 sm:pb-10 font-mono">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">

          <!-- Brand -->
          <div class="sm:col-span-2 md:col-span-2 flex gap-3 sm:gap-4">
            <div class="w-10 h-10 flex items-center justify-center font-black tracking-widest text-sm border border-white mt-1 flex-shrink-0 rounded bg-white text-black">M</div>
            <div class="flex flex-col">
              <h2 class="font-sans font-black tracking-tighter leading-none uppercase text-2xl sm:text-3xl text-white">MIZOMADE</h2>
              <p class="text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed max-w-base text-zinc-400">
                Pe rawh u, <br>tichuan pekin in awm ang.<br>
                Give,<br> and it will be given to you.
              </p>
              <div class="flex gap-3 sm:gap-4 mt-2 sm:mt-3 text-lg sm:text-xl text-zinc-400">
                <a href="#" class="transition-colors hover:text-[#0A66C2]" title="LinkedIn"><Icon name="mdi:linkedin" /></a>
                <a href="#" class="transition-colors hover:text-[#E4405F]" title="Instagram"><Icon name="mdi:instagram" /></a>
                <a href="#" class="transition-colors hover:text-[#FF0000]" title="YouTube"><Icon name="mdi:youtube" /></a>
                <a href="#" class="transition-colors hover:text-[#1DA1F2]" title="Twitter"><Icon name="mdi:twitter" /></a>
                <a href="#" class="transition-colors hover:text-[#1877F2]" title="Facebook"><Icon name="mdi:facebook" /></a>
                <a href="https://wa.me/1234567890" class="transition-colors hover:text-[#25D366]" title="WhatsApp"><Icon name="mdi:whatsapp" /></a>
              </div>
            </div>
          </div>

          <!-- Explore -->
          <div>
            <h3 class="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-lg sm:text-xl text-white">EXPLORE</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-zinc-500">
              <li v-for="link in directoryLinks" :key="link.text">
                <NuxtLink :to="link.url" class="transition-colors hover:text-white">{{ link.text }}</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-lg sm:text-xl text-white">LEGAL</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-zinc-500">
              <li v-for="link in legalLinks" :key="link.text">
                <NuxtLink :to="link.url" class="transition-colors hover:text-white">{{ link.text }}</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h3 class="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-lg sm:text-xl text-white">SUPPORT</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-zinc-500">
              <li v-for="link in supportLinks" :key="link.text">
                <NuxtLink :to="link.url" class="transition-colors hover:text-white">{{ link.text }}</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="font-bold mb-4 sm:mb-6 uppercase tracking-widest text-lg sm:text-xl text-white">CONTACT</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-zinc-500">
              <li v-for="link in contactLinks" :key="link.text">
                <NuxtLink v-if="link.type === 'link'" :to="link.url" class="transition-colors hover:text-white">{{ link.text }}</NuxtLink>
                <NuxtLink v-else :to="link.url" class="inline-block px-3 sm:px-4 py-2 rounded transition bg-white text-black hover:bg-zinc-200">{{ link.text }}</NuxtLink>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>


    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SECTION 8 · BOTTOM FOOTER                              -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div class="border-t border-zinc-900 bg-black">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5 flex items-center justify-center text-center">
        <span class="text-xs sm:text-sm font-medium text-zinc-500">© {{ new Date().getFullYear() }} Mizomade. All rights Reserved.</span>
      </div>
    </div>

  </main>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ── 3D Model refs ──────────────────────────────────────────
const canvas         = ref(null)
const modelContainer = ref(null)
const loading        = ref(true)
let renderer, scene, camera, controls, animationId, model
const MODEL_PATH = '/models/m4.glb'
const MODEL_BASE_Y = 0.40
const scroll3d   = { current: 0, target: 0 }
const LERP       = 0.05

function onScroll3d() { scroll3d.target = window.scrollY }

function getModelColor() {
  return document.documentElement.classList.contains('dark') ? 0xaaaaaa : 0x444444
}

function init3d() {
  const container = modelContainer.value
  const w = container.clientWidth
  const h = container.clientHeight

  scene = new THREE.Scene()
  scene.background = null

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
  camera.position.set(0.6, 1.3, 6.5)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95

  // Cinematic 3-point setup: stronger key, subtle cool fill, clear rim separation.
  scene.add(new THREE.AmbientLight(0xffffff, 0.14))

  const keyLight = new THREE.DirectionalLight(0xffead1, 2.1)
  keyLight.position.set(6.0, 8.5, 5.2)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xb9cdff, 0.42)
  fillLight.position.set(-5.8, 3.2, -6.0)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.05)
  rimLight.position.set(0.2, 2.5, -9.5)
  scene.add(rimLight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom    = false
  controls.enablePan     = false
  controls.enableRotate  = false
  controls.autoRotate    = false

  const loader = new GLTFLoader()
  loader.load(MODEL_PATH, (gltf) => {
    model = gltf.scene
    const box    = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size   = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale  = 2.2 / maxDim
    model.scale.setScalar(scale)
    model.position.sub(center.multiplyScalar(scale))
    model.position.x = 1.5
    model.position.y = MODEL_BASE_Y
    model.position.z = 2
    model.rotation.x = -0.7
    model.rotation.y = 0.15
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: getModelColor(), metalness: 0.7, roughness: 0.3, opacity: 0.80, transparent: true,
        })
      }
    })
    scene.add(model)
    loading.value = false
  }, undefined, (err) => { console.error('GLB load error:', err); loading.value = false })
}

const themeObserver = typeof MutationObserver !== 'undefined'
  ? new MutationObserver(() => {
      if (!model) return
      const color = getModelColor()
      model.traverse((child) => { if (child.isMesh) child.material.color.setHex(color) })
    })
  : null

function animate3d() {
  animationId = requestAnimationFrame(animate3d)
  controls?.update()
  if (model) {
    scroll3d.current += (scroll3d.target - scroll3d.current) * LERP
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const progress  = Math.min(scroll3d.current / maxScroll, 1)
    model.rotation.y = 0.5 + scroll3d.current * 0.002
    model.position.y = MODEL_BASE_Y + Math.sin(scroll3d.current * 0.002) * 0.25
    model.position.x = 1.2 + Math.sin(scroll3d.current * 0.0015) * 0.3
    const Z_START = 4.5; const Z_END = 2
    camera.position.z = Z_START - (Z_START - Z_END) * progress
    camera.position.y = 1.2 + progress * 0.4
    camera.lookAt(0, 0, 0)
  }
  renderer?.render(scene, camera)
}

function onResize3d() {
  if (!modelContainer.value) return
  const w = modelContainer.value.clientWidth
  const h = modelContainer.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

// ── Publish cards ──────────────────────────────────────────
const heroRef = ref(null)
const pubCards = [
  { label: "Publishing", icon: `<svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="8" cy="8" r="3" class="icon-shape"/><circle cx="16" cy="8" r="3" class="icon-shape"/><circle cx="8" cy="16" r="3" class="icon-shape"/><circle cx="16" cy="16" r="3" class="icon-shape"/></svg>` },
  { label: "Community",  icon: `<svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 3L21 9V15L12 21L3 15V9L12 3Z" class="icon-shape"/></svg>` },
  { label: "Culture",    icon: `<svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M5 12L2 7H12L9 12H5Z" class="icon-shape"/><path d="M19 12L22 7H12L15 12H19Z" class="icon-shape" opacity="0.5"/><path d="M5 12L8 17H16L19 12H5Z" class="icon-shape" opacity="0.75"/></svg>` },
]

// ── Product cards ──────────────────────────────────────────
const portfolio = ref(null)
const gallery   = ref(null)
const productCards = [
  { img: "images/images/original.png", title: "Hriatna Mizo Chatbot",  text: "The first low-resource language AI assistant trained on Mizoram dialects.", category: "AI COMPANION", featured: true },
  { img: "images/images/lab.jpeg",     title: "AI Research Studio",    text: "Exploring translation, summarization, and generative storytelling.", category: "Research", featured: false },
  { img: "images/images/api.jpeg",     title: "AI Tools & APIs",       text: "APIs for automated editing, voice-over, and recommendation systems.", category: "Tooling", featured: true },
  { img: "images/images/web.jpeg",     title: "Software Development",  text: "Web, mobile, and backend experiences for creators and partners.", category: "Engineering", featured: false },
  { img: "images/images/emerge.jpeg",  title: "Emerging Tech Lab",     text: "Prototyping with AR, XR, and distributed systems.", category: "Innovation", featured: false },
  { img: "images/images/ebook.jpeg",   title: "E-book",                text: "Real-time analytics, dashboards, and AI-powered insights.", category: "Analytics", featured: true },
]

// ── Blog posts ─────────────────────────────────────────────
const blogRef  = ref(null)
const blogPosts = [
  { tag: "Zirna", title: "The Spirit of Zirna in Modern Mizo Society",    author: "@lalnghak",    date: "Mar 1, 2026" },
  { tag: "Zirna", title: "Preserving Zirna Through Community Events",     author: "@malsawmi",    date: "Feb 20, 2026" },
  { tag: "Zirna", title: "What Zirna Means to Our Generation",            author: "@vanlalruata", date: "Jan 15, 2026" },
]

const featuresRef = ref(null)

// ── Marquee ────────────────────────────────────────────────
const marqueeContent = ref(null)
let marqueeX = 0, currentSpeed = 0.9, targetSpeed = 0.9, halfW = 0
let marqueeRaf = null, lastScrollY = 0, scrollTimeout = null, lastDirection = 1
const LERP_VAL = 0.06, MAX_SPEED = 4, IDLE_SPEED = 0.9, MIN_SPEED = 1.5

function lerpFn(a, b, t) { return a + (b - a) * t }
function measureMarquee() { if (marqueeContent.value) halfW = marqueeContent.value.scrollWidth / 2 }
function tickMarquee() {
  currentSpeed = lerpFn(currentSpeed, targetSpeed, LERP_VAL)
  marqueeX -= currentSpeed
  if (marqueeX <= -halfW) marqueeX += halfW
  if (marqueeX > 0) marqueeX -= halfW
  if (marqueeContent.value) marqueeContent.value.style.transform = `translateX(${marqueeX}px)`
  marqueeRaf = requestAnimationFrame(tickMarquee)
}

// ── Footer data ────────────────────────────────────────────
const directoryLinks = [
  { text: 'Landing', url: '/' }, { text: 'Blog', url: '/blogs' },
  { text: 'Service', url: '/ServicesPage' }, { text: 'Company', url: '/CompanyPage' },
]
const legalLinks = [
  { text: 'Privacy Policy', url: '/privacy' }, { text: 'Terms of Use', url: '/Terms' },
  { text: 'Disclaimer', url: '/Disclaimer' },
]
const supportLinks = [
  { text: 'About', url: '/about' }, { text: 'How to', url: '/howto' },
]
const contactLinks = [
  { text: 'mizomade.official@gmail.com', url: 'mailto:mizomade.official@gmail.com', type: 'link' },
  { text: '+91 6009229392', url: 'tel:+916009229392', type: 'link' },
  { text: 'Contact Us', url: '/mail', type: 'button' },
]

let scrollTriggerInst = null

onMounted(async () => {
  init3d()
  animate3d()
  window.addEventListener('resize', onResize3d)
  window.addEventListener('scroll', onScroll3d)
  themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  lastScrollY = window.scrollY
  measureMarquee()
  tickMarquee()

  const handleMarqueeScroll = () => {
    const currentScroll = window.scrollY
    const direction = currentScroll > lastScrollY ? 1 : -1
    lastDirection = direction
    const scrollAmount = Math.abs(currentScroll - lastScrollY)
    const speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, scrollAmount * 0.009))
    targetSpeed = direction * speed
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => { targetSpeed = lastDirection * IDLE_SPEED }, 300)
    lastScrollY = currentScroll
  }
  window.addEventListener('scroll', handleMarqueeScroll)

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  await Promise.all(
    Array.from(document.images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise(resolve => { img.onload = resolve })
    })
  )

  if (heroRef.value) {
    gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: heroRef.value, start: "top 70%", end: "+=300", scrub: 1 },
        defaults: { ease: "none" }
      }).from(".pub-card", { opacity: 0, y: 14, scale: 0.98, duration: 0.4, stagger: 0.15 })
    }, heroRef.value)
  }

  if (featuresRef.value) {
    gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: featuresRef.value, start: "top 90%", end: "+=300", scrub: 1 },
        defaults: { ease: "none" }
      }).from(".feature-card", { opacity: 0, y: 30, duration: 0.4, stagger: 0.2 })
    }, featuresRef.value)
  }

  if (gallery.value && portfolio.value) {
    const galleryWidth  = gallery.value.scrollWidth
    const viewportWidth = window.innerWidth
    const scrollLength  = galleryWidth - viewportWidth
    const animation = gsap.to(gallery.value, {
      x: () => -scrollLength,
      ease: "none",
      scrollTrigger: {
        trigger: portfolio.value,
        start: "top top",
        end: () => `+=${galleryWidth}`,
        scrub: 1.5, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      }
    })
    scrollTriggerInst = animation.scrollTrigger
  }

  if (blogRef.value) {
    gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: blogRef.value, start: "top 90%", end: "+=200", scrub: 1 },
        defaults: { ease: "none" }
      }).from(".blog-card", { opacity: 0, y: 30, duration: 0.4, stagger: 0.2 })
    }, blogRef.value)
  }

  window.addEventListener('resize', () => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  cancelAnimationFrame(marqueeRaf)
  clearTimeout(scrollTimeout)
  window.removeEventListener('resize', onResize3d)
  window.removeEventListener('scroll', onScroll3d)
  themeObserver?.disconnect()
  controls?.dispose()
  renderer?.dispose()
  scrollTriggerInst?.kill()
})
</script>


<style scoped>
/* ── CSS Variables for both modes ──────────────────────────────────── */
:root {
  /* Light mode defaults - will be overridden by dark mode */
  --bg: #ffffff;
  --fg: #111111;
  --fg-muted: #d3d1d1;
  --fg-soft: #d5d1d1;
  --border: #e5e5e5;
  --card-bg: #f5f5f5;
  --bg-alt: #fafafa;
  --grid-c: #e5e5e5;
  --glow-1: rgba(0, 0, 0, 0.05);
  --glow-2: rgba(0, 0, 0, 0.03);
}

/* Dark mode - applied when dark class is present */
:root.dark {
  --bg: #000000;
  --fg: #ffffff;
  --fg-muted: #cccccc;
  --fg-soft: #999999;
  --border: #222222;
  --card-bg: #111111;
  --bg-alt: #0a0a0a;
  --grid-c: #1a1a1a;
  --glow-1: rgba(255, 255, 255, 0.05);
  --glow-2: rgba(255, 255, 255, 0.03);
}

/* ── Grid background ──────────────────────────────────── */
.grid-bg {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, var(--grid-c) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-c) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(circle at center, black 30%, transparent 100%);
  animation: moveGrid 25s linear infinite;
}
@keyframes moveGrid {
  from { background-position: 0 0; }
  to   { background-position: 50px 50px; }
}

/* ── Buttons ──────────────────────────────────────────── */
.discover-btn-wrap { display: flex; gap: 12px; align-items: center; }
.discover-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 32px;
  background: var(--fg); color: var(--bg);
  font-weight: 700; font-size: 1rem; text-decoration: none;
  border: 1px solid var(--fg);
  transition: background 0.3s ease, color 0.3s ease;
  cursor: pointer;
}
.discover-btn:hover { background: var(--bg); color: var(--fg); }

/* ── Publish cards ────────────────────────────────────── */
.pub-cards {
  display: flex; flex-direction: column;
  width: 100%; max-width: 420px; padding: 10px 5px; gap: 0;
}
.pub-card {
  display: inline-flex; align-items: center; gap: 16px;
  padding: 16px 28px; border-radius: 1px;
  background: #858585; border: 1px solid var(--border);
  backdrop-filter: blur(12px); width: fit-content;
  font-weight: 800; font-size: clamp(1.2rem, 2.5vw, 1.7rem);
  color: var(--fg); letter-spacing: -0.02em; line-height: 1.2;
  margin-bottom: 14px;
  transition: transform 0.3s ease, background 0.3s ease;
}
.pub-card:hover { transform: translateX(8px); background: #ffffff; }
:global(html.dark) .pub-card { background: #f2f2f2; }
:global(html.dark) .pub-card:hover { background: #c33434; }
.pub-card:nth-child(1) { margin-left: 0; }
.pub-card:nth-child(2) { margin-left: 56px; }
.pub-card:nth-child(3) { margin-left: 28px; }
.pub-icon {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--card-bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pub-icon :deep(.icon-shape) { fill: var(--fg); }

/* ── Features grid ────────────────────────────────────── */
.icon-wrap {
  width: 52px; height: 52px; border-radius: 12px;
  background: var(--card-bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: background 0.3s ease, border-color 0.4s ease;
}
.group:hover .icon-wrap { background: var(--border); }
.feature-card:hover { background: color-mix(in srgb, var(--bg) 90%, var(--fg) 10%); }
.icon-stroke { stroke: var(--fg-muted); }

/* ── Portfolio / horizontal gallery ──────────────────── */
.portfolio-section {
  height: 100vh; overflow: hidden; background: var(--bg); position: relative;
}
.gallery-container {
  display: flex; align-items: center; height: 100%;
  gap: 2rem; padding: 0 10vw; will-change: transform;
}
.gallery-card {
  min-width: 280px; max-width: 280px;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-radius: 1px; overflow: hidden; border: 1px solid var(--border);
  transition: all 0.3s ease; position: relative;
}
.gallery-card.featured {
  border-radius: 1px;
}
@media (max-width: 768px) {
  .gallery-card {
    min-width: 240px; max-width: 240px;
    border-radius: 1px;
  }
  .gallery-card.featured {
    border-radius: 1px;
  }
}
@media (max-width: 480px) {
  .gallery-card {
    min-width: 200px; max-width: 200px;
    border-radius: 1px;
  }
  .gallery-card.featured {
    border-radius: 1px;
  }
}
.gallery-card:hover { transform: translateY(-8px); border-color: var(--fg-muted); box-shadow: none; }
.card-image-wrapper { height: 220px; overflow: hidden; position: relative; }
.card-image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.gallery-card:hover .card-image-wrapper img { transform: scale(1.05); }
.card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg) 60%, transparent) 100%);
  pointer-events: none;
}
.card-content { padding: 1.5rem; position: relative; }
.card-category {
  display: inline-block; font-size: 0.8rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px; color: var(--fg);
  margin-bottom: 1rem; background: var(--card-bg);
  padding: 0.3rem 1rem; border-radius: 100px; border: 1px solid var(--border);
}
.card-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.6rem; line-height: 1.3; color: var(--fg); }
.card-description { font-size: 0.95rem; line-height: 1.65; margin-bottom: 1.25rem; color: var(--fg-muted); }
.card-button {
  display: inline-flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1.5rem; background: var(--card-bg);
  border: 1px solid var(--border); border-radius: 100px;
  color: var(--fg); font-size: 1rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s ease;
}
.card-button:hover { background: var(--border); border-color: var(--fg-muted); gap: 1rem; }

.cta-section {
  min-height: 12vh; display: flex; align-items: center;
  justify-content: center; text-align: center;
  background: var(--bg); color: var(--fg);
}

/* ── Blog cards ───────────────────────────────────────── */
.blog-card { display: flex; flex-direction: column; transition: transform 0.3s ease; }
.blog-card:hover h3 { color: var(--fg-muted) !important; }
.avatar-stroke { stroke: var(--fg-soft); }

/* ── Marquee ──────────────────────────────────────────── */
.marquee-wrapper {
  width: 100%; overflow: hidden; background: var(--bg);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 28px 0; position: relative; cursor: default; user-select: none;
  z-index: 20; margin-bottom: 30px;
  transition: background-color 0.4s ease, border-color 0.4s ease;
}
.marquee-wrapper::before, .marquee-wrapper::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 140px;
  z-index: 2; pointer-events: none;
}
.marquee-wrapper::before { left: 0; background: linear-gradient(to right, var(--bg) 0%, transparent 100%); }
.marquee-wrapper::after  { right: 0; background: linear-gradient(to left, var(--bg) 0%, transparent 100%); }
.marquee-track   { display: flex; width: fit-content; }
.marquee-content { display: flex; align-items: center; white-space: nowrap; will-change: transform; }
.marquee-item    { display: inline-flex; align-items: center; gap: 24px; }
.marquee-text {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: clamp(4rem, 10vw, 8rem); text-transform: uppercase;
  letter-spacing: -0.01em; line-height: 1; color: var(--fg-soft);
  transition: color 0.3s ease;
}
.marquee-wrapper:hover .marquee-text { color: var(--fg-muted); }

@media (max-width: 768px) {
  .pub-card { padding: 12px 20px; font-size: 1rem; margin-bottom: 10px; }
  .pub-card:nth-child(2) { margin-left: 12px; }
  .pub-card:nth-child(3) { margin-left: 0; }
  .pub-icon { width: 28px; height: 28px; }
  .card-image-wrapper { height: 160px; }
  .marquee-wrapper::before, .marquee-wrapper::after { width: 40px; }
}

@media (max-width: 480px) {
  .pub-card { padding: 10px 16px; font-size: 0.9rem; margin-bottom: 8px; margin-left: 0 !important; }
  .pub-icon { width: 24px; height: 24px; }
  .card-image-wrapper { height: 140px; }
  .marquee-text { font-size: clamp(2rem, 6vw, 4rem); }
  .marquee-wrapper::before, .marquee-wrapper::after { width: 30px; }
  .feature-card { padding: 1.5rem !important; }
  .card-category { font-size: 0.65rem; padding: 0.2rem 0.8rem; }
  .card-title { font-size: 1rem; }
  .card-description { font-size: 0.85rem; }
}
</style>