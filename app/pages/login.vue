<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const router    = useRouter()

const form = reactive({
  username:   '',
  password:   '',
  rememberMe: false,
})

const isSubmitting = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  if (!form.username || !form.password) {
    errorMessage.value = 'Please enter both username and password.'
    return
  }

  isSubmitting.value = true

  try {
    await userStore.login(form.username, form.password)
    await userStore.fetchUser()

    const redirectCookie = useCookie<string | null>('redirect_after_login')
    const redirectPath   = redirectCookie.value || '/'
    redirectCookie.value = null

    await router.push(redirectPath)
  } catch (error: unknown) {
    const statusMessage = (error as { statusMessage?: string })?.statusMessage
    const data          = (error as { data?: { detail?: string } })?.data
    errorMessage.value  = data?.detail || statusMessage || 'Invalid credentials. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main :class="$style.page">
    <section :class="$style.section">

      <!-- Already logged in -->
      <div v-if="userStore.isAuthenticated" :class="$style.alreadyCard">
        <p :class="$style.alreadyText">You are already signed in.</p>
        <NuxtLink to="/" :class="$style.alreadyBtn">Go to Home</NuxtLink>
      </div>

      <!-- Login card -->
      <form
        v-else
        :class="$style.card"
        @submit.prevent="handleLogin"
      >
        <!-- Header -->
        <div :class="$style.cardHeader">
          <h1 :class="$style.cardTitle">Sign in</h1>
          <p :class="$style.cardSubtitle">Sign in below to access your account</p>
        </div>

        <!-- Fields -->
        <div :class="$style.fields">
          <!-- Username -->
          <div :class="$style.fieldWrap">
            <input
              id="username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              placeholder="Username"
              :class="$style.input"
            >
          </div>

          <!-- Password -->
          <div :class="$style.fieldWrap">
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="Password"
              :class="$style.input"
            >
          </div>
        </div>

        <!-- Error -->
        <p v-if="errorMessage" :class="$style.error">{{ errorMessage }}</p>

        <!-- Extras row -->
        <div :class="$style.extras">
          <label :class="$style.rememberLabel">
            <input
              v-model="form.rememberMe"
              type="checkbox"
              :class="$style.checkbox"
            >
            <span>Remember me</span>
          </label>
          <button type="button" :class="$style.forgotBtn">Forgot Password?</button>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isSubmitting"
          :class="$style.submitBtn"
        >
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>

        <!-- Divider -->
        <div :class="$style.divider" />

        <!-- Sign up link -->
        <p :class="$style.signupRow">
          <span :class="$style.signupText">Don't have an account yet?</span>
          <NuxtLink to="/signup" :class="$style.signupLink">Sign up</NuxtLink>
        </p>
      </form>

    </section>
  </main>
</template>

<style module>
/* ── Tokens ─────────────────────────────────────────────────
   Navbar toggle sets/removes `dark` on <html>.
   Light = :root  |  Dark = html.dark                       */
:global(:root) {
  --lg-page-bg:      #efefef;
  --lg-card-bg:      #ffffff;
  --lg-card-border:  rgba(0,0,0,0.08);
  --lg-card-shadow:  0 4px 32px rgba(0,0,0,0.10);
  --lg-title:        #111110;
  --lg-subtitle:     #888884;
  --lg-input-bg:     #f5f4f2;
  --lg-input-border: #e0deda;
  --lg-input-focus:  #111110;
  --lg-input-text:   #111110;
  --lg-input-ph:     #aaa9a5;
  --lg-extras-fg:    #888884;
  --lg-extras-hover: #111110;
  --lg-submit-bg:    #111110;
  --lg-submit-fg:    #ffffff;
  --lg-submit-hover: #2c2c2a;
  --lg-divider:      #e8e7e4;
  --lg-signup-muted: #888884;
  --lg-signup-link:  #111110;
  --lg-error:        #c0392b;
}
:global(html.dark) {
  --lg-page-bg:      #0a0a0a;
  --lg-card-bg:      #161616;
  --lg-card-border:  rgba(255,255,255,0.08);
  --lg-card-shadow:  0 4px 40px rgba(0,0,0,0.55);
  --lg-title:        #f0ede8;
  --lg-subtitle:     rgba(240,237,232,0.45);
  --lg-input-bg:     #1e1e1e;
  --lg-input-border: rgba(255,255,255,0.10);
  --lg-input-focus:  rgba(240,237,232,0.80);
  --lg-input-text:   #f0ede8;
  --lg-input-ph:     rgba(240,237,232,0.28);
  --lg-extras-fg:    rgba(240,237,232,0.40);
  --lg-extras-hover: #f0ede8;
  --lg-submit-bg:    #f0ede8;
  --lg-submit-fg:    #0a0a0a;
  --lg-submit-hover: #d8d4ce;
  --lg-divider:      rgba(255,255,255,0.07);
  --lg-signup-muted: rgba(240,237,232,0.40);
  --lg-signup-link:  #f0ede8;
  --lg-error:        #e74c3c;
}

/* ── Smooth transitions ─────────────────────────────────── */
:global(*) {
  transition:
    background-color 0.35s ease,
    border-color     0.35s ease,
    color            0.35s ease,
    box-shadow       0.35s ease;
}

/* ── Page ───────────────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: var(--lg-page-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.25rem 4rem;
}

.section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Card ───────────────────────────────────────────────── */
.card {
  width: 100%;
  max-width: 420px;
  background: var(--lg-card-bg);
  border: 1px solid var(--lg-card-border);
  border-radius: 16px;
  box-shadow: var(--lg-card-shadow);
  padding: 2.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Header ─────────────────────────────────────────────── */
.cardHeader { text-align: center; margin-bottom: 2rem; }

.cardTitle {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--lg-title);
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
}

.cardSubtitle {
  font-size: 0.875rem;
  color: var(--lg-subtitle);
  font-weight: 400;
}

/* ── Fields ─────────────────────────────────────────────── */
.fields     { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.fieldWrap  { position: relative; }

.input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--lg-input-bg);
  border: 1.5px solid var(--lg-input-border);
  border-radius: 8px;
  color: var(--lg-input-text);
  font-size: 0.925rem;
  outline: none;
  /* override global * transition */
  transition:
    border-color 0.2s ease,
    box-shadow   0.2s ease,
    background-color 0.35s ease,
    color 0.35s ease !important;
}
.input::placeholder { color: var(--lg-input-ph); }
.input:focus {
  border-color: var(--lg-input-focus);
  box-shadow: 0 0 0 3px rgba(17,17,16,0.08);
}
:global(html.dark) .input:focus {
  box-shadow: 0 0 0 3px rgba(240,237,232,0.08);
}

/* ── Extras row ─────────────────────────────────────────── */
.extras {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.rememberLabel {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  color: var(--lg-extras-fg);
  cursor: pointer;
  user-select: none;
}
.rememberLabel:hover { color: var(--lg-extras-hover); }

.checkbox {
  width: 0.875rem;
  height: 0.875rem;
  accent-color: var(--lg-title);
  cursor: pointer;
}

.forgotBtn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8rem;
  color: var(--lg-extras-fg);
  cursor: pointer;
}
.forgotBtn:hover { color: var(--lg-extras-hover); text-decoration: underline; }

/* ── Error ──────────────────────────────────────────────── */
.error {
  font-size: 0.8rem;
  color: var(--lg-error);
  margin-bottom: 0.75rem;
  text-align: center;
}

/* ── Submit button ──────────────────────────────────────── */
.submitBtn {
  width: 100%;
  padding: 0.9rem 1rem;
  background: var(--lg-submit-bg);
  color: var(--lg-submit-fg);
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background-color 0.2s ease, opacity 0.2s ease !important;
}
.submitBtn:hover:not(:disabled) { background: var(--lg-submit-hover); }
.submitBtn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Divider ────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: var(--lg-divider);
  margin: 1.75rem 0 1.5rem;
}

/* ── Sign up row ────────────────────────────────────────── */
.signupRow {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.signupText { font-size: 0.875rem; color: var(--lg-signup-muted); }
.signupLink {
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--lg-signup-link);
  text-decoration: none;
}
.signupLink:hover { text-decoration: underline; text-underline-offset: 3px; }

/* ── Already authenticated card ────────────────────────── */
.alreadyCard {
  background: var(--lg-card-bg);
  border: 1px solid var(--lg-card-border);
  border-radius: 16px;
  box-shadow: var(--lg-card-shadow);
  padding: 2.5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
}
.alreadyText { color: var(--lg-subtitle); font-size: 0.95rem; }
.alreadyBtn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--lg-submit-bg);
  color: var(--lg-submit-fg);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s ease !important;
}
.alreadyBtn:hover { background: var(--lg-submit-hover); }
</style>