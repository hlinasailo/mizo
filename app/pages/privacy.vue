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
        <span
          :class="[$style.navDot, activeSection === section.id ? $style.navDotActive : '']"
        />
        <span
          :class="[$style.navLabel, activeSection === section.id ? $style.navLabelActive : '']"
        >{{ section.label }}</span>
      </button>
    </nav>

    <!-- Hero Header -->
    <header :class="$style.hero">
      <!-- Grid background -->
      <div :class="$style.gridBg" />
      <!-- Glare orb -->
      <div :class="$style.glareOrb" />

      <div :class="$style.heroInner">
        <p :class="$style.eyebrow">MizoMade · Legal</p>
        <h1 :class="$style.h1">
          Privacy<br/>
          <span :class="$style.h1Ghost">Policy</span>
        </h1>
        <div :class="$style.metaRow">
          <span :class="$style.metaItem">
            <span :class="$style.metaDot"/>
            Last updated: June 28, 2022
          </span>
          <span :class="$style.metaItem">
            <span :class="$style.metaDot"/>
            MizoMade, Aizawl · Mizoram, India
          </span>
        </div>
      </div>
    </header>

    <!-- Intro -->
    <section :class="$style.intro">
      <p :class="$style.introText">
        This Privacy Policy describes our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
      </p>
    </section>

    <!-- Main Content -->
    <main :class="$style.main">

      <!-- Definitions -->
      <div :id="'definitions'" :class="$style.sectionBlock">
        <button @click="toggle('definitions')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">01</span>
            <h2 :class="$style.sectionTitle">Interpretation & Definitions</h2>
          </div>
          <span :class="[$style.sectionToggle, open['definitions'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['definitions']" :class="$style.sectionBody">
          <p :class="[$style.bodyText, $style.mb6]">The words of which the initial letter is capitalized have meanings defined under the following conditions.</p>
          <div :class="$style.defsGrid">
            <div v-for="def in definitions" :key="def.term" :class="$style.defCard">
              <p :class="$style.defTerm">{{ def.term }}</p>
              <p :class="$style.defDesc">{{ def.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data We Collect -->
      <div :id="'data'" :class="$style.sectionBlock">
        <button @click="toggle('data')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">02</span>
            <h2 :class="$style.sectionTitle">Data We Collect</h2>
          </div>
          <span :class="[$style.sectionToggle, open['data'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['data']" :class="[$style.sectionBody, $style.spaceY8]">
          <div>
            <h3 :class="$style.subHeading">Personal Data</h3>
            <div :class="$style.tagWrap">
              <span v-for="item in personalData" :key="item" :class="$style.tag">{{ item }}</span>
            </div>
          </div>
          <div>
            <h3 :class="$style.subHeading">Usage Data (Automatic)</h3>
            <p :class="$style.bodyText">Usage Data is collected automatically and may include information such as Your Device's IP address, browser type & version, pages visited, time and date of visit, time spent on pages, unique device identifiers and diagnostic data — including mobile-specific data when you access via a mobile device.</p>
          </div>
        </div>
      </div>

      <!-- Tracking & Cookies -->
      <div :id="'cookies'" :class="$style.sectionBlock">
        <button @click="toggle('cookies')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">03</span>
            <h2 :class="$style.sectionTitle">Tracking & Cookies</h2>
          </div>
          <span :class="[$style.sectionToggle, open['cookies'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['cookies']" :class="[$style.sectionBody, $style.spaceY4]">
          <div v-for="cookie in cookies" :key="cookie.type" :class="$style.cookieCard">
            <div :class="$style.cookieHeader">
              <h3 :class="$style.cookieName">{{ cookie.type }}</h3>
              <span :class="$style.cookieBadge">{{ cookie.kind }}</span>
            </div>
            <p :class="$style.bodyText">{{ cookie.purpose }}</p>
          </div>
        </div>
      </div>

      <!-- How We Use Data -->
      <div :id="'use'" :class="$style.sectionBlock">
        <button @click="toggle('use')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">04</span>
            <h2 :class="$style.sectionTitle">How We Use Your Data</h2>
          </div>
          <span :class="[$style.sectionToggle, open['use'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['use']" :class="$style.sectionBody">
          <div :class="$style.useList">
            <div v-for="(use, i) in dataUses" :key="i" :class="$style.useItem">
              <span :class="$style.useNum">{{ String(i+1).padStart(2,'0') }}</span>
              <p :class="$style.bodyText">{{ use }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Sharing -->
      <div :id="'sharing'" :class="$style.sectionBlock">
        <button @click="toggle('sharing')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">05</span>
            <h2 :class="$style.sectionTitle">Data Sharing & Disclosure</h2>
          </div>
          <span :class="[$style.sectionToggle, open['sharing'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['sharing']" :class="[$style.sectionBody, $style.spaceY6]">
          <div>
            <h3 :class="$style.subHeading">We may share data with</h3>
            <div :class="$style.sharingGrid">
              <div v-for="entity in sharingEntities" :key="entity" :class="$style.sharingCard">{{ entity }}</div>
            </div>
          </div>
          <div :class="$style.infoBox">
            <h3 :class="$style.subHeading">Business Transactions</h3>
            <p :class="$style.bodyText">If MizoMade is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
          </div>
          <div :class="$style.infoBox">
            <h3 :class="$style.subHeading">Law Enforcement</h3>
            <p :class="$style.bodyText">Under certain circumstances, we may be required to disclose Your Personal Data if required by law or in response to valid requests by public authorities.</p>
          </div>
        </div>
      </div>

      <!-- Retention, Transfer, Security -->
      <div :id="'security'" :class="$style.sectionBlock">
        <button @click="toggle('security')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">06</span>
            <h2 :class="$style.sectionTitle">Retention, Transfer & Security</h2>
          </div>
          <span :class="[$style.sectionToggle, open['security'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['security']" :class="[$style.sectionBody, $style.spaceY5]">
          <p :class="$style.bodyText">We retain Your Personal Data only for as long as necessary for the purposes set out in this Policy, and to comply with legal obligations. Usage Data is generally retained for a shorter period unless used to strengthen security or improve functionality.</p>
          <p :class="$style.bodyText">Your information may be processed outside Your state, province, or country. By submitting information, You agree to this transfer. We take all reasonably necessary steps to ensure your data is treated securely.</p>
          <div :class="$style.warningBox">
            <p :class="$style.warningText">⚠ No method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect Your data, we cannot guarantee its absolute security.</p>
          </div>
        </div>
      </div>

      <!-- Children's Privacy -->
      <div :id="'children'" :class="$style.sectionBlock">
        <button @click="toggle('children')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">07</span>
            <h2 :class="$style.sectionTitle">Children's Privacy</h2>
          </div>
          <span :class="[$style.sectionToggle, open['children'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['children']" :class="$style.sectionBody">
          <p :class="$style.bodyText">Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under 13. If you are a parent or guardian and believe your child has provided us Personal Data, please contact us and we will take steps to remove that information from our servers.</p>
        </div>
      </div>

      <!-- Changes -->
      <div :id="'changes'" :class="$style.sectionBlock">
        <button @click="toggle('changes')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">08</span>
            <h2 :class="$style.sectionTitle">Policy Changes</h2>
          </div>
          <span :class="[$style.sectionToggle, open['changes'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['changes']" :class="$style.sectionBody">
          <p :class="$style.bodyText">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and via email and/or a prominent notice on Our Service, prior to the change becoming effective. You are advised to review this Privacy Policy periodically for any changes.</p>
        </div>
      </div>

    </main>

    <AppFooter/>
    <ButtomFooter/>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'

const scrollProgress = ref(0)




const open = reactive({
  definitions: true,
  data: false,
  cookies: false,
  use: false,
  sharing: false,
  security: false,
  children: false,
  changes: false,
})

function toggle(id) {
  open[id] = !open[id]
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

const definitions = [
  { term: 'Account',       desc: 'A unique account created for You to access our Service or parts of our Service.' },
  { term: 'Company',       desc: 'MizoMade, Aizawl (referred to as "We", "Us" or "Our").' },
  { term: 'Cookies',       desc: 'Small files placed on Your device containing browsing history details.' },
  { term: 'Country',       desc: 'Mizoram, India.' },
  { term: 'Device',        desc: 'Any device that can access the Service such as a computer, cellphone or tablet.' },
  { term: 'Personal Data', desc: 'Any information that relates to an identified or identifiable individual.' },
  { term: 'Service',       desc: 'Refers to the Website — MizoMade.com.' },
  { term: 'Service Provider', desc: 'Third-party companies or individuals employed to facilitate the Service.' },
  { term: 'Usage Data',    desc: 'Data collected automatically from the Service infrastructure.' },
  { term: 'You',           desc: 'The individual or legal entity accessing or using the Service.' },
]

const personalData = [
  'Email address', 'First name', 'Last name', 'Phone number',
  'Address', 'State / Province', 'ZIP / Postal code', 'City', 'Usage Data',
]

const cookies = [
  {
    type: 'Necessary / Essential Cookies',
    kind: 'Session',
    purpose: 'Essential to provide You with services and enable features. They help authenticate users and prevent fraudulent use of accounts. Without these, requested services cannot be provided.',
  },
  {
    type: 'Cookies Policy / Notice Acceptance',
    kind: 'Persistent',
    purpose: 'These identify if users have accepted the use of cookies on the Website.',
  },
  {
    type: 'Functionality Cookies',
    kind: 'Persistent',
    purpose: 'Allow us to remember choices You make — such as login details or language preference — providing a more personal experience.',
  },
]

const dataUses = [
  'To provide and maintain our Service, including to monitor its usage.',
  'To manage Your Account and registration as a user of the Service.',
  'For the performance of a contract — including purchase contracts for products or services.',
  'To contact You by email, phone, SMS, or push notifications regarding updates and security.',
  'To provide You with news, special offers, and information about goods and services similar to those you\'ve purchased or enquired about.',
  'To manage Your requests and attend to inquiries directed to Us.',
  'For business transfers — evaluating mergers, restructuring, or asset sales.',
  'For data analysis, identifying usage trends, and improving our Service, products and marketing.',
]

const sharingEntities = [
  'Service Providers', 'Business Partners', 'Affiliates',
  'Other Users (public areas)', 'With Your Consent', 'During Business Transfers',
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
  --card-bg:  #d4d3d3;
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
  text-align: left;
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
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.navDotActive {
  background: var(--fg);
  border-color: var(--fg);
  transform: scale(1.25);
}
.navBtn:hover .navDot { background: var(--fg-soft); }

.navLabel {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
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
  top: 0;
  right: 0;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--fg-soft), transparent 70%);
  opacity: 0.05;
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
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--fg);
  margin-bottom: 1.5rem;
}
.h1Ghost { color: var(--fg-soft); }

.metaRow {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: var(--fg-muted);
  font-size: 0.875rem;
}
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

.introText {
  color: var(--fg-muted);
  font-size: 1.125rem;
  line-height: 1.75;
  max-width: 48rem;
}

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

/* ─── Section accordion block ────────────────────────────── */
.sectionBlock {
  border: 1px solid var(--border);
  overflow: hidden;
}

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

.sectionBody {
  padding: 0.5rem 2rem 2rem;
  border-top: 1px solid var(--border);
}

/* ─── Spacing helpers ────────────────────────────────────── */
.mb6    { margin-bottom: 1.5rem; }
.spaceY4 > * + * { margin-top: 1rem; }
.spaceY5 > * + * { margin-top: 1.25rem; }
.spaceY6 > * + * { margin-top: 1.5rem; }
.spaceY8 > * + * { margin-top: 2rem; }

/* ─── Body text ──────────────────────────────────────────── */
.bodyText {
  color: var(--fg-muted);
  font-size: 0.9375rem;
  line-height: 1.75;
}

/* ─── Definitions grid ───────────────────────────────────── */
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
  transition: border-color 0.3s ease, background 0.4s ease;
}
.defCard:hover { border-color: var(--fg-muted); }

.defTerm { color: var(--fg); font-weight: 700; font-size: 0.875rem; margin-bottom: 0.25rem; }
.defDesc { color: var(--fg-muted); font-size: 0.875rem; line-height: 1.6; }

/* ─── Tags ───────────────────────────────────────────────── */
.tagWrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag {
  border: 1px solid var(--border);
  color: var(--fg-muted);
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  cursor: default;
  transition: border-color 0.3s ease, color 0.3s ease;
}
.tag:hover { border-color: var(--fg); color: var(--fg); }

/* ─── Sub-heading ────────────────────────────────────────── */
.subHeading {
  color: var(--fg-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 0.75rem;
}

/* ─── Cookie cards ───────────────────────────────────────── */
.cookieCard {
  border: 1px solid var(--border);
  padding: 1.25rem;
  background: var(--card-bg);
  transition: border-color 0.3s ease;
}
.cookieCard:hover { border-color: var(--fg-muted); }

.cookieHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.cookieName  { color: var(--fg); font-weight: 600; font-size: 0.9375rem; }
.cookieBadge {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--fg-soft);
  border: 1px solid var(--border);
  padding: 0.125rem 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ─── Use list ───────────────────────────────────────────── */
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

/* ─── Sharing grid ───────────────────────────────────────── */
.sharingGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}
@media (min-width: 640px)  { .sharingGrid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 768px)  { .sharingGrid { grid-template-columns: repeat(3, 1fr); } }

.sharingCard {
  border: 1px solid var(--border);
  color: var(--fg-muted);
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.3s ease, color 0.3s ease;
}
.sharingCard:hover { border-color: var(--fg-muted); color: var(--fg); }

/* ─── Info / Warning boxes ───────────────────────────────── */
.infoBox {
  border: 1px solid var(--border);
  padding: 1.25rem;
  background: var(--card-bg);
}

.warningBox {
  border: 1px solid var(--border);
  padding: 1.25rem;
  background: var(--card-bg);
}
.warningText { color: var(--fg-muted); font-size: 0.9375rem; line-height: 1.75; }
</style>
