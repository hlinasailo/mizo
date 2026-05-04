<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { useUserService } from '~/services/userService'

definePageMeta({
  middleware: 'auth',
  alias: ['/settings/passwordChange'],
})

const router = useRouter()
const userStore = useUserStore()
const userService = useUserService()

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: '',
  otp: '',
})

const otpSending = ref(false)
const otpSent = ref(false)
const otpInfo = ref('')
const otpCooldown = ref(0)
let otpCooldownTimer: ReturnType<typeof setInterval> | null = null

const passwordError = ref('')
const passwordSuccess = ref('')
const passwordSaving = ref(false)

const OTP_PURPOSE = 'Change Password'

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

const getPasswordUserSafeError = (error: unknown, context: 'send-otp' | 'change-password') => {
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

  if ((status === 400 || status === 422) && text.includes('password') && (text.includes('weak') || text.includes('short'))) {
    return 'Please choose a stronger password and try again.'
  }

  if (context === 'send-otp') {
    return 'Could not send OTP right now. Please try again shortly.'
  }

  return 'Could not update password. Please check your details and try again.'
}

const startOtpCooldown = (seconds: number) => {
  otpCooldown.value = seconds

  if (otpCooldownTimer) {
    globalThis.clearInterval(otpCooldownTimer)
    otpCooldownTimer = null
  }

  otpCooldownTimer = globalThis.setInterval(() => {
    otpCooldown.value -= 1
    if (otpCooldown.value <= 0) {
      if (otpCooldownTimer !== null) {
        globalThis.clearInterval(otpCooldownTimer)
      }
      otpCooldownTimer = null
      otpCooldown.value = 0
    }
  }, 1000)
}

const handleSendOrResendOtp = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  otpInfo.value = ''

  if (!userStore.user?.phonenumber) {
    passwordError.value = 'No phone number found on your account.'
    return
  }

  if (!userStore.accessToken) {
    passwordError.value = 'Please login again and retry.'
    return
  }

  otpSending.value = true
  try {
    const payload = {
      phone: userStore.user.phonenumber,
      purpose: OTP_PURPOSE,
    }

    if (otpSent.value) {
      await userService.resendOtp(payload)
      otpInfo.value = 'OTP resent successfully.'
    } else {
      await userService.initOtp(payload, userStore.accessToken)
      otpInfo.value = 'OTP sent successfully.'
      otpSent.value = true
    }

    startOtpCooldown(30)
  } catch (error) {
    passwordError.value = getPasswordUserSafeError(error, 'send-otp')
    console.error('Failed to send password-change OTP', error)
  } finally {
    otpSending.value = false
  }
}

const handlePasswordChange = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
    passwordError.value = 'Please fill in the required fields.'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Passwords do not match.'
    return
  }

  if (!passwordForm.otp.trim()) {
    passwordError.value = 'OTP is required.'
    return
  }

  if (!userStore.user?.phonenumber) {
    passwordError.value = 'No phone number found on your account.'
    return
  }

  if (!userStore.accessToken) {
    passwordError.value = 'Please login again and retry.'
    return
  }

  passwordSaving.value = true
  try {
    await userService.changePassword({
      phone: userStore.user.phonenumber,
      password: passwordForm.newPassword,
      otp_value: passwordForm.otp.trim(),
      purpose: OTP_PURPOSE,
    }, userStore.accessToken)

    passwordSuccess.value = 'Password changed successfully.'
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordForm.otp = ''
  } catch (error) {
    passwordError.value = getPasswordUserSafeError(error, 'change-password')
    console.error('Failed to change password', error)
  } finally {
    passwordSaving.value = false
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
  if (otpCooldownTimer) {
    globalThis.clearInterval(otpCooldownTimer)
    otpCooldownTimer = null
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
          <h1 :class="$style.title">Change Password</h1>
          <p :class="$style.subtitle">Verify with an OTP sent to your phone number, then update your password.</p>
        </header>

        <div :class="$style.phoneNotice">
          <span :class="$style.noticeLabel">Phone number</span>
          <strong>{{ userStore.user?.phonenumber || 'Not available' }}</strong>
        </div>

        <form :class="$style.form" @submit.prevent="handlePasswordChange">
          <div :class="$style.field">
            <label :class="$style.label" for="newPassword">New Password</label>
            <input id="newPassword" v-model="passwordForm.newPassword" type="password" placeholder="Enter your new password" :class="$style.input">
          </div>

          <div :class="$style.field">
            <label :class="$style.label" for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" v-model="passwordForm.confirmPassword" type="password" placeholder="Confirm your new password" :class="$style.input">
          </div>

          <div :class="$style.field">
            <label :class="$style.label" for="passwordOtp">Verification OTP</label>
            <div :class="$style.otpRow">
              <input id="passwordOtp" v-model="passwordForm.otp" type="text" placeholder="Enter OTP" :class="$style.input">
              <button type="button" :class="$style.secondaryBtn" :disabled="otpSending || !userStore.user?.phonenumber || !userStore.accessToken || otpCooldown > 0" @click="handleSendOrResendOtp">
                {{ otpSending ? 'Sending…' : otpCooldown > 0 ? `Resend in ${otpCooldown}s` : (otpSent ? 'Resend OTP' : 'Send OTP') }}
              </button>
            </div>
            <p v-if="otpInfo" :class="$style.infoText">{{ otpInfo }}</p>
          </div>

          <p v-if="passwordError" :class="$style.errorText">{{ passwordError }}</p>
          <p v-if="passwordSuccess" :class="$style.successText">{{ passwordSuccess }}</p>

          <button type="submit" :class="$style.primaryBtn">{{ passwordSaving ? 'Updating…' : 'Update Password' }}</button>
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
  --text: #000000;
  --muted: #000000;
  --input-bg: #fafafa;
  --input-border: #d4d4d8;
  --primary-bg: #000000;
  --primary-fg: #ffffff;
  --secondary-bg: #000000;
  --secondary-fg: #ffffff;
  --error: #b91c1c;
  --success: #15803d;
}

:global(html.dark) .page {
  --page-bg: #000000;
  --card-bg: #070707;
  --border: rgba(255,255,255,0.30);
  --text: #fafafa;
  --muted: #a1a1aa;
  --input-bg: #111114;
  --input-border: rgba(21, 6, 6, 0.12);
  --primary-bg: #ffffff;
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
