<template>
  <div :class="$style.page">

    <!-- Hero Header -->
    <header :class="$style.hero">
      <div :class="$style.gridBg" />
      <div :class="$style.glareOrb" />
      <div :class="$style.heroInner">
        <p :class="$style.eyebrow">MizoMade · What We Do</p>
        <h1 :class="$style.h1">
          Ser<span :class="$style.h1Ghost">vices</span>
        </h1>
        <p :class="$style.heroText">
          Technology and tools for creators working in low-resource languages.
          MizoMade combines cultural understanding with modern AI to help
          communities publish, build, and innovate.
        </p>
      </div>
    </header>

    <!-- Services — Vertical Stack -->
    <section :class="$style.stack">
      <div
        v-for="(service, i) in services"
        :key="service.id"
        :ref="el => cardRefs[i] = el"
        :class="[$style.card, visibleCards[i] ? $style.cardVisible : $style.cardHidden]"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <!-- Card Header -->
        <div :class="$style.cardHeader">
          <div :class="$style.cardHeaderLeft">
            <div :class="[$style.iconBox, hovered === i ? $style.iconBoxActive : '']">
              <img
                v-if="service.icon.startsWith('/')"
                :src="service.icon"
                :alt="`${service.title} icon`"
                :class="$style.iconImg"
              />
              <span v-else :class="$style.iconEmoji">{{ service.icon }}</span>
            </div>
            <h3 :class="$style.cardTitle">{{ service.title }}</h3>
          </div>
          <div :class="$style.cardHeaderRight">
            <span :class="[$style.cardBadge, hovered === i ? $style.cardBadgeActive : '']">{{ service.tag }}</span>
            <span :class="[$style.cardArrow, hovered === i ? $style.cardArrowActive : '']">→</span>
          </div>
        </div>

        <!-- Card Body -->
        <div :class="$style.cardBody">
          <div :class="$style.cardBodyText">
            <p :class="$style.cardDesc">{{ service.desc }}</p>
            <div :class="$style.featWrap">
              <span
                v-for="feat in service.features"
                :key="feat"
                :class="[$style.featTag, hovered === i ? $style.featTagActive : '']"
              >{{ feat }}</span>
            </div>
          </div>
          <div :class="$style.cardDeco">
            <div :class="[$style.decoLine, hovered === i ? $style.decoLineActive : '']" />
            <span :class="$style.decoLabel">mizomade</span>
          </div>
        </div>

        <!-- Bottom accent line -->
        <div :class="[$style.accentLine, hovered === i ? $style.accentLineActive : '']" />
      </div>
    </section>

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
    icon: '/images/images/lab.png',
    desc: 'Deep research in translation, summarization, and generative storytelling specifically designed for low-resource languages where mainstream AI still falls short.',
    features: ['Translation Models', 'Summarization', 'Generative Storytelling', 'Low-Resource NLP'],
  },
  {
    id: 'tools',
    title: 'AI Tools & APIs',
    tag: 'Developer · API',
    icon: '/images/images/setting.png',
    desc: 'Ready-to-integrate APIs and modules for automated editing, voice generation, recommendation systems, and multilingual workflows — built for developers.',
    features: ['Voice Generation', 'Auto Editing', 'Recommendations', 'Multilingual API'],
  },
  {
    id: 'software',
    title: 'Software Development',
    tag: 'Web · Mobile',
    icon: '/images/images/laptop.png',
    desc: 'Custom web, mobile, and backend systems built for creators, publishers, and organisations serving low-resource language communities at any scale.',
    features: ['Web Apps', 'Mobile', 'Backend Systems', 'Custom Builds'],
  },
  {
    id: 'emerging',
    title: 'Emerging Tech Lab',
    tag: 'AR · XR · Web3',
    icon: '/images/images/flask.png',
    desc: 'Prototyping with AR, XR, and distributed systems so low-resource communities stay connected to the future of technology — not left behind by it.',
    features: ['AR / XR', 'Distributed Systems', 'Prototyping', 'Future Tech'],
  },
  {
    id: 'innovation',
    title: 'Innovation & Partnerships',
    tag: 'Collaboration',
    icon: '/images/images/handshake.png',
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
          setTimeout(() => { visibleCards[idx] = true }, idx * 80)
        }
      })
    },
    { threshold: 0.12 }
  )

  cardRefs.value.forEach((el) => { if (el) observer.observe(el) })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style module>
/* ─── CSS tokens — mirrors About page exactly ───────────── */
:global(:root) {
  --bg:       #dcdcdc;
  --bg-alt:   #eceae6;
  --fg:       #0a0a0a;
  --fg-muted: #555551;
  --fg-soft:  rgba(10,10,10,0.50);
  --border:   rgba(10,10,10,0.14);
  --card-bg:  rgba(10,10,10,0.259);
  --grid-c:   rgba(10,10,10,0.107);
}
:global(html.dark) {
  --bg:       #0a0a0a;
  --bg-alt:   #0f0f0f;
  --fg:       #f0ede8;
  --fg-muted: rgba(240,237,232,0.72);
  --fg-soft:  rgba(240,237,232,0.50);
  --border:   rgba(240,237,232,0.18);
  --card-bg:  rgba(255,255,255,0.06);
  --grid-c:   rgba(237,237,237,0.088);
}

:global(*) {
  transition:
    background-color 0.4s ease,
    border-color     0.4s ease,
    color            0.4s ease,
    box-shadow       0.4s ease;
}

/* ─── Page ───────────────────────────────────────────────── */
.page {
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
  font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace;
  overflow-x: hidden;
}

/* ─── Hero ───────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 6rem 1.5rem 4rem;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
@media (min-width: 768px)  { .hero { padding: 6rem 4rem 4rem; } }
@media (min-width: 1024px) { .hero { padding: 6rem 7rem 4rem; } }

.gridBg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid-c) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.glareOrb {
  position: absolute;
  top: 0;
  right: 0;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--fg-soft), transparent 70%);
  opacity: 0.04;
  filter: blur(3rem);
  pointer-events: none;
}

.heroInner { position: relative; z-index: 2; max-width: 80rem; }

.eyebrow {
  color: var(--fg-soft);
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--fg);
  margin-bottom: 1.5rem;
}
.h1Ghost { color: var(--fg-soft); }

.heroText {
  color: var(--fg-muted);
  font-size: 1.125rem;
  line-height: 1.75;
  max-width: 42rem;
}

/* ─── Stack section ──────────────────────────────────────── */
.stack {
  max-width: 80rem;
  margin: 0 auto;
  padding: 5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
@media (min-width: 768px)  { .stack { padding: 5rem 4rem; } }
@media (min-width: 1024px) { .stack { padding: 5rem 7rem; } }

/* ─── Service card ───────────────────────────────────────── */
.card {
  border: 1px solid var(--border);
  overflow: hidden;
  transition: opacity 0.7s ease, transform 0.7s ease !important;
}
.cardVisible { opacity: 1; transform: translateY(0); }
.cardHidden  { opacity: 0; transform: translateY(2.5rem); }

/* Card header */
.cardHeader {
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.cardHeaderLeft  { display: flex; align-items: center; gap: 1.25rem; }
.cardHeaderRight { display: flex; align-items: center; gap: 0.75rem; }

.iconBox {
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--border);
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease !important;
}
.iconBoxActive {
  border-color: var(--fg-muted);
  background: var(--card-bg);
  transform: scale(1.1);
}

.iconImg   { width: 2rem; height: 2rem; object-fit: contain; }
.iconEmoji { font-size: 1.25rem; }

.cardTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--fg);
}

.cardBadge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border: 1px solid var(--border);
  color: var(--fg-soft);
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
  transition: border-color 0.3s ease, color 0.3s ease !important;
}
.cardBadgeActive { border-color: var(--fg-muted); color: var(--fg-muted); }

.cardArrow {
  color: var(--fg-soft);
  font-size: 1.1rem;
  transition: color 0.3s ease, transform 0.3s ease !important;
}
.cardArrowActive { color: var(--fg); transform: translateX(4px); }

/* Card body */
.cardBody {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .cardBody {
    flex-direction: row;
    align-items: flex-start;
    gap: 3rem;
  }
}

.cardBodyText { flex: 1; }

.cardDesc {
  color: var(--fg-muted);
  font-size: 0.9rem;
  line-height: 1.75;
  margin-bottom: 1rem;
  max-width: 42rem;
}

.featWrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.featTag {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid var(--border);
  color: var(--fg-soft);
  padding: 0.25rem 0.6rem;
  transition: border-color 0.2s ease, color 0.2s ease !important;
}
.featTagActive { border-color: var(--border); color: var(--fg-muted); }

/* Decorative right column */
.cardDeco {
  display: none;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  align-self: stretch;
  flex-shrink: 0;
  width: 6rem;
}
@media (min-width: 768px) { .cardDeco { display: flex; } }

.decoLine {
  width: 100%;
  height: 1px;
  background: var(--border);
  transition: background 0.5s ease !important;
}
.decoLineActive { background: var(--fg-muted); }

.decoLabel {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--fg-soft);
  margin-top: 0.5rem;
  text-align: right;
}

/* Bottom accent line */
.accentLine {
  height: 1px;
  width: 0;
  background: var(--fg);
  transition: width 0.5s ease !important;
}
.accentLineActive { width: 100%; }
</style>
