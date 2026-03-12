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
          Terms &amp;<br/>
          <span :class="$style.h1Ghost">Conditions</span>
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
        By accessing mizomade.com, you accept these terms and conditions in full. Do not continue to use this website if you do not agree with all of the terms stated on this page.
      </p>
    </section>

    <!-- Main Content -->
    <main :class="$style.main">

      <!-- Cookies -->
      <div :id="'cookies'" :class="$style.sectionBlock">
        <button @click="toggle('cookies')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">01</span>
            <h2 :class="$style.sectionTitle">Cookies</h2>
          </div>
          <span :class="[$style.sectionToggle, open['cookies'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['cookies']" :class="$style.sectionBody">
          <p :class="$style.bodyText">By accessing mizomade.com, you agree to the use of cookies in accordance with MizoMade's Privacy Policy. We employ cookies to enable the functionality of certain areas and to retrieve user details for each visit. Some affiliate or advertising partners may also use cookies.</p>
        </div>
      </div>

      <!-- License -->
      <div :id="'license'" :class="$style.sectionBlock">
        <button @click="toggle('license')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">02</span>
            <h2 :class="$style.sectionTitle">License</h2>
          </div>
          <span :class="[$style.sectionToggle, open['license'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['license']" :class="[$style.sectionBody, $style.spaceY6]">
          <p :class="$style.bodyText">Unless otherwise stated, MizoMade and/or its licensors own the intellectual property rights for all material on mizomade.com. All intellectual property rights are reserved. You may access content for personal use only, subject to the restrictions below.</p>
          <div>
            <h3 :class="$style.subHeading">You must not</h3>
            <div :class="$style.useList">
              <div v-for="(restriction, i) in licenseRestrictions" :key="i" :class="$style.useItem">
                <span :class="$style.useNum">{{ String(i+1).padStart(2,'00') }}</span>
                <p :class="$style.bodyText">{{ restriction }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div :id="'comments'" :class="$style.sectionBlock">
        <button @click="toggle('comments')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">03</span>
            <h2 :class="$style.sectionTitle">Comments</h2>
          </div>
          <span :class="[$style.sectionToggle, open['comments'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['comments']" :class="[$style.sectionBody, $style.spaceY6]">
          <p :class="$style.bodyText">MizoMade does not filter, edit, or review Comments prior to their appearance on the website. Comments reflect the views of the person who posts them — not MizoMade. We reserve the right to monitor and remove any Comments considered inappropriate, offensive, or in breach of these Terms.</p>
          <div>
            <h3 :class="$style.subHeading">By posting, you warrant that</h3>
            <div :class="$style.useList">
              <div v-for="(warrant, i) in commentWarrants" :key="i" :class="$style.useItem">
                <span :class="$style.useNum">{{ String(i+1).padStart(2,'0') }}</span>
                <p :class="$style.bodyText">{{ warrant }}</p>
              </div>
            </div>
          </div>
          <div :class="$style.infoBox">
            <p :class="$style.bodyText">By submitting a comment, you grant MizoMade a non-exclusive license to use, reproduce, edit and authorize others to use and edit your comment in any form or media.</p>
          </div>
        </div>
      </div>

      <!-- Hyperlinking -->
      <div :id="'linking'" :class="$style.sectionBlock">
        <button @click="toggle('linking')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">04</span>
            <h2 :class="$style.sectionTitle">Hyperlinking</h2>
          </div>
          <span :class="[$style.sectionToggle, open['linking'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['linking']" :class="[$style.sectionBody, $style.spaceY6]">
          <div>
            <h3 :class="$style.subHeading">Approved without prior permission</h3>
            <div :class="$style.tagWrap">
              <span v-for="org in approvedOrgs" :key="org" :class="$style.tag">{{ org }}</span>
            </div>
          </div>
          <p :class="$style.bodyText">Links must not be deceptive, must not falsely imply sponsorship or endorsement, and must fit within the context of the linking party's site. No use of MizoMade's logo or artwork is allowed without a trademark license agreement.</p>
          <div :class="$style.infoBox">
            <h3 :class="[$style.subHeading, $style.mb2]">Want to link to us?</h3>
            <p :class="$style.bodyText">Send an email to MizoMade with your name, organization, contact info, your site URL, and the URLs you wish to link to/from. Allow 2–3 weeks for a response.</p>
          </div>
        </div>
      </div>

      <!-- iFrames & Content Liability -->
      <div :id="'iframes'" :class="$style.sectionBlock">
        <button @click="toggle('iframes')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">05</span>
            <h2 :class="$style.sectionTitle">iFrames &amp; Content Liability</h2>
          </div>
          <span :class="[$style.sectionToggle, open['iframes'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['iframes']" :class="[$style.sectionBody, $style.spaceY4]">
          <div :class="$style.infoBox">
            <h3 :class="[$style.subHeading, $style.mb2]">iFrames</h3>
            <p :class="$style.bodyText">Without prior written permission, you may not create frames around our web pages that alter the visual presentation or appearance of the site in any way.</p>
          </div>
          <div :class="$style.infoBox">
            <h3 :class="[$style.subHeading, $style.mb2]">Content Liability</h3>
            <p :class="$style.bodyText">We are not responsible for any content that appears on your website. You agree to protect and defend us against all claims arising from your website. No links to our site should appear in any context that is libelous, obscene, criminal, or that violates third-party rights.</p>
          </div>
        </div>
      </div>

      <!-- Reservation of Rights -->
      <div :id="'rights'" :class="$style.sectionBlock">
        <button @click="toggle('rights')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">06</span>
            <h2 :class="$style.sectionTitle">Reservation of Rights</h2>
          </div>
          <span :class="[$style.sectionToggle, open['rights'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['rights']" :class="$style.sectionBody">
          <p :class="$style.bodyText">We reserve the right to request removal of any or all links to our website at any time. We also reserve the right to amend these terms and conditions and our linking policy at any time. By continuing to link to our website, you agree to be bound by these terms.</p>
        </div>
      </div>

      <!-- Disclaimer -->
      <div :id="'disclaimer'" :class="$style.sectionBlock">
        <button @click="toggle('disclaimer')" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnLeft">
            <span :class="$style.sectionNum">07</span>
            <h2 :class="$style.sectionTitle">Disclaimer</h2>
          </div>
          <span :class="[$style.sectionToggle, open['disclaimer'] ? $style.sectionToggleOpen : '']">+</span>
        </button>
        <div v-show="open['disclaimer']" :class="[$style.sectionBody, $style.spaceY5]">
          <p :class="$style.bodyText">To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and its use. The following limitations do not apply to liability for death or personal injury, fraud, or any liability that cannot be excluded by law.</p>
          <div :class="$style.defsGrid">
            <div v-for="item in disclaimerItems" :key="item.title" :class="$style.defCard">
              <p :class="$style.defTerm">{{ item.title }}</p>
              <p :class="$style.defDesc">{{ item.desc }}</p>
            </div>
          </div>
          <div :class="$style.warningBox">
            <p :class="$style.warningText">As long as the website and its services are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
          </div>
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
  cookies: true,
  license: false,
  comments: false,
  linking: false,
  iframes: false,
  rights: false,
  disclaimer: false,
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

const licenseRestrictions = [
  'Republish material from mizomade.com',
  'Sell, rent or sub-license material from mizomade.com',
  'Reproduce, duplicate or copy material from mizomade.com',
  'Redistribute content from mizomade.com',
]

const commentWarrants = [
  'You are entitled to post the comment and have all necessary licenses and consents to do so.',
  'The comment does not infringe any intellectual property right, including copyright, patent or trademark of any third party.',
  'The comment does not contain defamatory, libelous, offensive, indecent or otherwise unlawful material.',
  'The comment will not be used to solicit or promote business or any unlawful activity.',
]

const approvedOrgs = [
  'Government agencies', 'Search engines', 'News organizations',
  'Online directory distributors', 'Accredited businesses',
]

const disclaimerItems = [
  { title: 'No Warranties',        desc: 'We exclude all representations, warranties and conditions relating to this website to the maximum extent permitted by law.' },
  { title: 'No Accuracy Guarantee',desc: 'We do not warrant the completeness or accuracy of information on this website, nor promise it will remain available or up to date.' },
  { title: 'Liability Limits',     desc: 'All liabilities arising in contract, tort, or breach of statutory duty are governed by the limitations set in this disclaimer.' },
  { title: 'What Cannot Be Excluded', desc: 'Nothing here limits liability for death, personal injury, fraud, or any other liability that cannot be excluded under applicable law.' },
]
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
  top: 0;
  left: 0;
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
.spaceY5 > * + * { margin-top: 1.25rem; }
.spaceY6 > * + * { margin-top: 1.5rem; }
.mb2 { margin-bottom: 0.5rem; }

/* ─── Body text ──────────────────────────────────────────── */
.bodyText { color: var(--fg-muted); font-size: 0.9375rem; line-height: 1.75; }

/* ─── Sub-heading ────────────────────────────────────────── */
.subHeading {
  color: var(--fg-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}

/* ─── Use / numbered list ────────────────────────────────── */
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

/* ─── Info box ───────────────────────────────────────────── */
.infoBox {
  border: 1px solid var(--border);
  padding: 1.25rem;
  background: var(--card-bg);
}

/* ─── Warning box ────────────────────────────────────────── */
.warningBox {
  border: 1px solid var(--border);
  padding: 1.25rem;
  background: var(--card-bg);
}
.warningText { color: var(--fg-muted); font-size: 0.9375rem; line-height: 1.75; }

/* ─── Defs grid ──────────────────────────────────────────── */
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
