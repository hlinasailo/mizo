<template>
  <main>
    <div :class="$style.aboutPage">
      <!-- ── Hero ─────────────────────────────────────────── -->
      <section :class="[$style.section, $style.hero]">
        <div :class="$style.floatingCircles">
          <div :class="[$style.circle, $style.c1]" />
          <div :class="[$style.circle, $style.c2]" />
          <div :class="[$style.circle, $style.c3]" />
        </div>

        <div :class="$style.container">
          <div :class="[$style.heroInner, $style.fadeInUp]" data-animate>
            <h1 :class="$style.h1">About <span :class="$style.muted">MizoMade</span></h1>
            <div :class="$style.divider" />
            <p :class="$style.lead">
              Founded in 2019, MizoMade.com is an online Mizo web community where people can share
              articles and blogs that may enrich the society with new ideas and knowledge.
            </p>
          </div>
        </div>

        <div :class="[$style.scrollArrow, $style.bounce]">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <!-- ── Mission ───────────────────────────────────────── -->
      <section :class="[$style.section, $style.alt]">
        <div :class="$style.container">
          <div :class="$style.missionGrid">
            <div :class="[$style.glassCard, $style.slideLeft]" data-animate>
              <h2 :class="$style.sectionTitle">Our Mission</h2>
              <div :class="[$style.divider, $style.dividerLeft]" />
              <p :class="[$style.lead, $style.mb]">
                The goal is to share one's knowledge and experiences through our web blog community.
                We believe in the power of collective wisdom and community-driven content.
              </p>
              <p :class="$style.lead">
                As only a small portion of the Mizo community is technologically literate and almost
                60% of the Mizo population does not know how to use a website, the resources
                available to the people are very limited, resulting in unequal resource availability.
              </p>
            </div>

            <div :class="$style.slideRight" data-animate>
              <h2 :class="$style.sectionTitle">What We Focus On</h2>
              <div
                v-for="feat in features"
                :key="feat.title"
                :class="$style.featureItem"
              >
                <div :class="$style.iconBox">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" :d="feat.icon" />
                  </svg>
                </div>
                <div>
                  <div :class="$style.featureTitle">{{ feat.title }}</div>
                  <div :class="$style.featureDesc">{{ feat.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Design / Stats ────────────────────────────────── -->
      <section :class="$style.section">
        <div :class="$style.container">
          <div :class="[$style.statsWrap, $style.fadeInUp]" data-animate>
            <div :class="$style.displayStacked">
              <span :class="$style.displayText">Designed For</span>
              <span :class="[$style.displayText, $style.displayGhost]">Everyone</span>
            </div>
            <div :class="$style.divider" />
            <p :class="[$style.lead, $style.centered]">
              Since many online contents are written in languages other than Mizo, the language
              barrier has set a bigger barrier among the people to even learn how to work around it.
            </p>
          </div>

          <div :class="$style.statsGrid">
            <div
              v-for="(stat, i) in stats"
              :key="stat.label"
              :class="$style.statCard"
              :style="{ transitionDelay: `${i * 0.12}s` }"
              data-animate
            >
              <div v-if="stat.num" :class="$style.statNum">{{ stat.num }}</div>
              <svg v-else :class="$style.statIcon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" :d="stat.icon" />
              </svg>
              <div :class="$style.statLabel">{{ stat.label }}</div>
              <div :class="$style.statSub">{{ stat.sub }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Vision ────────────────────────────────────────── -->
      <section :class="[$style.section, $style.alt, $style.visionSection]">
        <div :class="$style.gridPattern" />
        <div :class="$style.container">
          <div :class="$style.visionInner">
            <div :class="$style.fadeInUp" data-animate>
              <div :class="$style.visionTitle">Our Vision</div>
              <div :class="$style.divider" />
              <p :class="[$style.lead, $style.centered]">
                MizoMade.com is designed with a minimalistic and intuitive approach so that even
                non-sophisticated users may know how to utilize the resources. We envision a future
                where every member of the Mizo community has equal access to knowledge and digital
                resources, regardless of their technical literacy.
              </p>
            </div>

            <div :class="[$style.location, $style.slideUp]" data-animate>
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Aizawl, Mizoram 796001</span>
            </div>

            <div :class="[$style.tagline, $style.fadeInUp]" data-animate>
              "Empowering the Mizo community through accessible knowledge sharing"
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer components - only once -->
    <AppFooter />
    <ButtomFooter />
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

// ── Data ──────────────────────────────────────────────────
const features = [
  {
    title: 'Knowledge Sharing',
    desc: 'Empowering the community through shared experiences and insights',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Language Accessibility',
    desc: 'Breaking language barriers with content in Mizo',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  },
  {
    title: 'Community First',
    desc: 'Built by the community, for the community',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
]

const stats = [
  { num: '100%', label: 'Free Access',   sub: 'All resources completely free for everyone' },
  { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Minimalistic', sub: 'Intuitive design for easy navigation' },
  { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Inclusive', sub: 'Accessible to non-sophisticated users' },
]

// ── Scroll animations ─────────────────────────────────────
let observer

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style module>
/* ─── CSS tokens via :global on <html> ─────────────────── */
:global(:root) {
  --bg:       #dcdcdc;
  --bg-alt:   #eceae6;
  --fg:       #0a0a0a;
  --fg-muted: #555551;
  --fg-soft:  rgba(10,10,10,0.50);
  --border:   rgba(10,10,10,0.14);
  --card-bg:  rgba(10, 10, 10, 0.259);
  --grid-c:   rgba(10, 10, 10, 0.107);
}
:global(html.dark) {
  --bg:       #0a0a0a;
  --bg-alt:   #0f0f0f;
  --fg:       #f0ede8;
  --fg-muted: rgba(240,237,232,0.72);
  --fg-soft:  rgba(240,237,232,0.50);
  --border:   rgba(240,237,232,0.18);
  --card-bg:  rgba(255,255,255,0.06);
  --grid-c:   rgba(237, 237, 237, 0.088);
}

/* ─── Smooth theme transitions ──────────────────────────── */
:global(*) {
  transition:
    background-color 0.4s ease,
    border-color     0.4s ease,
    color            0.4s ease,
    box-shadow       0.4s ease;
}

/* ─── Scroll animations ─────────────────────────────────── */
.fadeInUp  { opacity: 0; transform: translateY(32px);  transition: opacity 0.85s ease-out, transform 0.85s ease-out !important; }
.slideLeft { opacity: 0; transform: translateX(-48px); transition: opacity 0.85s ease-out, transform 0.85s ease-out !important; }
.slideRight{ opacity: 0; transform: translateX(48px);  transition: opacity 0.85s ease-out, transform 0.85s ease-out !important; }
.slideUp   { opacity: 0; transform: translateY(40px);  transition: opacity 0.85s ease-out, transform 0.85s ease-out !important; }
.statCard  { opacity: 0; transform: scale(0.88);       transition: opacity 0.7s ease-out, transform 0.7s ease-out, background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease !important; }
:global(.visible) { opacity: 1 !important; transform: none !important; }

/* ─── Layout ─────────────────────────────────────────────── */
.aboutPage { scroll-behavior: smooth; }

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
@media(min-width:768px) { .container { padding: 0 3rem; } }

/* ─── Sections ───────────────────────────────────────────── */
.section {
  background: var(--bg);
  color: var(--fg);
  padding: 6rem 0 7rem;
  border-bottom: 1px solid var(--border);
}
.alt { background: var(--bg-alt); }

/* ─── Hero ───────────────────────────────────────────────── */
.hero {
  position: relative;
  padding: 7rem 0 8rem;
  overflow: hidden;
}
.heroInner { max-width: 52rem; margin: 0 auto; text-align: center; position: relative; z-index: 2; }

.h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3.5rem, 9vw, 6.5rem);
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--fg);
}
.muted { color: var(--fg-muted); }

.lead {
  font-size: 1rem;
  font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace;
  color: var(--fg-muted);
  line-height: 1.625;
  font-weight: 400;
}
.mb   { margin-bottom: 1.25rem; }
.centered { text-align: center; }

.divider { width: 5rem; height: 3px; background: var(--fg); margin: 1.75rem auto; opacity: 0.7; }
.dividerLeft { margin: 1.5rem 0; }

.scrollArrow {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: var(--fg-soft);
}
.scrollArrow svg { width: 1.5rem; height: 1.5rem; }

/* ─── Floating circles ───────────────────────────────────── */
.floatingCircles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.circle {
  position: absolute;
  border-radius: 50%;
  background: var(--card-bg);
  animation: float 22s infinite ease-in-out;
}
.c1 { width: 320px; height: 320px; top: 8%;   left: 8%;   animation-delay: 0s; }
.c2 { width: 210px; height: 210px; top: 58%;  right: 8%;  animation-delay: 6s; }
.c3 { width: 260px; height: 260px; bottom: 8%; left: 48%; animation-delay: 12s; }
@media(max-width:768px) { .circle { width: 150px !important; height: 150px !important; } }

/* ─── Mission ────────────────────────────────────────────── */
.missionGrid { display: grid; gap: 2rem; max-width: 72rem; margin: 0 auto; }
@media(min-width:768px) { .missionGrid { grid-template-columns: 1fr 1fr; align-items: start; } }

.glassCard {
  background: var(--card-bg);
  border: 1px solid var(--border);
  padding: 2.5rem;
}

.sectionTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--fg);
  margin-bottom: 1.5rem;
}

.featureItem {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  margin-bottom: 1rem;
  cursor: default;
}
.featureItem:last-child { margin-bottom: 0; }
.featureItem:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
:global(html.dark) .featureItem:hover { box-shadow: 0 12px 28px rgba(0,0,0,0.45); }

.iconBox {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.iconBox svg { width: 1.25rem; height: 1.25rem; color: var(--fg); }
.featureItem:hover .iconBox { transform: scale(1.1); }

.featureTitle { font-size: 1rem; font-weight: 600; color: var(--fg); margin-bottom: 0.25rem; }
.featureDesc  { font-size: 1rem; font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace; color: var(--fg-muted); line-height: 1.625; font-weight: 400; }

/* ─── Stats ──────────────────────────────────────────────── */
.statsWrap { max-width: 60rem; margin: 0 auto; }

.displayStacked { text-align: center; }
.displayText {
  display: block;
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.95;
  text-transform: uppercase;
  color: var(--fg);
}
.displayGhost { color: var(--fg-soft); }

.statsGrid { display: grid; gap: 1.5rem; margin-top: 3.5rem; max-width: 60rem; margin-left: auto; margin-right: auto; }
@media(min-width:768px) { .statsGrid { grid-template-columns: repeat(3, 1fr); } }

.statCard {
  padding: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  text-align: center;
}
.statCard:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,0.14); }
:global(html.dark) .statCard:hover { box-shadow: 0 16px 40px rgba(0,0,0,0.5); }

.statNum  { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 7vw, 4.5rem); color: var(--fg); margin-bottom: 0.5rem; }
.statIcon { width: 3.5rem; height: 3.5rem; margin: 0 auto 0.5rem; color: var(--fg); }
.statLabel{ font-size: 1rem; font-weight: 600; color: var(--fg); margin-bottom: 0.4rem; }
.statSub  { font-size: 1rem; font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace; color: var(--fg-muted); line-height: 1.625; font-weight: 400; }

/* ─── Vision ─────────────────────────────────────────────── */
.visionSection { position: relative; overflow: hidden; }
.visionInner   { max-width: 52rem; margin: 0 auto; position: relative; z-index: 2; }

.visionTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.95;
  text-transform: uppercase;
  text-align: center;
  color: var(--fg);
  margin-bottom: 1.5rem;
}

.gridPattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--grid-c) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 22s linear infinite;
  pointer-events: none;
}

.location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace;
  color: var(--fg-muted);
  font-size: 1rem;
  line-height: 1.625;
  font-weight: 400;
  margin-top: 3rem;
}
.location svg { width: 1.4rem; height: 1.4rem; color: var(--fg); flex-shrink: 0; }

.tagline {
  text-align: center;
  margin-top: 4rem;
  font-style: italic;
  font-size: 1rem;
  font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.625;
  font-weight: 400;
  color: var(--fg-soft);
}

/* ─── Keyframes ──────────────────────────────────────────── */
@keyframes float {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  33%     { transform: translate(28px,-28px) rotate(120deg); }
  66%     { transform: translate(-28px,28px) rotate(240deg); }
}
@keyframes bounce {
  0%,100% { transform: translateX(-50%) translateY(0); }
  50%     { transform: translateX(-50%) translateY(-8px); }
}
@keyframes gridMove {
  0%   { transform: translate(0,0); }
  100% { transform: translate(50px,50px); }
}
.bounce { animation: bounce 2s infinite; }
</style>