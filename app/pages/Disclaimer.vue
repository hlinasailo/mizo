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
      <div class="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
        style="background: radial-gradient(circle, white, transparent 70%);"
      />
      <div class="relative z-10 max-w-5xl">
        <p class="text-white/30 text-xs tracking-[0.4em] uppercase mb-6">MizoMade · Legal</p>
        <h1 class="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter text-white mb-6">
          Dis<span class="text-white/20">claimer</span>
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
        The information contained on this website is for general information purposes only. Any reliance you place on such information is strictly at your own risk.
      </p>
    </section>

    <!-- Main Content -->
    <main class="px-6 md:px-16 lg:px-28 py-10 max-w-5xl mx-auto w-full space-y-2">

      <!-- General Information -->
      <div :id="'general'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('general')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">01</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">General Information</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['general'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['general']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-4">
          <p class="text-white/50 leading-relaxed text-sm">MizoMade endeavours to keep the information on this website up to date and correct. However, we make no representations or warranties of any kind — express or implied — about the completeness, accuracy, reliability, suitability, or availability of the website or its contents for any purpose.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="item in warrantyItems" :key="item"
              class="border border-white/10 rounded-sm px-4 py-3 text-white/40 text-sm hover:border-white/30 hover:text-white/60 transition-all duration-200 cursor-default"
            >
              <span class="text-white/20 mr-2">—</span>{{ item }}
            </div>
          </div>
          <p class="text-white/40 text-sm leading-relaxed">No warranty is made regarding any of the above. Any reliance you place on such information is therefore strictly at your own risk.</p>
        </div>
      </div>

      <!-- Liability -->
      <div :id="'liability'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('liability')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">02</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Limitation of Liability</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['liability'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['liability']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-4">
          <div class="border border-white/20 rounded-sm p-5 bg-white/[0.02]">
            <p class="text-white/70 text-sm leading-relaxed">In no event will MizoMade be liable for any loss or damage — including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever — arising from loss of data or profits in connection with the use of this website.</p>
          </div>
          <div class="space-y-2">
            <div v-for="(item, i) in liabilityItems" :key="i"
              class="flex items-start gap-4 py-3 border-b border-white/5 last:border-b-0 group hover:bg-white/[0.02] -mx-2 px-2 rounded-sm transition-colors"
            >
              <span class="text-white/20 text-xs mt-1 font-mono shrink-0">{{ String(i+1).padStart(2,'0') }}</span>
              <p class="text-white/55 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{{ item }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- External Links -->
      <div :id="'links'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('links')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">03</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">External Links</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['links'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['links']" class="px-8 pb-8 pt-2 border-t border-white/10 space-y-4">
          <p class="text-white/50 leading-relaxed text-sm">Through this website you may be able to link to other websites which are not under the control of MizoMade. We have no control over the nature, content, or availability of those sites.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="note in linkNotes" :key="note.title"
              class="border border-white/10 rounded-sm p-4 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-200 group"
            >
              <p class="text-white font-bold text-sm mb-1">{{ note.title }}</p>
              <p class="text-white/40 text-sm leading-relaxed">{{ note.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div :id="'availability'" class="section-block border border-white/10 rounded-sm overflow-hidden">
        <button
          @click="toggle('availability')"
          class="w-full flex items-center justify-between px-8 py-6 text-left group hover:bg-white/[0.03] transition-colors duration-200"
        >
          <div class="flex items-center gap-4">
            <span class="text-white/20 text-xs font-mono tracking-widest">04</span>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white">Website Availability</h2>
          </div>
          <span class="text-white/40 transition-transform duration-300 text-lg" :class="open['availability'] ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="open['availability']" class="px-8 pb-8 pt-2 border-t border-white/10">
          <p class="text-white/50 leading-relaxed text-sm">Every effort is made to keep mizomade.com up and running smoothly. However, MizoMade takes no responsibility for — and will not be liable for — the website being temporarily unavailable due to technical issues beyond our control.</p>
        </div>
      </div>

    </main>

    <!-- Contact Footer -->
    

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
