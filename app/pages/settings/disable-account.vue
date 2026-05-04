<script setup lang="ts">
import { reactive } from 'vue'

definePageMeta({
  middleware: 'auth',
  alias: ['/settings/disableAccount'],
})

const router = useRouter()

const disableForm = reactive({
  type: 'temporary',
  password: '',
  reason: '',
})

const warningMessage = ref('')

const handleBack = () => {
  void router.push('/settings')
}

const handleDisableAccount = () => {
  warningMessage.value = ''

  if (!disableForm.password.trim()) {
    warningMessage.value = 'Please enter your password to confirm.'
    return
  }

  warningMessage.value = 'Disable account is not connected to a backend action yet.'
}
</script>

<template>
  <div :class="$style.page">
    <section :class="$style.wrapper">
      <button type="button" :class="$style.backBtn" @click="handleBack">
        ← Back to Settings
      </button>

      <div :class="$style.card">
        <header :class="$style.cardHeader">
          <p :class="$style.eyebrow">Detail</p>
          <h1 :class="$style.title">Disable Account</h1>
        </header>

        <form :class="$style.form" @submit.prevent="handleDisableAccount">
          <div :class="$style.field">
            <span :class="$style.label">Disable Type</span>
            <div :class="$style.choiceGroup">
              <label :class="$style.choiceItem" for="temporaryDisable">
                <input id="temporaryDisable" v-model="disableForm.type" type="radio" value="temporary" :class="$style.choiceInput">
                <span>Temporary</span>
              </label>
              <label :class="$style.choiceItem" for="permanentDisable">
                <input id="permanentDisable" v-model="disableForm.type" type="radio" value="permanent" :class="$style.choiceInput">
                <span>Permanent</span>
              </label>
            </div>
          </div>

          <div :class="$style.field">
            <label :class="$style.label" for="disablePassword">Confirm Password to Disable</label>
            <input id="disablePassword" v-model="disableForm.password" type="password" placeholder="Enter your password to confirm" :class="$style.input">
          </div>

          <div :class="$style.field">
            <label :class="$style.label" for="disableReason">Reason for Disabling (Optional)</label>
            <textarea id="disableReason" v-model="disableForm.reason" placeholder="Tell us why you're disabling your account" :class="$style.textarea" />
          </div>

          <p v-if="warningMessage" :class="$style.warningText">{{ warningMessage }}</p>

          <button type="submit" :class="$style.dangerBtn">Disable My Account</button>
        </form>
      </div>
    </section>
  </div>
</template>

<style module>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

.page {
  --page-bg: #ffffff;
  --card-bg: #ffffff;
  --border: rgba(24, 24, 27, 0.30);
  --text: #18181b;
  --muted: #71717a;
  --input-bg: #fafafa;
  --input-border: #d4d4d8;
  --danger: #ef0303;
  --danger-soft: rgba(196, 25, 25, 0.12);
}

:global(html.dark) .page{
  --page-bg: #000000;
  --card-bg: #19191d;
  --border: rgba(255,255,255,0.030);
  --text: #fafafa;
  --muted: #a1a1aa;
  --input-bg: #111114;
  --input-border: rgba(255,255,255,0.12);
  --danger: #c73434;
  --danger-soft: rgba(248,113,113,0.14);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text);
  font-family: 'Sora', sans-serif;
  position: relative;
  overflow: hidden;
}

.page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 82% 64% at 50% 0%, black 30%, transparent 100%);
  opacity: 0.55;
}

.wrapper {
  max-width: 760px;
  margin: 0 auto;
  padding: 84px 16px 40px;
  position: relative;
  z-index: 1;
}

.backBtn {
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  margin-bottom: 18px;
  font: inherit;
  font-size: 0.9rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 14px 34px rgba(15,23,42,0.12);
  padding: 2rem;
}

.cardHeader { margin-bottom: 1.25rem; }
.eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  font-family: 'DM Mono', monospace;
}
.title {
  margin-top: 0.35rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
}
.subtitle { margin-top: 0.35rem; color: var(--muted); font-size: 0.92rem; line-height: 1.6; }

.noticeBox {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.noticeText {
  color: var(--muted);
  line-height: 1.7;
  font-size: 0.92rem;
}

.warningText {
  color: var(--danger);
  font-size: 0.82rem;
  line-height: 1.5;
}

.form { display: grid; gap: 1rem; }
.field { display: grid; gap: 0.45rem; }
.label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.input,
.textarea {
  width: 100%;
  padding: 0.85rem 0.95rem;
  border: 1px solid var(--input-border);
  border-radius: 10px;
  background: var(--input-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
}
.textarea { min-height: 120px; resize: vertical; }

.choiceGroup {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.2rem;
}
.choiceItem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
  font-size: 0.95rem;
}
.choiceInput { accent-color: var(--text); }

.dangerBtn {
  margin-top: 0.35rem;
  border: 1px solid var(--danger);
  background: transparent;
  color: var(--danger);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .wrapper { padding-top: 68px; }
  .card { padding: 1.25rem; }
}
</style>
