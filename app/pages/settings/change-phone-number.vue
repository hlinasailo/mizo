<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { useUserService } from '~/services/userService'

definePageMeta({
  middleware: 'auth',
  alias: ['/settings/changePhoneNumber'],
})

const router = useRouter()
const userStore = useUserStore()
const userService = useUserService()

const phoneForm = reactive({
  oldPhone: '',
  newPhone: '',
  otp: '',
})

const PHONE_OTP_PURPOSE = 'Change Phone'
const phoneOtpSending = ref(false)
const phoneOtpSent = ref(false)
const phoneOtpInfo = ref('')
const phoneOtpCooldown = ref(0)
let phoneOtpCooldownTimer: ReturnType<typeof setInterval> | null = null

const phoneError = ref('')
const phoneSuccess = ref('')
const phoneSaving = ref(false)
const phoneFieldErrors = reactive({
  oldPhone: '',
  newPhone: '',
})
const phoneFieldTouched = reactive({
  oldPhone: false,
  newPhone: false,
})

const PHONE_LABELS: Record<'oldPhone' | 'newPhone', string> = {
  oldPhone: 'Old phone number',
  newPhone: 'New phone number',
}

const getErrorStatus = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const status = (error as { status?: number; statusCode?: number }).status
    ?? (error as { status?: number; statusCode?: number }).statusCode

  return typeof status === 'number' ? status : undefined
}

const getErrorPayloadText = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return ''
  }

  const err = error as {
    message?: unknown
    statusMessage?: unknown
    data?: unknown
  }

  const parts: string[] = []

  if (typeof err.message === 'string') {
    parts.push(err.message)
  }

  if (typeof err.statusMessage === 'string') {
    parts.push(err.statusMessage)
  }

  if (typeof err.data === 'string') {
    parts.push(err.data)
  } else if (err.data && typeof err.data === 'object') {
    const data = err.data as { detail?: unknown; error?: unknown; message?: unknown }
    if (typeof data.detail === 'string') {
      parts.push(data.detail)
    }
    if (typeof data.error === 'string') {
      parts.push(data.error)
    }
    if (typeof data.message === 'string') {
      parts.push(data.message)
    }
  }

  return parts.join(' ').toLowerCase()
}

const getPhoneUserSafeError = (error: unknown, context: 'send-otp' | 'change-phone') => {
  const status = getErrorStatus(error)
  const text = getErrorPayloadText(error)

  if (status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  if (status === 403) {
    return 'You are not allowed to perform this action right now.'
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  if ((status === 400 || status === 422) && text.includes('otp')) {
    return 'The OTP is invalid or expired. Please request a new OTP and try again.'
  }

  if ((status === 400 || status === 422) && text.includes('phone') && (text.includes('exists') || text.includes('already'))) {
    return 'That phone number is already in use. Please use a different phone number.'
  }

  if (context === 'send-otp') {
    return 'Could not send OTP right now. Please try again shortly.'
  }

  return 'Could not update phone number. Please check your details and try again.'
}

const sanitizePhoneInput = (value: string) => {
  const compact = value.replace(/\s+/g, '')
  if (compact.startsWith('+')) {
    return `+${compact.slice(1).replace(/\D/g, '')}`
  }

  return compact.replace(/\D/g, '')
}

const normalizePhoneNumber = (value: string) => {
  const trimmed = value.trim()
  const hasPlusPrefix = trimmed.startsWith('+')
  const digitsOnly = trimmed.replace(/\D/g, '')

  return hasPlusPrefix ? `+${digitsOnly}` : digitsOnly
}

const normalizePhoneDigits = (value: string) => normalizePhoneNumber(value).replace(/^\+/, '')

const validatePhoneNumber = (value: string, label: string) => {
  const normalized = normalizePhoneNumber(value)

  if (!normalized) {
    return `${label} is required.`
  }

  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized
  if (digits.length < 10 || digits.length > 15) {
    return `${label} must contain 10 to 15 digits.`
  }

  return ''
}

const validateSinglePhoneField = (field: 'oldPhone' | 'newPhone') => {
  let error = validatePhoneNumber(phoneForm[field], PHONE_LABELS[field])

  if (!error && field === 'oldPhone') {
    const registeredPhone = userStore.user?.phonenumber ?? ''
    const registeredDigits = normalizePhoneDigits(registeredPhone)
    const enteredDigits = normalizePhoneDigits(phoneForm.oldPhone)

    if (registeredDigits && enteredDigits !== registeredDigits) {
      error = 'Old phone number must match your registered phone number.'
    }
  }

  phoneFieldErrors[field] = error
  return !error
}

const handlePhoneFieldInput = (field: 'oldPhone' | 'newPhone', event: Event) => {
  phoneError.value = ''
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }

  const sanitized = sanitizePhoneInput(target.value)
  phoneForm[field] = sanitized
  if (target.value !== sanitized) {
    target.value = sanitized
  }

  phoneFieldTouched[field] = true
  validateSinglePhoneField(field)
}

const handlePhoneFieldBlur = (field: 'oldPhone' | 'newPhone') => {
  phoneFieldTouched[field] = true
  validateSinglePhoneField(field)
}

const startPhoneOtpCooldown = (seconds: number) => {
  phoneOtpCooldown.value = seconds

  if (phoneOtpCooldownTimer) {
    globalThis.clearInterval(phoneOtpCooldownTimer)
    phoneOtpCooldownTimer = null
  }

  phoneOtpCooldownTimer = globalThis.setInterval(() => {
    phoneOtpCooldown.value -= 1
    if (phoneOtpCooldown.value <= 0) {
      if (phoneOtpCooldownTimer !== null) {
        globalThis.clearInterval(phoneOtpCooldownTimer)
      }
      phoneOtpCooldownTimer = null
      phoneOtpCooldown.value = 0
    }
  }, 1000)
}

const handleSendOrResendPhoneOtp = async () => {
  phoneError.value = ''
  phoneSuccess.value = ''
  phoneOtpInfo.value = ''

  const currentPhone = userStore.user?.phonenumber?.trim()

  if (!currentPhone) {
    phoneError.value = 'No phone number found on your account.'
    return
  }

  if (!userStore.accessToken) {
    phoneError.value = 'Please login again and retry.'
    return
  }

  phoneOtpSending.value = true
  try {
    const payload = {
      phone: currentPhone,
      purpose: PHONE_OTP_PURPOSE,
    }

    if (phoneOtpSent.value) {
      await userService.resendOtp(payload)
      phoneOtpInfo.value = 'OTP resent successfully.'
    } else {
      await userService.initOtp(payload, userStore.accessToken)
      phoneOtpInfo.value = 'OTP sent successfully.'
      phoneOtpSent.value = true
    }

    startPhoneOtpCooldown(30)
  } catch (error) {
    phoneError.value = getPhoneUserSafeError(error, 'send-otp')
    console.error('Failed to send phone OTP', error)
  } finally {
    phoneOtpSending.value = false
  }
}

const handlePhoneChange = async () => {
  phoneError.value = ''
  phoneSuccess.value = ''
  phoneFieldErrors.oldPhone = ''
  phoneFieldErrors.newPhone = ''

  const isOldPhoneValid = validateSinglePhoneField('oldPhone')
  const isNewPhoneValid = validateSinglePhoneField('newPhone')

  if (!isOldPhoneValid || !isNewPhoneValid) {
    phoneError.value = 'Please enter valid old and new phone numbers.'
    return
  }

  const oldPhone = normalizePhoneNumber(phoneForm.oldPhone)
  const newPhone = normalizePhoneNumber(phoneForm.newPhone)
  const otp = phoneForm.otp.trim()

  const currentPhone = userStore.user?.phonenumber ? normalizePhoneDigits(userStore.user.phonenumber) : ''

  if (currentPhone && normalizePhoneDigits(oldPhone) !== currentPhone) {
    phoneFieldErrors.oldPhone = 'Old phone number does not match your current account phone number.'
    phoneError.value = 'Please enter your current phone number correctly.'
    return
  }

  if (oldPhone === newPhone) {
    phoneError.value = 'New phone number must be different from old phone number.'
    return
  }

  if (!otp) {
    phoneError.value = 'OTP is required.'
    return
  }

  if (!userStore.accessToken) {
    phoneError.value = 'Please login again and retry.'
    return
  }

  phoneSaving.value = true
  try {
    await userService.changePhone({
      old_phone: oldPhone,
      new_phone: newPhone,
      otp_value: otp,
      purpose: PHONE_OTP_PURPOSE,
    }, userStore.accessToken)

    phoneSuccess.value = 'Phone number changed successfully.'
    phoneForm.oldPhone = ''
    phoneForm.newPhone = ''
    phoneForm.otp = ''
    phoneOtpInfo.value = ''
    phoneOtpSent.value = false
    phoneOtpCooldown.value = 0

    if (userStore.user) {
      userStore.user.phonenumber = newPhone
    }
  } catch (error) {
    phoneError.value = getPhoneUserSafeError(error, 'change-phone')
    console.error('Failed to change phone number', error)
  } finally {
    phoneSaving.value = false
  }
}

const handleBack = () => {
  void router.push('/settings')
}

onMounted(async () => {
  if (userStore.isAuthenticated && !userStore.user) {
    await userStore.fetchUser()
  }
})

onBeforeUnmount(() => {
  if (phoneOtpCooldownTimer) {
    globalThis.clearInterval(phoneOtpCooldownTimer)
    phoneOtpCooldownTimer = null
  }
})
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
          <h1 :class="$style.title">Change Phone Number</h1>
          <p :class="$style.subtitle">Verify the change with an OTP sent to your existing phone number.</p>
        </header>

        <div :class="$style.phoneNotice">
          <span :class="$style.noticeLabel">Current phone number</span>
          <strong>{{ userStore.user?.phonenumber || 'Not available' }}</strong>
        </div>

        <form :class="$style.form" @submit.prevent="handlePhoneChange">
          <div :class="$style.field">
            <label :class="$style.label" for="oldPhone">Old Phone Number</label>
            <input id="oldPhone" :value="phoneForm.oldPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Enter your old phone number" :class="$style.input" pattern="^\+?\d{10,15}$" minlength="10" maxlength="16" @input="handlePhoneFieldInput('oldPhone', $event)" @blur="handlePhoneFieldBlur('oldPhone')">
            <p v-if="phoneFieldErrors.oldPhone" :class="$style.errorText">{{ phoneFieldErrors.oldPhone }}</p>
          </div>

          <div :class="$style.field">
            <label :class="$style.label" for="newPhone">New Phone Number</label>
            <input id="newPhone" :value="phoneForm.newPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Enter your new phone number" :class="$style.input" pattern="^\+?\d{10,15}$" minlength="10" maxlength="16" @input="handlePhoneFieldInput('newPhone', $event)" @blur="handlePhoneFieldBlur('newPhone')">
            <p v-if="phoneFieldErrors.newPhone" :class="$style.errorText">{{ phoneFieldErrors.newPhone }}</p>
          </div>

          <div :class="$style.field">
            <label :class="$style.label" for="phoneOtp">Verification OTP</label>
            <div :class="$style.otpRow">
              <input id="phoneOtp" v-model="phoneForm.otp" type="text" placeholder="Enter OTP" :class="$style.input">
              <button type="button" :class="$style.secondaryBtn" :disabled="phoneOtpSending || !userStore.accessToken || !userStore.user?.phonenumber || phoneOtpCooldown > 0" @click="handleSendOrResendPhoneOtp">
                {{ phoneOtpSending ? 'Sending…' : phoneOtpCooldown > 0 ? `Resend in ${phoneOtpCooldown}s` : (phoneOtpSent ? 'Resend OTP' : 'Send OTP') }}
              </button>
            </div>
            <p v-if="phoneOtpInfo" :class="$style.infoText">{{ phoneOtpInfo }}</p>
          </div>

          <p v-if="phoneError" :class="$style.errorText">{{ phoneError }}</p>
          <p v-if="phoneSuccess" :class="$style.successText">{{ phoneSuccess }}</p>

          <button type="submit" :class="$style.primaryBtn" :disabled="phoneSaving">{{ phoneSaving ? 'Updating…' : 'Update Phone Number' }}</button>
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
  --border: rgba(24,24,27,0.30);
  --text: #18181b;
  --muted: #71717a;
  --input-bg: #fafafa;
  --input-border: #d4d4d8;
  --primary-bg: #18181b;
  --primary-fg: #ffffff;
  --secondary-bg: #000000;
  --secondary-fg: #ffffff;
  --error: #b91c1c;
  --success: #15803d;
}

:global(html.dark) .page {
  --page-bg: #000000;
  --card-bg: #000000;
  --border: rgba(255,255,255,0.30);
  --text: #fafafa;
  --muted: #a1a1aa;
  --input-bg: #111114;
  --input-border: rgba(255,255,255,0.12);
  --primary-bg: #f4f4f5;
  --primary-fg: #09090b;
  --secondary-bg: #ffffff;
  --secondary-fg: #000000;
  --error: #f87171;
  --success: #4ade80;
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

.cardHeader { margin-bottom: 1.5rem; }
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

.phoneNotice {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  border: 1px dashed var(--border);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  color: var(--muted);
}

.noticeLabel {
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
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
.input {
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
.input:focus {
  border-color: var(--text);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--text) 10%, transparent);
}

.otpRow {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
}

.primaryBtn,
.secondaryBtn {
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primaryBtn {
  background: var(--primary-bg);
  color: var(--primary-fg);
}
.primaryBtn:disabled { opacity: 0.55; cursor: not-allowed; }

.secondaryBtn {
  background: var(--secondary-bg);
  color: var(--secondary-fg);
  white-space: nowrap;
}
.secondaryBtn:disabled { opacity: 0.55; cursor: not-allowed; }

.infoText { font-size: 0.82rem; color: var(--muted); }
.errorText { font-size: 0.82rem; color: var(--error); }
.successText { font-size: 0.82rem; color: var(--success); }

@media (max-width: 640px) {
  .wrapper { padding-top: 68px; }
  .card { padding: 1.25rem; }
  .otpRow { grid-template-columns: 1fr; }
}
</style>
