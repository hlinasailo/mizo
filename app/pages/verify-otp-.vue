<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuthService } from '~/services/authService'

definePageMeta({
  alias: ['/otp', '/otp-verification', '/verify-otp'],
})

const router = useRouter()
const route = useRoute()
const authService = useAuthService()

const form = reactive({
  phone: String(route.query.phone || ''),
  otp: '',
  purpose: String(route.query.purpose || 'Registration'),
})

const isSubmitting = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const normalizedPhone = computed(() => form.phone.replace(/[^\d+]/g, ''))
const isPhoneValid = computed(() => /^\+?\d{10,15}$/.test(normalizedPhone.value))
const canVerify = computed(() => !!form.otp && isPhoneValid.value && !isSubmitting.value)

const handleVerifyOtp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isPhoneValid.value) {
    errorMessage.value = 'Please enter a valid phone number.'
    return
  }

  if (!form.otp || form.otp.trim().length < 4) {
    errorMessage.value = 'Please enter a valid OTP code.'
    return
  }

  isSubmitting.value = true
  try {
    const res = await authService.verifyOtp({
      phone: normalizedPhone.value,
      otp_value: form.otp.trim(),
      purpose: form.purpose || 'Registration',
    })

    successMessage.value = res?.message || 'OTP verified successfully.'
    window.setTimeout(() => {
      void router.push('/login')
    }, 900)
  } catch (error: unknown) {
    const e = error as { statusMessage?: string; data?: { error?: string; detail?: string } }
    errorMessage.value =
      e?.data?.error ||
      e?.data?.detail ||
      e?.statusMessage ||
      'OTP verification failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleResendOtp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!isPhoneValid.value) {
    errorMessage.value = 'Please enter a valid phone number first.'
    return
  }

  isResending.value = true
  try {
    const res = await authService.resendOtp({
      phone: normalizedPhone.value,
      purpose: form.purpose || 'Registration',
    })

    successMessage.value = res?.message || 'A new OTP has been sent.'
  } catch (error: unknown) {
    const e = error as { statusMessage?: string; data?: { error?: string; detail?: string } }
    errorMessage.value =
      e?.data?.error ||
      e?.data?.detail ||
      e?.statusMessage ||
      'Could not resend OTP right now.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <main :class="$style.page">
    <section :class="$style.section">
      <div :class="$style.desktopLayout">
        <form :class="$style.card" @submit.prevent="handleVerifyOtp">
          <header :class="$style.cardHeader">
            <h1 :class="$style.cardTitle">Verify OTP</h1>
            <p :class="$style.cardSubtitle">Enter the code sent to your phone.</p>
          </header>

          <div :class="$style.fields">
            <div :class="$style.fieldWrap">
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                placeholder="Phone Number"
                :class="$style.input"
              >
            </div>

            <div :class="$style.fieldWrap">
              <input
                v-model="form.otp"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                placeholder="OTP Code"
                :class="$style.input"
              >
            </div>

            <div :class="$style.fieldWrap">
              <input
                v-model="form.purpose"
                type="text"
                placeholder="Purpose (e.g. Registration)"
                :class="$style.input"
              >
            </div>
          </div>

          <p v-if="errorMessage" :class="$style.error">{{ errorMessage }}</p>
          <p v-if="successMessage" :class="$style.success">{{ successMessage }}</p>

          <button type="submit" :disabled="!canVerify" :class="$style.submitBtn">
            {{ isSubmitting ? 'Verifying…' : 'Verify OTP' }}
          </button>

          <button type="button" :disabled="isResending" :class="$style.secondaryBtn" @click="handleResendOtp">
            {{ isResending ? 'Resending…' : 'Resend OTP' }}
          </button>

          <div :class="$style.divider" />

          <p :class="$style.switchRow">
            <span :class="$style.switchText">Already verified?</span>
            <NuxtLink to="/login" :class="$style.switchLink">Sign in</NuxtLink>
          </p>
        </form>
      </div>
    </section>
  </main>
</template>

<style module>
:global(:root) {
  --su-page-bg:      #efefef;
  --su-card-bg:      #ffffff;
  --su-card-border:  rgba(0,0,0,0.08);
  --su-card-shadow:  0 4px 32px rgba(0,0,0,0.10);
  --su-title:        #111110;
  --su-subtitle:     #888884;
  --su-input-bg:     #f5f4f2;
  --su-input-border: #e0deda;
  --su-input-focus:  #111110;
  --su-input-text:   #111110;
  --su-input-ph:     #aaa9a5;
  --su-submit-bg:    #111110;
  --su-submit-fg:    #ffffff;
  --su-submit-hover: #2c2c2a;
  --su-secondary-bg: #3f3f3d;
  --su-secondary-fg: #ffffff;
  --su-secondary-hover: #5a5a57;
  --su-divider:      #e8e7e4;
  --su-switch-muted: #888884;
  --su-switch-link:  #111110;
  --su-error:        #c0392b;
  --su-success:      #1e8a4f;
  --su-grid-line:    rgba(17,17,16,0.06);
  --su-grid-glow:    rgba(17,17,16,0.06);
}

:global(html.dark) {
  --su-page-bg:      #0a0a0a;
  --su-card-bg:      #161616;
  --su-card-border:  rgba(255,255,255,0.08);
  --su-card-shadow:  0 4px 40px rgba(0,0,0,0.55);
  --su-title:        #f0ede8;
  --su-subtitle:     rgba(240,237,232,0.45);
  --su-input-bg:     #1e1e1e;
  --su-input-border: rgba(255,255,255,0.10);
  --su-input-focus:  rgba(240,237,232,0.80);
  --su-input-text:   #f0ede8;
  --su-input-ph:     rgba(240,237,232,0.28);
  --su-submit-bg:    #f0ede8;
  --su-submit-fg:    #0a0a0a;
  --su-submit-hover: #d8d4ce;
  --su-secondary-bg: #282826;
  --su-secondary-fg: #f0ede8;
  --su-secondary-hover: #333331;
  --su-divider:      rgba(255,255,255,0.07);
  --su-switch-muted: rgba(240,237,232,0.40);
  --su-switch-link:  #f0ede8;
  --su-error:        #e74c3c;
  --su-success:      #4be08f;
  --su-grid-line:    rgba(240,237,232,0.08);
  --su-grid-glow:    rgba(240,237,232,0.08);
}

:global(*) {
  transition:
    color 0.35s ease,
    background-color 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.page {
  min-height: 100vh;
  background: var(--su-page-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.25rem 4rem;
  position: relative;
  overflow: hidden;
}

.page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, var(--su-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--su-grid-line) 1px, transparent 1px);
  background-size: 56px 56px;
  opacity: 0.68;
  pointer-events: none;
}

.page::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, var(--su-grid-glow) 0%, transparent 72%);
  opacity: 0.85;
  pointer-events: none;
}

.section {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.desktopLayout {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: stretch;
}

.card {
  width: 100%;
  max-width: 420px;
  background: var(--su-card-bg);
  border: 1px solid var(--su-card-border);
  border-radius: 16px;
  box-shadow: var(--su-card-shadow);
  padding: 2.5rem 2rem 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  justify-self: center;
  position: relative;
  overflow: hidden;
}

.cardHeader {
  text-align: center;
  margin-bottom: 2rem;
}

.cardTitle {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--su-title);
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
}

.cardSubtitle {
  font-size: 0.875rem;
  color: var(--su-subtitle);
  font-weight: 400;
}

.fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.fieldWrap {
  position: relative;
}

.input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--su-input-bg);
  border: 1.5px solid var(--su-input-border);
  border-radius: 8px;
  color: var(--su-input-text);
  outline: none;
  font-size: 0.925rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.35s ease,
    color 0.35s ease !important;
}

.input::placeholder {
  color: var(--su-input-ph);
}

.input:focus {
  border-color: var(--su-input-focus);
  box-shadow: 0 0 0 3px rgba(17,17,16,0.08);
}

:global(html.dark) .input:focus {
  box-shadow: 0 0 0 3px rgba(240,237,232,0.08);
}

.error,
.success {
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  text-align: center;
}

.error {
  color: var(--su-error);
}

.success {
  color: var(--su-success);
}

.submitBtn,
.secondaryBtn {
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background-color 0.2s ease, opacity 0.2s ease !important;
}

.submitBtn {
  background: var(--su-submit-bg);
  color: var(--su-submit-fg);
}

.submitBtn:hover:not(:disabled) {
  background: var(--su-submit-hover);
}

.secondaryBtn {
  margin-top: 0.65rem;
  background: var(--su-secondary-bg);
  color: var(--su-secondary-fg);
}

.secondaryBtn:hover:not(:disabled) {
  background: var(--su-secondary-hover);
}

.submitBtn:disabled,
.secondaryBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  height: 1px;
  background: var(--su-divider);
  margin: 1.75rem 0 1.5rem;
}

.switchRow {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.switchText {
  font-size: 0.875rem;
  color: var(--su-switch-muted);
}

.switchLink {
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--su-switch-link);
  text-decoration: none;
}

.switchLink:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (min-width: 1024px) {
  .desktopLayout {
    grid-template-columns: minmax(360px, 420px);
    justify-content: center;
  }

  .card {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
}
</style>