<template>
  <div :class="$style.page">

    <!-- Hero Header -->
    <header :class="$style.hero">
      <div :class="$style.gridBg" />
      <div :class="$style.glareOrb" />
      <div :class="$style.heroInner">
        <p :class="$style.eyebrow">MizoMade · Get In Touch</p>
        <h1 :class="$style.h1">
          Con<span :class="$style.h1Ghost">tact</span><br/>
          <span :class="$style.h1Ghost">Us</span>
        </h1>
        <p :class="$style.heroText">Have any questions? We'd love to hear from you.</p>
      </div>
    </header>

    <!-- Contact Form -->
    <main :class="$style.main">
      <div :class="$style.formWrap">
        <p :class="$style.formLabel">Send a Message</p>

        <!-- Success state -->
        <div v-if="submitted" :class="$style.successBox">
          <p :class="$style.successIcon">✓</p>
          <p :class="$style.successTitle">Message sent.</p>
          <p :class="$style.successSub">We'll get back to you as soon as possible.</p>
          <button
            @click="submitted = false; form.name = ''; form.contact = ''; form.subject = ''; form.message = ''"
            :class="$style.resetBtn"
          >Send another</button>
        </div>

        <!-- Form -->
        <div v-else :class="$style.fields">

          <!-- Full Name -->
          <div :class="$style.fieldWrap">
            <label
              :class="[$style.fieldLabel, (focused === 'name' || form.name) ? $style.fieldLabelFloat : $style.fieldLabelCenter]"
            >Full Name</label>
            <input
              v-model="form.name"
              type="text"
              @focus="focused = 'name'"
              @blur="focused = null"
              :class="[$style.input, focused === 'name' ? $style.inputFocus : '']"
            />
          </div>

          <!-- Email or Phone -->
          <div :class="$style.fieldWrap">
            <label
              :class="[$style.fieldLabel, (focused === 'contact' || form.contact) ? $style.fieldLabelFloat : $style.fieldLabelCenter]"
            >Email or Phone Number</label>
            <input
              v-model="form.contact"
              type="text"
              @focus="focused = 'contact'"
              @blur="focused = null"
              :class="[$style.input, focused === 'contact' ? $style.inputFocus : '']"
            />
          </div>

          <!-- Subject -->
          <div :class="$style.fieldWrap">
            <label
              :class="[$style.fieldLabel, (focused === 'subject' || form.subject) ? $style.fieldLabelFloat : $style.fieldLabelCenter]"
            >Subject</label>
            <input
              v-model="form.subject"
              type="text"
              @focus="focused = 'subject'"
              @blur="focused = null"
              :class="[$style.input, focused === 'subject' ? $style.inputFocus : '']"
            />
          </div>

          <!-- Message -->
          <div :class="$style.fieldWrap">
            <label
              :class="[$style.fieldLabel, (focused === 'message' || form.message) ? $style.fieldLabelFloat : $style.fieldLabelTop]"
            >Message</label>
            <textarea
              v-model="form.message"
              rows="5"
              @focus="focused = 'message'"
              @blur="focused = null"
              :class="[$style.textarea, focused === 'message' ? $style.inputFocus : '']"
            />
          </div>

          <!-- Error -->
          <p v-if="error" :class="$style.errorText">{{ error }}</p>

          <!-- Submit -->
          <button
            @click="handleSubmit"
            :disabled="loading"
            :class="[$style.submitBtn, loading ? $style.submitBtnDisabled : '']"
          >
            <span>{{ loading ? 'Sending...' : 'Submit' }}</span>
            <span v-if="!loading" :class="$style.submitArrow">→</span>
            <span v-else :class="$style.submitSpinner">⟳</span>
          </button>

        </div>
      </div>
    </main>

    <AppFooter/>
    <ButtomFooter/>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

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

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
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
  bottom: 0;
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

.heroText {
  color: var(--fg-muted);
  font-size: 1.125rem;
  line-height: 1.75;
  max-width: 30rem;
}

/* ─── Main / Form container ──────────────────────────────── */
.main {
  max-width: 42rem;
  margin: 0 auto;
  padding: 5rem 1.5rem;
}
@media (min-width: 768px) { .main { padding: 5rem 2rem; } }

.formWrap { width: 100%; }

.formLabel {
  color: var(--fg);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1.5rem;
  text-align: center;
  display: block;
}

/* ─── Success state ──────────────────────────────────────── */
.successBox {
  border: 1px solid var(--border);
  padding: 3.5rem 2rem;
  text-align: center;
  background: var(--card-bg);
}

.successIcon  { font-size: 1.75rem; margin-bottom: 1rem; color: var(--fg); }
.successTitle { color: var(--fg); font-weight: 700; font-size: 1.125rem; margin-bottom: 0.5rem; }
.successSub   { color: var(--fg-muted); font-size: 0.875rem; }

.resetBtn {
  margin-top: 2rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--fg-muted);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  background: none;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease !important;
}
.resetBtn:hover { border-color: var(--fg-muted); color: var(--fg); }

/* ─── Fields ─────────────────────────────────────────────── */
.fields { display: flex; flex-direction: column; gap: 0.5rem; }

.fieldWrap { position: relative; }

.fieldLabel {
  position: absolute;
  left: 1.5rem;
  pointer-events: none;
  color: var(--fg-soft);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  transition: all 0.2s ease !important;
}
.fieldLabelFloat  { top: 0.75rem; font-size: 0.6rem; }
.fieldLabelCenter { top: 50%; transform: translateY(-50%); font-size: 0.875rem; }
.fieldLabelTop    { top: 1.5rem; font-size: 0.875rem; }

.input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  padding: 1.75rem 1.5rem 0.75rem;
  color: var(--fg);
  font-size: 0.9rem;
  font-family: 'Roboto Mono', monospace;
  outline: none;
  transition: border-color 0.2s ease !important;
}
.input:hover   { border-color: var(--fg-muted); }
.inputFocus    { border-color: var(--fg) !important; }

.textarea {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  padding: 2rem 1.5rem 1rem;
  color: var(--fg);
  font-size: 0.9rem;
  font-family: 'Roboto Mono', monospace;
  outline: none;
  resize: none;
  transition: border-color 0.2s ease !important;
}
.textarea:hover { border-color: var(--fg-muted); }

/* ─── Error ──────────────────────────────────────────────── */
.errorText {
  color: var(--fg-muted);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding-left: 0.25rem;
}

/* ─── Submit button ──────────────────────────────────────── */
.submitBtn {
  width: 100%;
  border: 1px solid var(--border);
  padding: 1rem;
  color: var(--fg-muted);
  font-size: 0.7rem;
  font-family: 'Roboto Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease !important;
}
.submitBtn:hover {
  border-color: var(--fg);
  color: var(--fg);
  background: var(--card-bg);
}
.submitBtnDisabled { opacity: 0.5; cursor: not-allowed; }

.submitArrow {
  transition: transform 0.3s ease !important;
}
.submitBtn:hover .submitArrow { transform: translateX(4px); }

@keyframes spin { to { transform: rotate(360deg); } }
.submitSpinner { display: inline-block; animation: spin 0.8s linear infinite; }
</style>
