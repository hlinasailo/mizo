<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({
  alias: ['/otp', '/otp-verification', '/verify-otp'],
})

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

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
    const res = await $fetch<{ message?: string }>('/api/v1/user/verify_otp/', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: {
        phone: normalizedPhone.value,
        otp_value: form.otp.trim(),
        purpose: form.purpose || 'Registration',
      },
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
    const res = await $fetch<{ message?: string }>('/api/v1/user/resendotp/', {
      method: 'POST',
      baseURL: config.public.apiBase,
      body: {
        phone: normalizedPhone.value,
        purpose: form.purpose || 'Registration',
      },
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
  <main class="otp-page">
    <section class="otp-card">
      <h1>Verify OTP</h1>
      <p class="subtitle">Enter the code sent to your phone.</p>

      <form class="otp-form" @submit.prevent="handleVerifyOtp">
        <input
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          placeholder="Phone Number"
        >

        <input
          v-model="form.otp"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="OTP Code"
        >

        <input
          v-model="form.purpose"
          type="text"
          placeholder="Purpose (e.g. Registration)"
        >

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>

        <button type="submit" :disabled="!canVerify">
          {{ isSubmitting ? 'Verifying…' : 'Verify OTP' }}
        </button>

        <button type="button" class="secondary" :disabled="isResending" @click="handleResendOtp">
          {{ isResending ? 'Resending…' : 'Resend OTP' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.otp-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f5f5f5;
  padding: 1rem;
}
.otp-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1.5rem;
}
h1 {
  margin: 0 0 0.25rem;
}
.subtitle {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.9rem;
}
.otp-form {
  display: grid;
  gap: 0.75rem;
}
input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 0.95rem;
}
button {
  padding: 0.8rem 0.9rem;
  border: none;
  border-radius: 8px;
  background: #111;
  color: #fff;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button.secondary {
  background: #444;
}
.error {
  color: #c0392b;
  font-size: 0.85rem;
}
.success {
  color: #1e8a4f;
  font-size: 0.85rem;
}
</style>