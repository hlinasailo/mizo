<template>
  <div class="bg-black min-h-screen text-white font-mono overflow-x-hidden">


    <!-- Hero Header -->
    <header class="relative min-h-[60vh] flex flex-col justify-end px-6 md:px-16 lg:px-28 pt-24 pb-16 border-b border-white/10">
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px); background-size: 60px 60px;"
      />
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl"
        style="background: radial-gradient(circle, white, transparent 70%);"
      />
      <div class="relative z-10 max-w-5xl">
        <p class="text-white/30 text-xs tracking-[0.4em] uppercase mb-6">MizoMade · Get In Touch</p>
        <h1 class="text-[clamp(3rem,10vw,8rem)] font-black leading-none tracking-tighter text-white mb-6">
          Con<span class="text-white/20">tact</span><br/>
          <span class="text-white/20">Us</span>
        </h1>
        <p class="text-white/50 text-lg md:text-xl leading-relaxed max-w-xl">
          Have any questions? We'd love to hear from you.
        </p>
      </div>
    </header>

    <!-- Contact Form - Centered -->
    <main class="max-w-2xl mx-auto px-6 md:px-16 lg:px-28 py-20">
      <div class="w-full">

        <!-- Form -->
        <div>
          <p class="text-white text-xs uppercase tracking-widest mb-6 text-center">Send a Message</p>

          <!-- Success state -->
          <div v-if="submitted"
            class="border border-white/20 rounded-sm px-8 py-14 text-center bg-white/[0.02]"
          >
            <p class="text-3xl mb-4">✓</p>
            <p class="text-white font-bold text-lg mb-2">Message sent.</p>
            <p class="text-white text-sm">We'll get back to you as soon as possible.</p>
            <button
              @click="submitted = false; form = { name: '', contact: '', subject: '', message: '' }"
              class="mt-8 text-xs uppercase tracking-widest text-white border border-white/10 px-6 py-3 rounded-sm hover:border-white/30 hover:text-white/70 transition-all duration-200"
            >Send another</button>
          </div>

          <!-- Form -->
          <div v-else class="space-y-2">

            <!-- Full Name -->
            <div class="relative group">
              <label
                class="absolute left-6 transition-all duration-200 pointer-events-none text-white/30 text-xs uppercase tracking-widest"
                :class="focused === 'name' || form.name ? 'top-3 text-[10px]' : 'top-1/2 -translate-y-1/2 text-sm'"
              >Full Name</label>
              <input
                v-model="form.name"
                type="text"
                @focus="focused = 'name'"
                @blur="focused = null"
                class="w-full bg-transparent border border-white/10 rounded-sm px-6 pt-7 pb-3 text-white text-sm outline-none transition-all duration-200 focus:border-white hover:border-white"
              />
            </div>

            <!-- Email or Phone -->
            <div class="relative group">
              <label
                class="absolute left-6 transition-all duration-200 pointer-events-none text-white/40 text-xs uppercase tracking-widest"
                :class="focused === 'contact' || form.contact ? 'top-3 text-[10px]' : 'top-1/2 -translate-y-1/2 text-sm'"
              >Email or Phone Number</label>
              <input
                v-model="form.contact"
                type="text"
                @focus="focused = 'contact'"
                @blur="focused = null"
                class="w-full bg-transparent border border-white/10 rounded-sm px-6 pt-7 pb-3 text-white/20 text-sm outline-none transition-all duration-200 focus:border-white hover:border-white"
              />
            </div>

            <!-- Subject -->
            <div class="relative group">
              <label
                class="absolute left-6 transition-all duration-200 pointer-events-none text-white/30 text-xs uppercase tracking-widest"
                :class="focused === 'subject' || form.subject ? 'top-3 text-[10px]' : 'top-1/2 -translate-y-1/2 text-sm'"
              >Subject</label>
              <input
                v-model="form.subject"
                type="text"
                @focus="focused = 'subject'"
                @blur="focused = null"
                class="w-full bg-transparent border border-white/10 rounded-sm px-6 pt-7 pb-3 text-white text-sm outline-none transition-all duration-200 focus:border-white/50 hover:border-white/20"
              />
            </div>

            <!-- Message -->
            <div class="relative group">
              <label
                class="absolute left-6 transition-all duration-200 pointer-events-none text-white/30 text-xs uppercase tracking-widest"
                :class="focused === 'message' || form.message ? 'top-3 text-[10px]' : 'top-6 text-sm'"
              >Message</label>
              <textarea
                v-model="form.message"
                rows="5"
                @focus="focused = 'message'"
                @blur="focused = null"
                class="w-full bg-transparent border border-white/10 rounded-sm px-6 pt-8 pb-4 text-white text-sm outline-none transition-all duration-200 focus:border-white/50 hover:border-white/20 resize-none"
              />
            </div>

            <!-- Error -->
            <p v-if="error" class="text-white/50 text-xs uppercase tracking-widest pl-1">{{ error }}</p>

            <!-- Submit -->
            <button
              @click="handleSubmit"
              :disabled="loading"
              class="group w-full border border-white/20 rounded-sm py-4 text-white/70 text-xs uppercase tracking-[0.3em] hover:border-white hover:text-white hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-center gap-3 mt-2"
              :class="loading ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <span>{{ loading ? 'Sending...' : 'Submit' }}</span>
              <span v-if="!loading" class="transition-transform duration-300 group-hover:translate-x-1">→</span>
              <span v-else class="animate-spin text-base">⟳</span>
            </button>

          </div>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <AppFooter/>
    <ButtomFooter/>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const scrollProgress = ref(0)
const focused = ref(null)
const submitted = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  contact: '',
  subject: '',
  message: '',
})

function handleSubmit() {
  error.value = ''
  if (!form.name.trim() || !form.contact.trim() || !form.subject.trim() || !form.message.trim()) {
    error.value = 'All fields are required.'
    return
  }
  loading.value = true
  // Simulate async submit — replace with your actual API call
  setTimeout(() => {
    loading.value = false
    submitted.value = true
  }, 1200)
}

function onScroll() {
  const doc = document.documentElement
  const scrollTop = doc.scrollTop || document.body.scrollTop
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>