<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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
const modelStageRef = ref<HTMLElement | null>(null)
const modelCanvasRef = ref<HTMLCanvasElement | null>(null)
const showModelPanel = ref(false)
const modelLoadError = ref('')

let disposeThreeScene: null | (() => void) = null
let mediaQueryList: MediaQueryList | null = null
let removeMediaQueryListener: null | (() => void) = null
let mountRetryTimer: number | null = null

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

const mountThreeScene = async () => {
  if (!import.meta.client) {
    return
  }

  if (mountRetryTimer !== null) {
    window.clearTimeout(mountRetryTimer)
    mountRetryTimer = null
  }

  const isDesktopViewport = window.matchMedia('(min-width: 1024px)').matches
  showModelPanel.value = isDesktopViewport

  if (!isDesktopViewport) {
    modelLoadError.value = ''
    disposeThreeScene?.()
    disposeThreeScene = null
    return
  }

  if (!modelStageRef.value || !modelCanvasRef.value) {
    await nextTick()
  }

  if (!modelStageRef.value || !modelCanvasRef.value) {
    mountRetryTimer = window.setTimeout(() => {
      mountRetryTimer = null
      void mountThreeScene()
    }, 60)
    return
  }

  if (disposeThreeScene) {
    return
  }

  modelLoadError.value = 'Loading 3D model...'

  const THREE = await import('three')
  const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')

  const stage = modelStageRef.value
  const canvas = modelCanvasRef.value

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 1000)
  camera.position.set(0, 8, 180)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
  keyLight.position.set(65, 75, 120)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xe8dfcf, 0.6)
  fillLight.position.set(-70, -20, 60)
  scene.add(fillLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.48)
  scene.add(ambientLight)

  const pivot = new THREE.Group()
  scene.add(pivot)

  let modelMesh: InstanceType<typeof THREE.Mesh> | null = null
  let modelMaterial: InstanceType<typeof THREE.MeshStandardMaterial> | null = null
  let modelGeometry: InstanceType<typeof THREE.BufferGeometry> | null = null

  const loader = new STLLoader()
  const tryLoadModel = (url: string) => new Promise<import('three').BufferGeometry>((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })

  const modelPaths = ['/mizomade.stl']

  const onModelLoaded = (geometry: import('three').BufferGeometry) => {
    geometry.computeVertexNormals()
    geometry.center()
    geometry.computeBoundingBox()

    const size = new THREE.Vector3()
    geometry.boundingBox?.getSize(size)
    const largestAxis = Math.max(size.x, size.y, size.z) || 1
    const scale = 118 / largestAxis

    modelMaterial = new THREE.MeshStandardMaterial({
      color: 0xe9e2d6,
      metalness: 0.12,
      roughness: 0.34,
      side: THREE.DoubleSide,
    })

    modelGeometry = geometry
    modelMesh = new THREE.Mesh(geometry, modelMaterial)
    modelMesh.scale.setScalar(scale)
    modelMesh.rotation.x = 0
    modelMesh.rotation.y = 0
    pivot.add(modelMesh)

    const box = new THREE.Box3().setFromObject(modelMesh)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const fov = camera.fov * (Math.PI / 180)
    const fitDistance = sphere.radius / Math.sin(fov / 2)

    camera.near = Math.max(0.1, fitDistance / 100)
    camera.far = Math.max(1200, fitDistance * 8)
    camera.position.set(0, sphere.radius * 0.28, fitDistance * 1.18)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    modelLoadError.value = ''
  }

  ;(async () => {
    for (const path of modelPaths) {
      try {
        const geometry = await tryLoadModel(path)
        onModelLoaded(geometry)
        return
      } catch {
        // Try next candidate path.
      }
    }

    modelLoadError.value = '3D model could not be loaded.'
  })()

  const resize = () => {
    const width = stage.clientWidth
    const height = stage.clientHeight
    if (!width || !height) {
      return
    }

    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  resize()

  let targetRotateX = 0
  let targetRotateY = 0
  let currentRotateX = 0
  let currentRotateY = 0

  const handlePointerMove = (event: PointerEvent) => {
    const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2
    const normalizedY = (event.clientY / window.innerHeight - 0.5) * 2

    targetRotateY = normalizedX * 0.72
    targetRotateX = -normalizedY * 0.38
  }

  const handlePointerLeave = () => {
    targetRotateX = 0
    targetRotateY = 0
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('blur', handlePointerLeave)
  window.addEventListener('resize', resize)

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage)

  let frameId = 0

  const animate = () => {
    frameId = window.requestAnimationFrame(animate)

    currentRotateX += (targetRotateX - currentRotateX) * 0.14
    currentRotateY += (targetRotateY - currentRotateY) * 0.14

    pivot.rotation.x = currentRotateX
    pivot.rotation.y = currentRotateY

    renderer.render(scene, camera)
  }

  animate()

  disposeThreeScene = () => {
    window.cancelAnimationFrame(frameId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('blur', handlePointerLeave)
    resizeObserver.disconnect()

    modelGeometry?.dispose()
    modelMaterial?.dispose()
    renderer.dispose()

    modelMesh = null
    modelGeometry = null
    modelMaterial = null
  }
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  mediaQueryList = window.matchMedia('(min-width: 1024px)')
  const onMediaChange = () => {
    void mountThreeScene()
  }

  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', onMediaChange)
    removeMediaQueryListener = () => mediaQueryList?.removeEventListener('change', onMediaChange)
  } else {
    mediaQueryList.addListener(onMediaChange)
    removeMediaQueryListener = () => mediaQueryList?.removeListener(onMediaChange)
  }

  void mountThreeScene()
})

onBeforeUnmount(() => {
  if (mountRetryTimer !== null) {
    window.clearTimeout(mountRetryTimer)
    mountRetryTimer = null
  }

  removeMediaQueryListener?.()
  removeMediaQueryListener = null
  mediaQueryList = null

  disposeThreeScene?.()
  disposeThreeScene = null
})
</script>

<template>
  <main :class="$style.page">
    <section :class="$style.section">

      <!-- Already logged in -->
      <div v-if="userStore.isAuthenticated" :class="$style.alreadyCard">
        <p :class="$style.alreadyText">You are already signed in.</p>
        <NuxtLink to="/" :class="$style.alreadyBtn">Go to Home</NuxtLink>
      </div>

      <!-- Login + 3D model split -->
      <div
        v-else
        :class="$style.desktopLayout"
      >
        <form
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

        <aside
          v-if="showModelPanel"
          ref="modelStageRef"
          :class="$style.modelPanel"
          aria-label="3D Mizomade model preview"
        >
          <canvas
            ref="modelCanvasRef"
            :class="$style.modelCanvas"
          />
          <p
            v-if="modelLoadError"
            :class="$style.modelError"
          >
            {{ modelLoadError }}
          </p>
        </aside>
      </div>

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

.desktopLayout {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: stretch;
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
  justify-self: center;
}

.modelPanel {
  min-height: 560px;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
  position: relative;
}

.modelCanvas {
  width: 100%;
  height: 100%;
  display: block;
}

.modelError {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--lg-subtitle);
  background: color-mix(in srgb, var(--lg-card-bg) 85%, transparent);
  border: 1px solid var(--lg-card-border);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  backdrop-filter: blur(4px);
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

@media (min-width: 1024px) {
  .desktopLayout {
    grid-template-columns: minmax(360px, 420px) minmax(520px, 1fr);
    gap: clamp(1.5rem, 3vw, 3rem);
    justify-content: space-between;
    align-items: center;
  }

  .card {
    justify-self: start;
    max-width: 100%;
  }

  .modelPanel {
    justify-self: stretch;
    width: 100%;
    min-height: clamp(520px, 72vh, 820px);
  }
}
</style>