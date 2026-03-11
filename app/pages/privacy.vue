<template>
  <div class="bg-black min-h-screen text-white font-mono overflow-x-hidden">

    <!-- Sticky progress bar -->
   

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
      <!-- Grid background -->
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 60px 60px;"
      />

      <!-- Glare orb -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
        style="background: radial-gradient(circle, white, transparent 70%);"
      />

      <div class="relative z-10 max-w-5xl">
        <p class="text-white/30 text-xs tracking-[0.4em] uppercase mb-6">MizoMade · Legal</p>
        <h1 class="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter text-white mb-6">
          Privacy<br/>
          <span class="text-white/20">Policy</span>
        </h1>
        <div class="flex flex-wrap gap-6 text-white/40 text-sm">
          <span class="flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-white/40"/>
            Last updated: June 28, 2022
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
        This Privacy Policy describes our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
      </p>
    </section>

    <!-- Main Content -->
    <main class="px-6 md:px-16 lg:px-28 py-10 max-w-5xl mx-auto w-full space-y-2">

      <!-- Definitions -->
      <div :id="'definitions'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('definitions')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">01</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Interpretation & Definitions</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['definitions'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['definitions']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <p class="text-white/50 mb-6 leading-relaxed">The words of which the initial letter is capitalized have meanings defined under the following conditions.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="def in definitions" :key="def.term"
              class="border border-white/10 rounded-sm p-4 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-200 group"
            >
              <p class="text-white font-bold text-sm mb-1 group-hover:text-white transition-colors">{{ def.term }}</p>
              <p class="text-white/40 text-sm leading-relaxed">{{ def.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data We Collect -->
      <div :id="'data'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('data')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">02</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Data We Collect</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['data'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['data']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-8">
          <div>
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-4">Personal Data</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="item in personalData" :key="item"
                class="border border-white/20 text-white/60 text-sm px-4 py-2 rounded-sm hover:border-white hover:text-white transition-all duration-200 cursor-default"
              >{{ item }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-4">Usage Data (Automatic)</h3>
            <p class="text-white/50 leading-relaxed">Usage Data is collected automatically and may include information such as Your Device's IP address, browser type & version, pages visited, time and date of visit, time spent on pages, unique device identifiers and diagnostic data — including mobile-specific data when you access via a mobile device.</p>
          </div>
        </div>
      </div>

      <!-- Tracking & Cookies -->
      <div :id="'cookies'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('cookies')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">03</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Tracking & Cookies</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['cookies'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['cookies']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-4">
          <div v-for="cookie in cookies" :key="cookie.type"
            class="border border-white/10 rounded-sm p-5 hover:border-white/25 transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-4 mb-2">
              <h3 class="text-white font-semibold">{{ cookie.type }}</h3>
              <span class="text-[10px] uppercase tracking-widest text-white/30 border border-white/20 px-2 py-0.5 rounded-sm whitespace-nowrap">{{ cookie.kind }}</span>
            </div>
            <p class="text-white/50 text-sm leading-relaxed">{{ cookie.purpose }}</p>
          </div>
        </div>
      </div>

      <!-- How We Use Data -->
      <div :id="'use'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('use')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">04</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">How We Use Your Data</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['use'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['use']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <div class="space-y-2">
            <div v-for="(use, i) in dataUses" :key="i"
              class="flex items-start gap-4 py-3 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-sm transition-colors"
            >
              <span class="text-white/20 text-xs mt-1 font-mono shrink-0">{{ String(i+1).padStart(2,'0') }}</span>
              <p class="text-white/55 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{{ use }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Sharing -->
      <div :id="'sharing'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('sharing')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">05</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Data Sharing & Disclosure</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['sharing'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['sharing']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-6">
          <div>
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-3">We may share data with</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div v-for="entity in sharingEntities" :key="entity"
                class="border border-white/10 text-white/50 text-sm px-4 py-3 rounded-sm hover:border-white/30 hover:text-white/80 transition-all duration-200"
              >{{ entity }}</div>
            </div>
          </div>
          <div class="border border-white/10 rounded-sm p-5 bg-white/[0.02]">
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-2">Business Transactions</h3>
            <p class="text-white/50 text-sm leading-relaxed">If MizoMade is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
          </div>
          <div class="border border-white/10 rounded-sm p-5 bg-white/[0.02]">
            <h3 class="text-white/80 text-sm uppercase tracking-widest mb-2">Law Enforcement</h3>
            <p class="text-white/50 text-sm leading-relaxed">Under certain circumstances, we may be required to disclose Your Personal Data if required by law or in response to valid requests by public authorities.</p>
          </div>
        </div>
      </div>

      <!-- Retention, Transfer, Security -->
      <div :id="'security'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('security')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">06</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Retention, Transfer & Security</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['security'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['security']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-5">
          <p class="text-white/50 leading-relaxed text-sm">We retain Your Personal Data only for as long as necessary for the purposes set out in this Policy, and to comply with legal obligations. Usage Data is generally retained for a shorter period unless used to strengthen security or improve functionality.</p>
          <p class="text-white/50 leading-relaxed text-sm">Your information may be processed outside Your state, province, or country. By submitting information, You agree to this transfer. We take all reasonably necessary steps to ensure your data is treated securely.</p>
          <div class="border border-white/20 rounded-sm p-5 bg-white/[0.02]">
            <p class="text-white/70 text-sm leading-relaxed">⚠ No method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect Your data, we cannot guarantee its absolute security.</p>
          </div>
        </div>
      </div>

      <!-- Children's Privacy -->
      <div :id="'children'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('children')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">07</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Children's Privacy</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['children'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['children']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <p class="text-white/50 leading-relaxed text-sm">Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under 13. If you are a parent or guardian and believe your child has provided us Personal Data, please contact us and we will take steps to remove that information from our servers.</p>
        </div>
      </div>

      <!-- Changes -->
      <div :id="'changes'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('changes')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">08</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Policy Changes</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['changes'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['changes']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <p class="text-white/50 leading-relaxed text-sm">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and via email and/or a prominent notice on Our Service, prior to the change becoming effective. You are advised to review this Privacy Policy periodically for any changes.</p>
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
  { term: 'Account', desc: 'A unique account created for You to access our Service or parts of our Service.' },
  { term: 'Company', desc: 'MizoMade, Aizawl (referred to as "We", "Us" or "Our").' },
  { term: 'Cookies', desc: 'Small files placed on Your device containing browsing history details.' },
  { term: 'Country', desc: 'Mizoram, India.' },
  { term: 'Device', desc: 'Any device that can access the Service such as a computer, cellphone or tablet.' },
  { term: 'Personal Data', desc: 'Any information that relates to an identified or identifiable individual.' },
  { term: 'Service', desc: 'Refers to the Website — MizoMade.com.' },
  { term: 'Service Provider', desc: 'Third-party companies or individuals employed to facilitate the Service.' },
  { term: 'Usage Data', desc: 'Data collected automatically from the Service infrastructure.' },
  { term: 'You', desc: 'The individual or legal entity accessing or using the Service.' },
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
  'Service Providers', 'Business Partners', 'Affiliates', 'Other Users (public areas)', 'With Your Consent', 'During Business Transfers',
]
</script>
