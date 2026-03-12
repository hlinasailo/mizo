<template>
  <div class="bg-black min-h-screen text-white font-mono overflow-x-hidden">
    <!-- Hero -->
    <header class="relative min-h-[60vh] flex flex-col justify-end px-6 md:px-16 lg:px-28 pt-24 pb-16 border-b border-white/10">
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 60px 60px;"
      />
      <div class="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-3xl"
        style="background: radial-gradient(circle, white, transparent 70%);"
      />
      <div class="relative z-10 max-w-5xl">
        <p class="text-white/30 text-xs tracking-[0.4em] uppercase mb-6">MizoMade · Company</p>
        <h1 class="text-[clamp(2.5rem,8vw,7rem)] font-black leading-none tracking-tighter text-white mb-8">
          Mizomade<br/><span class="text-white/20">Private Limited</span>
        </h1>
        <p class="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl">
          Breaking language barriers with inclusive AI, IoT, and emerging technologies —
          building tools that help low-resource languages and communities thrive in the digital world.
        </p>
      </div>
    </header>

    <!-- Stats -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 grid grid-cols-3 divide-x divide-white/10">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          :ref="el => statRefs[i] = el"
          class="py-12 px-6 text-center transition-all duration-700"
          :class="visibleStats[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <p class="text-[clamp(2.5rem,6vw,4rem)] font-black tracking-tighter text-white leading-none mb-2">{{ stat.number }}</p>
          <p class="text-white/30 text-xs uppercase tracking-widest">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Our Focus -->
    <section class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 py-20 border-b border-white/10">
      <div class="flex flex-col md:flex-row md:items-start gap-12">
        <div class="md:w-1/3 shrink-0">
          <p class="text-white/20 text-xs uppercase tracking-widest mb-3">01</p>
          <h2 class="text-3xl md:text-4xl font-black tracking-tighter text-white leading-tight">Our<br/>Focus</h2>
        </div>
        <div class="md:w-2/3">
          <p class="text-white/50 text-lg leading-relaxed mb-10">
            AI, IoT, and technology designed for underserved languages and communities.
            We prototype and deploy solutions that help creators, educators, and researchers
            access modern technology — regardless of how widely their language is spoken.
          </p>
          <div class="space-y-2">
            <div
              v-for="(item, i) in focusItems"
              :key="item"
              :ref="el => focusRefs[i] = el"
              class="flex items-start gap-4 py-4 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-sm transition-all duration-700"
              :class="visibleFocus[i] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'"
            >
              <span class="text-white/20 text-xs mt-1 font-mono shrink-0">{{ String(i+1).padStart(2,'0') }}</span>
              <p class="text-white/55 text-sm leading-relaxed group-hover:text-white/75 transition-colors">{{ item }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Cards -->
    <section class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 py-20 border-b border-white/10">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <p class="text-white/20 text-xs uppercase tracking-widest mb-3">02</p>
          <h2 class="text-3xl md:text-4xl font-black tracking-tighter text-white">Mission</h2>
        </div>
      </div>
      <div class="space-y-2">
        <div
          v-for="(card, i) in missionCards"
          :key="card.title"
          :ref="el => missionRefs[i] = el"
          class="border border-white/10 rounded-sm overflow-hidden transition-all duration-700"
          :class="visibleMission[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          @mouseenter="hoveredMission = i"
          @mouseleave="hoveredMission = null"
        >
          <div class="flex items-center justify-between px-8 py-6 border-b border-white/5"
            :class="hoveredMission === i ? 'bg-white/[0.03]' : ''"
            style="transition: background 0.3s"
          >
            <div class="flex items-center gap-5">
              <span class="text-2xl">
                <i v-if="card.icon.startsWith('fi')" :class="card.icon"></i>
                <img
                  v-else-if="card.icon.startsWith('/') || card.icon.match(/\.(png|jpe?g|webp|svg)$/i)"
                  :src="card.icon"
                  :alt="`${card.title} icon`"
                  class="w-8 h-8 object-contain"
                />
                <span v-else>{{ card.icon }}</span>
              </span>
              <h3 class="text-lg md:text-xl font-bold tracking-tight text-white">{{ card.title }}</h3>
            </div>
            <span
              class="text-white/30 transition-all duration-300 text-lg"
              :class="hoveredMission === i ? 'text-white translate-x-1' : ''"
            >→</span>
          </div>
          <div class="px-8 py-5">
            <p class="text-white/50 text-sm leading-relaxed">{{ card.text }}</p>
          </div>
          <div class="h-[1px] w-0 bg-white transition-all duration-500"
            :class="hoveredMission === i ? 'w-full' : ''"
          />
        </div>
      </div>
    </section>

    <!-- Technology Cards -->
    <section class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 py-20 border-b border-white/10">
      <div class="mb-10">
        <p class="text-white/20 text-xs uppercase tracking-widest mb-3">03</p>
        <h2 class="text-3xl md:text-4xl font-black tracking-tighter text-white">Technology</h2>
      </div>
      <div class="space-y-2">
        <div
          v-for="(card, i) in techCards"
          :key="card.title"
          :ref="el => techRefs[i] = el"
          class="border border-white/10 rounded-sm overflow-hidden transition-all duration-700"
          :class="visibleTech[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          @mouseenter="hoveredTech = i"
          @mouseleave="hoveredTech = null"
        >
          <div class="flex items-center justify-between px-8 py-6 border-b border-white/5"
            :class="hoveredTech === i ? 'bg-white/[0.03]' : ''"
            style="transition: background 0.3s"
          >
            <div class="flex items-center gap-5">
  <span class="text-2xl">
    <i v-if="card.icon.startsWith('fi')" :class="card.icon"></i>
    <img
      v-else-if="card.icon.startsWith('/') || card.icon.match(/\.(png|jpe?g|webp|svg)$/i)"
      :src="card.icon"
      alt="{{ card.title }} icon"
      class="w-8 h-8 object-contain"
    />
    <span v-else>{{ card.icon }}</span>
  </span>

  <h3 class="text-lg md:text-xl font-bold tracking-tight text-white">
    {{ card.title }}
  </h3>
</div>
            <div class="flex items-center gap-3">
              <span
                class="text-[10px] uppercase tracking-widest border px-3 py-1 rounded-sm transition-all duration-300"
                :class="hoveredTech === i ? 'border-white/50 text-white/60' : 'border-white/10 text-white/25'"
              >{{ card.tag }}</span>
              <span
                class="text-white/30 transition-all duration-300 text-lg"
                :class="hoveredTech === i ? 'text-white translate-x-1' : ''"
              >→</span>
            </div>
          </div>
          <div class="px-8 py-5 flex flex-col md:flex-row md:items-start gap-6">
            <p class="text-white/50 text-sm leading-relaxed flex-1">{{ card.text }}</p>
            <div class="flex flex-wrap gap-2 md:w-64 shrink-0">
              <span
                v-for="feat in card.features"
                :key="feat"
                class="text-[11px] uppercase tracking-wider border border-white/10 text-white/35 px-3 py-1 rounded-sm transition-all duration-200"
                :class="hoveredTech === i ? 'border-white/20 text-white/55' : ''"
              >{{ feat }}</span>
            </div>
          </div>
          <div class="h-[1px] w-0 bg-white transition-all duration-500"
            :class="hoveredTech === i ? 'w-full' : ''"
          />
        </div>
      </div>
    </section>

    <!-- Impact -->
    <section class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 py-20 border-b border-white/10">
      <div class="flex flex-col md:flex-row md:items-start gap-12">
        <div class="md:w-1/3 shrink-0">
          <p class="text-white/20 text-xs uppercase tracking-widest mb-3">04</p>
          <h2 class="text-3xl md:text-4xl font-black tracking-tighter text-white leading-tight">Impact</h2>
        </div>
        <div class="md:w-2/3">
          <p class="text-white/50 text-lg leading-relaxed mb-10">
            We transform local knowledge into accessible digital tools that work offline,
            respect privacy, and support regional languages at every level.
          </p>
          <div class="space-y-2">
            <div
              v-for="(item, i) in impactItems"
              :key="item"
              class="flex items-start gap-4 py-4 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-sm transition-colors"
            >
              <span class="text-white/20 text-xs mt-1 font-mono shrink-0">{{ String(i+1).padStart(2,'0') }}</span>
              <p class="text-white/55 text-sm leading-relaxed group-hover:text-white/75 transition-colors">{{ item }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why It Matters -->
    <section class="max-w-5xl mx-auto px-6 md:px-16 lg:px-28 py-24">
      <p class="text-white/20 text-xs uppercase tracking-widest mb-6">05</p>
      <div class="border border-white/10 rounded-sm p-10 md:p-14 bg-white/[0.01] relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03]"
          style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 40px 40px;"
        />
        <div class="relative z-10">
          <h2 class="text-3xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-8">
            Why It<br/><span class="text-white/25">Matters</span>
          </h2>
          <p class="text-white/50 text-lg leading-relaxed max-w-2xl">
            Our goal is simple — bring powerful technology to every language and every community.
            MizoMade continues investing in accessible software, ethical AI, and human-centered
            research so knowledge can reach every region, not just the well-resourced ones.
          </p>
        </div>
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
const hoveredMission = ref(null)
const hoveredTech = ref(null)

const statRefs = ref([])
const focusRefs = ref([])
const missionRefs = ref([])
const techRefs = ref([])

const visibleStats = reactive({})
const visibleFocus = reactive({})
const visibleMission = reactive({})
const visibleTech = reactive({})

const stats = [
  { number: '24', label: 'Language Partners' },
  { number: '17', label: 'Research Labs' },
  { number: '3',  label: 'AI Labs' },
]

const focusItems = [
  'Prototype and deploy AI solutions designed for low-resource languages.',
  'Help creators, educators, and researchers access modern technology tools.',
  'Build offline-first systems that work where connectivity is limited.',
  'Partner with linguists and communities to preserve regional languages digitally.',
]

const missionCards = [
  {
    icon: '/images/images/bulb.png',
    title: 'Accessible Innovation',
    text: 'AI and digital tools designed to work even with limited connectivity — because innovation should reach every corner, not just the well-connected ones.',
  },
  {
    icon: '/images/images/internet.png',
    title: 'Language Stewardship',
    text: 'Collaboration with linguists and communities to preserve, document, and digitize regional languages before they are lost to the digital divide.',
  },
  {
    icon: '/images/images/tools.png',
    title: 'Community Labs',
    text: 'Workshops, creator residencies, and co-design labs that shape technology around local needs — built with communities, not just for them.',
  },
]

const techCards = [
  {
    icon: '/images/images/robot.png',
    title: 'Responsible AI',
    tag: 'AI · NLP',
    text: 'Chatbots, translation systems, and semantic search designed for low-resource languages — with transparency and community consent at the core.',
    features: ['Chatbots', 'Translation', 'Semantic Search', 'Ethical AI'],
  },
  {
    icon: '/images/images/iot.png',
    title: 'IoT & Connectivity',
    tag: 'Hardware · Networks',
    text: 'Low-power sensors, mesh networks, and offline-first applications that keep communities connected even without reliable internet infrastructure.',
    features: ['Mesh Networks', 'Low-Power Sensors', 'Offline-First', 'Smart Sync'],
  },
  {
    icon: '/images/images/zoom.png',
    title: 'Emerging Technology',
    tag: 'AR · XR · Gen AI',
    text: 'AR/VR storytelling, generative tools, and automation emerging from grassroots research — ensuring no community is left behind by the next wave of technology.',
    features: ['AR / VR', 'Generative Tools', 'Automation', 'Prototyping'],
  },
]

const impactItems = [
  'Dialect-aware chatbot training for Mizo and regional language communities.',
  'Translation systems for regional languages underserved by mainstream AI.',
  'Offline knowledge systems with smart syncing for low-connectivity areas.',
  'Sensor networks deployed in schools and cultural events across Mizoram.',
]

function onScroll() {
  const doc = document.documentElement
  const scrollTop = doc.scrollTop || document.body.scrollTop
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}

function observe(refs, visibleObj, delay = 80) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = refs.value.indexOf(entry.target)
        if (idx !== -1 && entry.isIntersecting) {
          setTimeout(() => { visibleObj[idx] = true }, idx * delay)
        }
      })
    },
    { threshold: 0.12 }
  )
  refs.value.forEach((el) => { if (el) observer.observe(el) })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  observe(statRefs, visibleStats, 120)
  observe(focusRefs, visibleFocus, 80)
  observe(missionRefs, visibleMission, 100)
  observe(techRefs, visibleTech, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>
