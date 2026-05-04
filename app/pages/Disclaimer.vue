<template>
  <div :class="$style.page">

    <!-- Fixed side index nav -->
    <nav :class="$style.sideNav">
      <button
        v-for="section in sections"
        :key="section.id"
        @click="scrollTo(section.id)"
        :class="$style.navBtn"
      >
        <span :class="[$style.navDot, activeSection === section.id ? $style.navDotActive : '']" />
        <span :class="[$style.navLabel, activeSection === section.id ? $style.navLabelActive : '']">{{ section.label }}</span>
      </button>
    </nav>

    <!-- Hero Header -->
    <header :class="$style.hero">
      <div :class="$style.gridBg" />
      <div :class="$style.glareOrb" />
      <div :class="$style.heroInner">
        <p :class="$style.eyebrow">MizoMade · Legal</p>
        <h1 :class="$style.h1">
          Dis<span :class="$style.h1Ghost">claimer</span>
        </h1>
        <div :class="$style.metaRow">
          <span :class="$style.metaItem"><span :class="$style.metaDot"/>mizomade.com</span>
          <span :class="$style.metaItem"><span :class="$style.metaDot"/>MizoMade, Aizawl · Mizoram, India</span>
        </div>
      </div>
    </header>

    <!-- Intro -->
    <section :class="$style.intro">
      <p :class="$style.introText">
        The information contained on this website is for general information purposes only. Any reliance you place on such information is strictly at your own risk.
      </p>
    </section>

    <!-- Main Content -->
    <main :class="$style.main">

      <!-- General Information -->
      <div :id="'general'" :class="$style.sectionBlock">
        <button @click="toggle('general')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">01</span>
            <h2 :class="$style.sectionTitle">General Information</h2>
          </div>
          <span :class="[$style.sectionToggle, open['general'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['general']" :class="[$style.sectionBody, $style.spaceY4]">
          <p :class="$style.bodyText">MizoMade endeavours to keep the information on this website up to date and correct. However, we make no representations or warranties of any kind — express or implied — about the completeness, accuracy, reliability, suitability, or availability of the website or its contents for any purpose.</p>
          <div :class="$style.warrantyGrid">
            <div v-for="item in warrantyItems" :key="item" :class="$style.warrantyCard">
              <span :class="$style.warrantyDash">—</span>{{ item }}
            </div>
          </div>
          <p :class="$style.bodyTextFaint">No warranty is made regarding any of the above. Any reliance you place on such information is therefore strictly at your own risk.</p>
        </div>
      </div>

      <!-- Liability -->
      <div :id="'liability'" :class="$style.sectionBlock">
        <button @click="toggle('liability')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">02</span>
            <h2 :class="$style.sectionTitle">Limitation of Liability</h2>
          </div>
          <span :class="[$style.sectionToggle, open['liability'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['liability']" :class="[$style.sectionBody, $style.spaceY4]">
          <div :class="$style.warningBox">
            <p :class="$style.warningText">In no event will MizoMade be liable for any loss or damage — including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever — arising from loss of data or profits in connection with the use of this website.</p>
          </div>
          <div :class="$style.useList">
            <div v-for="(item, i) in liabilityItems" :key="i" :class="$style.useItem">
              <span :class="$style.useNum">{{ String(i+1).padStart(2,'0') }}</span>
              <p :class="$style.bodyText">{{ item }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- External Links -->
      <div :id="'links'" :class="$style.sectionBlock">
        <button @click="toggle('links')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">03</span>
            <h2 :class="$style.sectionTitle">External Links</h2>
          </div>
          <span :class="[$style.sectionToggle, open['links'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['links']" :class="[$style.sectionBody, $style.spaceY4]">
          <p :class="$style.bodyText">Through this website you may be able to link to other websites which are not under the control of MizoMade. We have no control over the nature, content, or availability of those sites.</p>
          <div :class="$style.defsGrid">
            <div v-for="note in linkNotes" :key="note.title" :class="$style.defCard">
              <p :class="$style.defTerm">{{ note.title }}</p>
              <p :class="$style.defDesc">{{ note.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div :id="'availability'" :class="$style.sectionBlock">
        <button @click="toggle('availability')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">04</span>
            <h2 :class="$style.sectionTitle">Website Availability</h2>
          </div>
          <span :class="[$style.sectionToggle, open['availability'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['availability']" :class="$style.sectionBody">
          <p :class="$style.bodyText">Every effort is made to keep mizomade.com up and running smoothly. However, MizoMade takes no responsibility for — and will not be liable for — the website being temporarily unavailable due to technical issues beyond our control.</p>
        </div>
      </div>

    </main>

  </div>
  <AppFooter/>
  <ButtomFooter/>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'

const scrollProgress = ref(0)


const open = reactive({
  general: true,
  liability: false,
  links: false,
  availability: false,
})

function toggle(id) {
  open[id] = !open[id]
}



function onScroll() {
  const doc = document.documentElement
  const scrollTop = doc.scrollTop || document.body.scrollTop
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0

  const sectionEls = sections.map(s => ({ id: s.id, el: document.getElementById(s.id) }))
  for (let i = sectionEls.length - 1; i >= 0; i--) {
    const { id, el } = sectionEls[i]
    if (el && el.getBoundingClientRect().top <= 120) {
      activeSection.value = id
      break
    }
  }
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const warrantyItems = [
  'Completeness of information',
  'Accuracy of content',
  'Reliability of data',
  'Suitability for purpose',
  'Availability of the website',
  'Related graphics & media',
]

const liabilityItems = [
  'We are not liable for any direct loss or damage arising from use of this website.',
  'We are not liable for indirect or consequential loss or damage of any kind.',
  'We are not liable for any loss of data or profits connected to the use of this website.',
]

const linkNotes = [
  {
    title: 'No Control',
    desc: 'We have no control over the nature, content, or availability of external sites linked from this website.',
  },
  {
    title: 'No Endorsement',
    desc: 'The inclusion of any link does not imply a recommendation or endorsement of the views expressed within.',
  },
]
</script>

<style module>
/* ─── CSS tokens — mirrors About page exactly ───────────── */
:global(:root) {
  --bg:       #ffffff;
  --bg-alt:   #eceae6;
  --fg:       #0a0a0a; 
  --fg-muted: #555551;
  --fg-soft:  rgba(10,10,10,0.50);
  --border:   rgba(10,10,10,0.14);
  --card-bg:  #ffffff;
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
  --card-bg: #ffffff;
  min-height: 100vh;
  font-family: 'Roboto Mono', 'JetBrains Mono', 'Consolas', monospace;
  overflow-x: hidden;
}
:global(html.dark) .page { --card-bg: rgba(255,255,255,0.06); }

/* ─── Side nav ───────────────────────────────────────────── */
.sideNav {
  position: fixed;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 40;
  display: none;
  flex-direction: column;
  gap: 0.75rem;
}
@media (min-width: 1280px) { .sideNav { display: flex; } }

.navBtn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.navDot {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.navDotActive { background: var(--fg); border-color: var(--fg); transform: scale(1.25); }
.navBtn:hover .navDot { background: var(--fg-soft); }

.navLabel {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: transparent;
  white-space: nowrap;
  transition: all 0.3s ease;
}
.navLabelActive { color: var(--fg-muted); }
.navBtn:hover .navLabel { color: var(--fg-muted); }

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
  bottom: 0;
  right: 0;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--fg-soft), transparent 70%);
  opacity: 0.05;
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

.metaRow { display: flex; flex-wrap: wrap; gap: 1.5rem; color: var(--fg-muted); font-size: 0.875rem; }
.metaItem { display: flex; align-items: center; gap: 0.5rem; }
.metaDot  { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--fg-muted); flex-shrink: 0; }

/* ─── Intro ──────────────────────────────────────────────── */
.intro {
  padding: 5rem 1.5rem;
  border-bottom: 1px solid var(--border);
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
}
@media (min-width: 768px)  { .intro { padding: 5rem 4rem; } }
@media (min-width: 1024px) { .intro { padding: 5rem 7rem; } }

.introText { color: var(--fg-muted); font-size: 1.125rem; line-height: 1.75; max-width: 48rem; }

/* ─── Main ───────────────────────────────────────────────── */
.main {
  padding: 2.5rem 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
@media (min-width: 768px)  { .main { padding: 2.5rem 4rem; } }
@media (min-width: 1024px) { .main { padding: 2.5rem 7rem; } }

/* ─── Accordion blocks ───────────────────────────────────── */
.sectionBlock { border: 1px solid var(--border); overflow: hidden; }

.sectionBtn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--fg);
}
.sectionBtn:hover { background: var(--card-bg); }

.sectionBtnLeft { display: flex; align-items: center; gap: 1rem; }

.sectionNum {
  color: var(--fg-soft);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  font-family: 'Roboto Mono', monospace;
}

.sectionTitle {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--fg);
}

.sectionToggle {
  color: var(--fg-muted);
  font-size: 1.25rem;
  transition: transform 0.3s ease, color 0.4s ease;
  line-height: 1;
}
.sectionToggleOpen { transform: rotate(45deg); }

.sectionBody { padding: 0.5rem 2rem 2rem; border-top: 1px solid var(--border); }

/* ─── Spacing helpers ────────────────────────────────────── */
.spaceY4 > * + * { margin-top: 1rem; }

/* ─── Body text ──────────────────────────────────────────── */
.bodyText      { color: var(--fg-muted); font-size: 0.9375rem; line-height: 1.75; }
.bodyTextFaint { color: var(--fg-soft);  font-size: 0.9375rem; line-height: 1.75; }

/* ─── Warranty grid ──────────────────────────────────────── */
.warrantyGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 768px) { .warrantyGrid { grid-template-columns: 1fr 1fr; } }

.warrantyCard {
  border: 1px solid var(--border);
  padding: 0.75rem 1rem;
  color: var(--fg-muted);
  font-size: 0.875rem;
  cursor: default;
  transition: border-color 0.3s ease, color 0.3s ease;
}
.warrantyCard:hover { border-color: var(--fg-muted); color: var(--fg); }
.warrantyDash { color: var(--fg-soft); margin-right: 0.5rem; }

/* ─── Warning box ────────────────────────────────────────── */
.warningBox {
  border: 1px solid var(--border);
  padding: 1.25rem;
  background: var(--card-bg);
}
.warningText { color: var(--fg-muted); font-size: 0.9375rem; line-height: 1.75; }

/* ─── Liability list ─────────────────────────────────────── */
.useList { display: flex; flex-direction: column; }
.useItem {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease;
}
.useItem:last-child { border-bottom: none; }
.useItem:hover { background: var(--card-bg); }
.useNum {
  color: var(--fg-soft);
  font-size: 0.75rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
  font-family: 'Roboto Mono', monospace;
}

/* ─── Link notes grid ────────────────────────────────────── */
.defsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 768px) { .defsGrid { grid-template-columns: 1fr 1fr; } }

.defCard {
  border: 1px solid var(--border);
  padding: 1rem;
  background: var(--card-bg);
  transition: border-color 0.3s ease;
}
.defCard:hover { border-color: var(--fg-muted); }
.defTerm { color: var(--fg); font-weight: 700; font-size: 0.875rem; margin-bottom: 0.25rem; }
.defDesc { color: var(--fg-muted); font-size: 0.875rem; line-height: 1.6; }
</style>
