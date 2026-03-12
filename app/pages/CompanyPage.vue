<template>
  <div :class="$style.page">

    <!-- Hero -->
    <header :class="$style.hero">
      <div :class="$style.gridBg" />
      <div :class="$style.glareOrb" />
      <div :class="$style.heroInner">
        <p :class="$style.eyebrow">MizoMade · Company</p>
        <h1 :class="$style.h1">
          Mizomade<br/><span :class="$style.h1Ghost">Private Limited</span>
        </h1>
        <p :class="$style.heroText">
          Breaking language barriers with inclusive AI, IoT, and emerging technologies —
          building tools that help low-resource languages and communities thrive in the digital world.
        </p>
      </div>
    </header>

    <!-- Stats -->
    <section :class="$style.statsSection">
      <div :class="$style.statsGrid">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          :ref="el => statRefs[i] = el"
          :class="[$style.statCell, visibleStats[i] ? $style.visible : $style.hidden]"
        >
          <p :class="$style.statNum">{{ stat.number }}</p>
          <p :class="$style.statLabel">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Our Focus -->
    <section :class="$style.twoColSection">
      <div :class="$style.sideLabel">
        <p :class="$style.sectionIndex">01</p>
        <h2 :class="$style.sectionTitle">Our<br/>Focus</h2>
      </div>
      <div :class="$style.sideContent">
        <p :class="[$style.leadText, $style.mb10]">
          AI, IoT, and technology designed for underserved languages and communities.
          We prototype and deploy solutions that help creators, educators, and researchers
          access modern technology — regardless of how widely their language is spoken.
        </p>
        <div :class="$style.listWrap">
          <div
            v-for="(item, i) in focusItems"
            :key="item"
            :ref="el => focusRefs[i] = el"
            :class="[$style.listItem, visibleFocus[i] ? $style.listVisible : $style.listHidden]"
          >
            <span :class="$style.listIndex">{{ String(i+1).padStart(2,'0') }}</span>
            <p :class="$style.listText">{{ item }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Cards -->
    <section :class="$style.cardSection">
      <div :class="$style.cardSectionHeader">
        <p :class="$style.sectionIndex">02</p>
        <h2 :class="$style.sectionTitle">Mission</h2>
      </div>
      <div :class="$style.cardList">
        <div
          v-for="(card, i) in missionCards"
          :key="card.title"
          :ref="el => missionRefs[i] = el"
          :class="[$style.card, visibleMission[i] ? $style.cardVisible : $style.cardHidden]"
          @mouseenter="hoveredMission = i"
          @mouseleave="hoveredMission = null"
        >
          <div :class="[$style.cardHeader, hoveredMission === i ? $style.cardHeaderHover : '']">
            <div :class="$style.cardHeaderLeft">
              <span :class="$style.cardIcon">
                <i v-if="card.icon.startsWith('fi')" :class="card.icon"></i>
                <img
                  v-else-if="card.icon.startsWith('/') || card.icon.match(/\.(png|jpe?g|webp|svg)$/i)"
                  :src="card.icon"
                  :alt="`${card.title} icon`"
                  :class="$style.cardImg"
                />
                <span v-else>{{ card.icon }}</span>
              </span>
              <h3 :class="$style.cardTitle">{{ card.title }}</h3>
            </div>
            <span :class="[$style.cardArrow, hoveredMission === i ? $style.cardArrowActive : '']">→</span>
          </div>
          <div :class="$style.cardBody">
            <p :class="$style.cardText">{{ card.text }}</p>
          </div>
          <div :class="[$style.cardLine, hoveredMission === i ? $style.cardLineActive : '']" />
        </div>
      </div>
    </section>

    <!-- Technology Cards -->
    <section :class="$style.cardSection">
      <div :class="$style.cardSectionHeader">
        <p :class="$style.sectionIndex">03</p>
        <h2 :class="$style.sectionTitle">Technology</h2>
      </div>
      <div :class="$style.cardList">
        <div
          v-for="(card, i) in techCards"
          :key="card.title"
          :ref="el => techRefs[i] = el"
          :class="[$style.card, visibleTech[i] ? $style.cardVisible : $style.cardHidden]"
          @mouseenter="hoveredTech = i"
          @mouseleave="hoveredTech = null"
        >
          <div :class="[$style.cardHeader, hoveredTech === i ? $style.cardHeaderHover : '']">
            <div :class="$style.cardHeaderLeft">
              <span :class="$style.cardIcon">
                <i v-if="card.icon.startsWith('fi')" :class="card.icon"></i>
                <img
                  v-else-if="card.icon.startsWith('/') || card.icon.match(/\.(png|jpe?g|webp|svg)$/i)"
                  :src="card.icon"
                  :alt="`${card.title} icon`"
                  :class="$style.cardImg"
                />
                <span v-else>{{ card.icon }}</span>
              </span>
              <h3 :class="$style.cardTitle">{{ card.title }}</h3>
            </div>
            <div :class="$style.cardHeaderRight">
              <span :class="[$style.cardBadge, hoveredTech === i ? $style.cardBadgeActive : '']">{{ card.tag }}</span>
              <span :class="[$style.cardArrow, hoveredTech === i ? $style.cardArrowActive : '']">→</span>
            </div>
          </div>
          <div :class="[$style.cardBody, $style.cardBodyFlex]">
            <p :class="[$style.cardText, $style.flex1]">{{ card.text }}</p>
            <div :class="$style.featuresWrap">
              <span
                v-for="feat in card.features"
                :key="feat"
                :class="[$style.featTag, hoveredTech === i ? $style.featTagActive : '']"
              >{{ feat }}</span>
            </div>
          </div>
          <div :class="[$style.cardLine, hoveredTech === i ? $style.cardLineActive : '']" />
        </div>
      </div>
    </section>

    <!-- Impact -->
    <section :class="$style.twoColSection">
      <div :class="$style.sideLabel">
        <p :class="$style.sectionIndex">04</p>
        <h2 :class="$style.sectionTitle">Impact</h2>
      </div>
      <div :class="$style.sideContent">
        <p :class="[$style.leadText, $style.mb10]">
          We transform local knowledge into accessible digital tools that work offline,
          respect privacy, and support regional languages at every level.
        </p>
        <div :class="$style.listWrap">
          <div
            v-for="(item, i) in impactItems"
            :key="item"
            :class="$style.listItem"
          >
            <span :class="$style.listIndex">{{ String(i+1).padStart(2,'0') }}</span>
            <p :class="$style.listText">{{ item }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why It Matters -->
    <section :class="$style.whySection">
      <p :class="$style.sectionIndex">05</p>
      <div :class="$style.whyBox">
        <div :class="$style.whyGridBg" />
        <div :class="$style.whyInner">
          <h2 :class="$style.whyTitle">
            Why It<br/><span :class="$style.whyTitleGhost">Matters</span>
          </h2>
          <p :class="$style.whyText">
            Our goal is simple — bring powerful technology to every language and every community.
            MizoMade continues investing in accessible software, ethical AI, and human-centered
            research so knowledge can reach every region, not just the well-resourced ones.
          </p>
        </div>
      </div>
    </section>

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

/* ─── Smooth theme transitions ──────────────────────────── */
:global(*) {
  transition:
    background-color 0.4s ease,
    border-color     0.4s ease,
    color            0.4s ease,
    box-shadow       0.4s ease;
}

/* ─── Page shell ─────────────────────────────────────────── */
.page {
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
  font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace;
  overflow-x: hidden;
}

/* ─── Shared section padding ─────────────────────────────── */
.hero,
.statsSection,
.twoColSection,
.cardSection,
.whySection {
  border-bottom: 1px solid var(--border);
}

/* ─── Hero ───────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 6rem 1.5rem 4rem;
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
  left: 0;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--fg-soft), transparent 70%);
  opacity: 0.04;
  filter: blur(3rem);
  pointer-events: none;
}

.heroInner {
  position: relative;
  z-index: 2;
  max-width: 80rem;
}

.eyebrow {
  color: var(--fg-soft);
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 8vw, 7rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--fg);
  margin-bottom: 2rem;
}
.h1Ghost { color: var(--fg-soft); }

.heroText {
  color: var(--fg-muted);
  font-size: 1.125rem;
  line-height: 1.75;
  max-width: 42rem;
}

/* ─── Stats ──────────────────────────────────────────────── */
.statsSection { background: var(--bg); }

.statsGrid {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  divide-x: 1px solid var(--border);
}
@media (min-width: 768px)  { .statsGrid { padding: 0 4rem; } }
@media (min-width: 1024px) { .statsGrid { padding: 0 7rem; } }

.statCell {
  padding: 3rem 1.5rem;
  text-align: center;
  border-right: 1px solid var(--border);
  transition: opacity 0.7s ease, transform 0.7s ease !important;
}
.statCell:last-child { border-right: none; }

.visible  { opacity: 1; transform: translateY(0); }
.hidden   { opacity: 0; transform: translateY(1.5rem); }

.statNum {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--fg);
  line-height: 1;
  margin-bottom: 0.5rem;
}
.statLabel {
  color: var(--fg-soft);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

/* ─── Two-col layout (Focus / Impact) ────────────────────── */
.twoColSection {
  max-width: 80rem;
  margin: 0 auto;
  padding: 5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
@media (min-width: 768px) {
  .twoColSection {
    flex-direction: row;
    align-items: flex-start;
    gap: 3rem;
    padding: 5rem 4rem;
  }
}
@media (min-width: 1024px) { .twoColSection { padding: 5rem 7rem; } }

.sideLabel { flex-shrink: 0; }
@media (min-width: 768px) { .sideLabel { width: 33%; } }

.sideContent { flex: 1; }

.sectionIndex {
  color: var(--fg-soft);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 0.75rem;
}

.sectionTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--fg);
  line-height: 1.05;
  text-transform: uppercase;
}

.leadText {
  color: var(--fg-muted);
  font-size: 1.0625rem;
  line-height: 1.75;
}
.mb10 { margin-bottom: 2.5rem; }

/* ─── List items ─────────────────────────────────────────── */
.listWrap { display: flex; flex-direction: column; }

.listItem {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid var(--border);
  transition: opacity 0.7s ease, transform 0.7s ease, background 0.2s ease !important;
}
.listItem:last-child { border-bottom: none; }
.listItem:hover { background: var(--card-bg); }

.listVisible { opacity: 1; transform: translateX(0); }
.listHidden  { opacity: 0; transform: translateX(-1rem); }

.listIndex {
  color: var(--fg-soft);
  font-size: 0.7rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
}
.listText {
  color: var(--fg-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}
.listItem:hover .listText { color: var(--fg); }

/* ─── Card sections ──────────────────────────────────────── */
.cardSection {
  max-width: 80rem;
  margin: 0 auto;
  padding: 5rem 1.5rem;
}
@media (min-width: 768px)  { .cardSection { padding: 5rem 4rem; } }
@media (min-width: 1024px) { .cardSection { padding: 5rem 7rem; } }

.cardSectionHeader { margin-bottom: 2.5rem; }

.cardList { display: flex; flex-direction: column; gap: 0.5rem; }

.card {
  border: 1px solid var(--border);
  overflow: hidden;
  transition: opacity 0.7s ease, transform 0.7s ease !important;
}
.cardVisible { opacity: 1; transform: translateY(0); }
.cardHidden  { opacity: 0; transform: translateY(2rem); }

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border);
  background: transparent;
  transition: background 0.3s ease !important;
}
.cardHeaderHover { background: var(--card-bg); }

.cardHeaderLeft  { display: flex; align-items: center; gap: 1.25rem; }
.cardHeaderRight { display: flex; align-items: center; gap: 0.75rem; }

.cardIcon { font-size: 1.5rem; display: flex; align-items: center; }
.cardImg  { width: 2rem; height: 2rem; object-fit: contain; }

.cardTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--fg);
}

.cardArrow {
  color: var(--fg-soft);
  font-size: 1.1rem;
  transition: color 0.3s ease, transform 0.3s ease !important;
}
.cardArrowActive { color: var(--fg); transform: translateX(4px); }

.cardBadge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border: 1px solid var(--border);
  color: var(--fg-soft);
  padding: 0.15rem 0.6rem;
  white-space: nowrap;
  transition: border-color 0.3s ease, color 0.3s ease !important;
}
.cardBadgeActive { border-color: var(--fg-muted); color: var(--fg-muted); }

.cardBody { padding: 1.25rem 2rem; }
.cardBodyFlex {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (min-width: 768px) { .cardBodyFlex { flex-direction: row; align-items: flex-start; } }

.cardText { color: var(--fg-muted); font-size: 0.9rem; line-height: 1.75; }
.flex1 { flex: 1; }

.featuresWrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
@media (min-width: 768px) { .featuresWrap { width: 16rem; flex-shrink: 0; } }

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

.cardLine {
  height: 1px;
  width: 0;
  background: var(--fg);
  transition: width 0.5s ease !important;
}
.cardLineActive { width: 100%; }

/* ─── Why It Matters ─────────────────────────────────────── */
.whySection {
  max-width: 80rem;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}
@media (min-width: 768px)  { .whySection { padding: 6rem 4rem; } }
@media (min-width: 1024px) { .whySection { padding: 6rem 7rem; } }

.whyBox {
  border: 1px solid var(--border);
  padding: 2.5rem;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
  margin-top: 1.5rem;
}
@media (min-width: 768px) { .whyBox { padding: 3.5rem; } }

.whyGridBg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid-c) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.whyInner { position: relative; z-index: 2; }

.whyTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--fg);
  line-height: 1.05;
  margin-bottom: 2rem;
  text-transform: uppercase;
}
.whyTitleGhost { color: var(--fg-soft); }

.whyText {
  color: var(--fg-muted);
  font-size: 1.0625rem;
  line-height: 1.75;
  max-width: 42rem;
}
</style>
