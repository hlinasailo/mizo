<template>
  <div class="bg-black min-h-screen text-white font-mono overflow-x-hidden">

    <!-- Fixed side index nav -->
    <nav class="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
      <button
        v-for="section in sections"
        :key="section.id"
        @click="scrollTo(section.id)"
        class="group flex items-center gap-2 text-left"
      >
        <span
          class="block w-2 h-2 rounded-full border border-white/40 transition-all duration-300"
          :class="activeSection === section.id ? 'bg-white scale-125 border-white' : 'bg-transparent group-hover:bg-white/40'"
        />
        <span
          class="text-[10px] uppercase tracking-widest text-white/0 group-hover:text-white/60 transition-all duration-300 whitespace-nowrap"
          :class="activeSection === section.id ? 'text-white/60' : ''"
        >{{ section.label }}</span>
      </button>
    </nav>

    <!-- Hero Header -->
    <header class="relative min-h-[60vh] flex flex-col justify-end px-6 md:px-16 lg:px-28 pt-24 pb-16 border-b border-white/10">
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 60px 60px;"
      />
      <div class="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
        style="background: radial-gradient(circle, white, transparent 70%);"
      />
      <div class="relative z-10 max-w-5xl">
        <p class="text-white/30 text-xs tracking-[0.4em] uppercase mb-6">MizoMade · Legal</p>
        <h1 class="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter text-white mb-6">
          Terms &amp;<br/>
          <span class="text-white/20">Conditions</span>
        </h1>
        <div class="flex flex-wrap gap-6 text-white/40 text-sm">
          <span class="flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-white/40"/>
            mizomade.com
          </span>
          <span class="flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-white/40"/>
            MizoMade, Aizawl · Mizoram, India
          </span>
        </div>
      </div>
    </header>

    <!-- Intro -->
    <section class="px-6 md:px-16 lg:px-28 py-20 border-b border-white/10 max-w-5xl mx-auto w-full">
      <p class="text-white/60 text-lg md:text-xl leading-relaxed max-w-3xl">
        By accessing mizomade.com, you accept these terms and conditions in full. Do not continue to use this website if you do not agree with all of the terms stated on this page.
      </p>
    </section>

    <!-- Main Content -->
    <main class="px-6 md:px-16 lg:px-28 py-10 max-w-5xl mx-auto w-full space-y-2">

      <!-- Cookies -->
      <div :id="'cookies'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('cookies')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">01</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Cookies</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['cookies'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['cookies']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <p class="text-white/50 leading-relaxed text-sm">By accessing mizomade.com, you agree to the use of cookies in accordance with MizoMade's Privacy Policy. We employ cookies to enable the functionality of certain areas and to retrieve user details for each visit. Some affiliate or advertising partners may also use cookies.</p>
        </div>
      </div>

      <!-- License -->
      <div :id="'license'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('license')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">02</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">License</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['license'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['license']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-6">
          <p class="text-white/50 leading-relaxed text-sm">Unless otherwise stated, MizoMade and/or its licensors own the intellectual property rights for all material on mizomade.com. All intellectual property rights are reserved. You may access content for personal use only, subject to the restrictions below.</p>
          <div>
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-4">You must not</h3>
            <div class="space-y-2">
              <div v-for="(restriction, i) in licenseRestrictions" :key="i"
                class="flex items-start gap-4 py-3 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-sm transition-colors"
              >
                <span class="text-white/20 text-xs mt-1 font-mono shrink-0">{{ String(i+1).padStart(2,'0') }}</span>
                <p class="text-white/55 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{{ restriction }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div :id="'comments'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('comments')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">03</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Comments</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['comments'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['comments']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-6">
          <p class="text-white/50 leading-relaxed text-sm">MizoMade does not filter, edit, or review Comments prior to their appearance on the website. Comments reflect the views of the person who posts them — not MizoMade. We reserve the right to monitor and remove any Comments considered inappropriate, offensive, or in breach of these Terms.</p>
          <div>
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-4">By posting, you warrant that</h3>
            <div class="space-y-2">
              <div v-for="(warrant, i) in commentWarrants" :key="i"
                class="flex items-start gap-4 py-3 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-sm transition-colors"
              >
                <span class="text-white/20 text-xs mt-1 font-mono shrink-0">{{ String(i+1).padStart(2,'0') }}</span>
                <p class="text-white/55 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{{ warrant }}</p>
              </div>
            </div>
          </div>
          <div class="border border-white/10 rounded-sm p-5 bg-white/[0.02]">
            <p class="text-white/50 text-sm leading-relaxed">By submitting a comment, you grant MizoMade a non-exclusive license to use, reproduce, edit and authorize others to use and edit your comment in any form or media.</p>
          </div>
        </div>
      </div>

      <!-- Hyperlinking -->
      <div :id="'linking'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('linking')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">04</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Hyperlinking</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['linking'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['linking']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-6">
          <div>
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-4">Approved without prior permission</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="org in approvedOrgs" :key="org"
                class="border border-white/20 text-white/60 text-sm px-4 py-2 rounded-sm hover:border-white hover:text-white transition-all duration-200 cursor-default"
              >{{ org }}</span>
            </div>
          </div>
          <p class="text-white/50 text-sm leading-relaxed">Links must not be deceptive, must not falsely imply sponsorship or endorsement, and must fit within the context of the linking party's site. No use of MizoMade's logo or artwork is allowed without a trademark license agreement.</p>
          <div class="border border-white/10 rounded-sm p-5 bg-white/[0.02]">
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-2">Want to link to us?</h3>
            <p class="text-white/50 text-sm leading-relaxed">Send an email to MizoMade with your name, organization, contact info, your site URL, and the URLs you wish to link to/from. Allow 2–3 weeks for a response.</p>
          </div>
        </div>
      </div>

      <!-- iFrames & Content Liability -->
      <div :id="'iframes'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('iframes')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">05</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">iFrames & Content Liability</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['iframes'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['iframes']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-4">
          <div class="border border-white/10 rounded-sm p-5 bg-white/[0.02]">
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-2">iFrames</h3>
            <p class="text-white/50 text-sm leading-relaxed">Without prior written permission, you may not create frames around our web pages that alter the visual presentation or appearance of the site in any way.</p>
          </div>
          <div class="border border-white/10 rounded-sm p-5 bg-white/[0.02]">
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-2">Content Liability</h3>
            <p class="text-white/50 text-sm leading-relaxed">We are not responsible for any content that appears on your website. You agree to protect and defend us against all claims arising from your website. No links to our site should appear in any context that is libelous, obscene, criminal, or that violates third-party rights.</p>
          </div>
        </div>
      </div>

      <!-- Reservation of Rights -->
      <div :id="'rights'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('rights')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">06</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Reservation of Rights</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['rights'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['rights']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <p class="text-white/50 leading-relaxed text-sm">We reserve the right to request removal of any or all links to our website at any time. We also reserve the right to amend these terms and conditions and our linking policy at any time. By continuing to link to our website, you agree to be bound by these terms.</p>
        </div>
      </div>

      <!-- Disclaimer -->
      <div :id="'disclaimer'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('disclaimer')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">07</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Disclaimer</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['disclaimer'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['disclaimer']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-5">
          <p class="text-white/50 leading-relaxed text-sm">To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and its use. The following limitations do not apply to liability for death or personal injury, fraud, or any liability that cannot be excluded by law.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="item in disclaimerItems" :key="item.title"
              class="border border-white/10 rounded-sm p-4 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-200 group"
            >
              <p class="text-white font-bold text-sm mb-1">{{ item.title }}</p>
              <p class="text-white/40 text-sm leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
          <div class="border border-white/20 rounded-sm p-5 bg-white/[0.02]">
            <p class="text-white/70 text-sm leading-relaxed">As long as the website and its services are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
          </div>
        </div>
      </div>

    </main>

    <!-- Contact Footer -->
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
  { title: 'No Warranties', desc: 'We exclude all representations, warranties and conditions relating to this website to the maximum extent permitted by law.' },
  { title: 'No Accuracy Guarantee', desc: 'We do not warrant the completeness or accuracy of information on this website, nor promise it will remain available or up to date.' },
  { title: 'Liability Limits', desc: 'All liabilities arising in contract, tort, or breach of statutory duty are governed by the limitations set in this disclaimer.' },
  { title: 'What Cannot Be Excluded', desc: 'Nothing here limits liability for death, personal injury, fraud, or any other liability that cannot be excluded under applicable law.' },
]
</script>
