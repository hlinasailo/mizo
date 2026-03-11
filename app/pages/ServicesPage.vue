<template>
  <div class="bg-black min-h-screen text-white font-mono overflow-x-hidden">

    <!-- Hero Header -->
    <header class="relative min-h-[60vh] flex flex-col justify-end px-6 md:px-16 lg:px-28 pt-24 pb-16 border-b border-white/10">
      <div
        class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 60px 60px;"
      />
      <div
        class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-3xl"
        style="background: radial-gradient(circle, white, transparent 70%);"
      />
      <div class="relative z-10 max-w-5xl">
        <p class="text-white/30 text-xs tracking-[0.4em] uppercase mb-6">MizoMade · What We Do</p>
        <h1 class="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter text-white mb-6">
          Ser<span class="text-white/20">vices</span>
        </h1>
        <p class="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl">
          Technology and tools for creators working in low-resource languages.
          MizoMade combines cultural understanding with modern AI to help
          communities publish, build, and innovate.
        </p>
      </div>
    </header>

    <!-- Services — Vertical Stack -->
    <section ref="stackRef" class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 py-20 space-y-2">

      <div
        v-for="(service, i) in services"
        :key="service.id"
        :ref="el => cardRefs[i] = el"
        class="service-card border border-white/10 rounded-sm overflow-hidden transition-all duration-700"
        :class="visibleCards[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        :style="{ transitionDelay: visibleCards[i] ? '0ms' : '0ms' }"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <!-- Card Header -->
        <div class="px-8 py-6 flex items-center justify-between gap-6 border-b border-white/10">
          <div class="flex items-center gap-5">
            <div
              class="w-12 h-12 border rounded-sm flex items-center justify-center transition-all duration-300 overflow-hidden"
              :class="hovered === i ? 'border-white/40 bg-white/[0.06] scale-110' : 'border-white/10 bg-white/[0.02]'"
            >
              <img
                v-if="service.icon.startsWith('/')"
                :src="service.icon"
                :alt="`${service.title} icon`"
                class="w-8 h-8 object-contain"
              >
              <span v-else class="text-xl">{{ service.icon }}</span>
            </div>
            <h3 class="text-lg md:text-2xl font-bold tracking-tight text-white">
              {{ service.title }}
            </h3>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-[10px] uppercase tracking-widest border px-3 py-1 rounded-sm transition-all duration-300"
              :class="hovered === i ? 'border-white/50 text-white/60' : 'border-white/10 text-white/25'"
            >{{ service.tag }}</span>
            <!-- Animated arrow -->
            <span
              class="text-white/30 transition-all duration-300 text-lg"
              :class="hovered === i ? 'text-white translate-x-1' : ''"
            >→</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-8 py-6 flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          <!-- Text -->
          <div class="flex-1">
            <p class="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">{{ service.desc }}</p>
            <!-- Feature tags -->
            <div class="flex flex-wrap gap-2">
              <span
                v-for="feat in service.features"
                :key="feat"
                class="text-[11px] uppercase tracking-wider border border-white/10 text-white/35 px-3 py-1 rounded-sm transition-all duration-200"
                :class="hovered === i ? 'border-white/20 text-white/55' : ''"
              >{{ feat }}</span>
            </div>
          </div>
          <!-- Right: decorative line -->
          <div class="hidden md:flex flex-col items-end justify-between self-stretch shrink-0 w-24">
            <div
              class="w-full h-[1px] bg-white/10 transition-all duration-500"
              :class="hovered === i ? 'bg-white/30' : ''"
            />
            <span class="text-white/10 text-[10px] uppercase tracking-widest mt-2 text-right">mizomade</span>
          </div>
        </div>

        <!-- Hover bottom accent line -->
        <div
          class="h-[1px] w-0 bg-white transition-all duration-500"
          :class="hovered === i ? 'w-full' : ''"
        />
      </div>

    </section>
    <!-- Footer -->
     <AppFooter/>
    <ButtomFooter/>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'

const scrollProgress = ref(0)
const hovered = ref(null)
const cardRefs = ref([])
const visibleCards = reactive({})

const services = [
  {
    id: 'chatbot',
    title: 'Hriatna Mizo Chatbot',
    tag: 'AI · Language',
    icon: '/images/images/hriatna.png',
    desc: 'An AI assistant trained on Mizoram dialects that helps answer questions, support learning, and generate culturally relevant content — built for the community, by the community.',
    features: ['Dialect Training', 'Cultural Context', 'Q&A Engine', 'Content Generation'],
  },
  {
    id: 'research',
    title: 'AI Research Studio',
    tag: 'Research · NLP',
    icon: '🔬',
    desc: 'Deep research in translation, summarization, and generative storytelling specifically designed for low-resource languages where mainstream AI still falls short.',
    features: ['Translation Models', 'Summarization', 'Generative Storytelling', 'Low-Resource NLP'],
  },
  {
    id: 'tools',
    title: 'AI Tools & APIs',
    tag: 'Developer · API',
    icon: '⚙️',
    desc: 'Ready-to-integrate APIs and modules for automated editing, voice generation, recommendation systems, and multilingual workflows — built for developers.',
    features: ['Voice Generation', 'Auto Editing', 'Recommendations', 'Multilingual API'],
  },
  {
    id: 'software',
    title: 'Software Development',
    tag: 'Web · Mobile',
    icon: '💻',
    desc: 'Custom web, mobile, and backend systems built for creators, publishers, and organisations serving low-resource language communities at any scale.',
    features: ['Web Apps', 'Mobile', 'Backend Systems', 'Custom Builds'],
  },
  {
    id: 'emerging',
    title: 'Emerging Tech Lab',
    tag: 'AR · XR · Web3',
    icon: '🔭',
    desc: 'Prototyping with AR, XR, and distributed systems so low-resource communities stay connected to the future of technology — not left behind by it.',
    features: ['AR / XR', 'Distributed Systems', 'Prototyping', 'Future Tech'],
  },
  {
    id: 'innovation',
    title: 'Innovation & Partnerships',
    tag: 'Collaboration',
    icon: '🤝',
    desc: 'Collaboration with creators, researchers, and universities to build responsible AI tools and cultural technology that serves real people and real languages.',
    features: ['Research Collab', 'University Partners', 'Responsible AI', 'Cultural Tech'],
  },
]

function onScroll() {
  const doc = document.documentElement
  const scrollTop = doc.scrollTop || document.body.scrollTop
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = cardRefs.value.indexOf(entry.target)
        if (idx !== -1 && entry.isIntersecting) {
          setTimeout(() => {
            visibleCards[idx] = true
          }, idx * 80)
        }
      })
    },
    { threshold: 0.12 }
  )

  cardRefs.value.forEach((el) => {
    if (el) observer.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
