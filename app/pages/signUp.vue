<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, computed, reactive, ref } from 'vue'

definePageMeta({
	alias: ['/signup', '/sign-up', '/register'],
})

const router = useRouter()

const form = reactive({
	username: '',
	phoneNumber: '',
	email: '',
	password: '',
	confirmPassword: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const modelStageRef = ref<HTMLElement | null>(null)
const modelCanvasRef = ref<HTMLCanvasElement | null>(null)
const showModelPanel = ref(false)
const modelLoadError = ref('')

let disposeThreeScene: null | (() => void) = null
let mediaQueryList: MediaQueryList | null = null
let removeMediaQueryListener: null | (() => void) = null
let mountRetryTimer: number | null = null

const canSubmit = computed(() => {
	return Boolean(form.username && form.phoneNumber && form.email && form.password && form.confirmPassword) && !isSubmitting.value
})

const normalizedPhone = computed(() => form.phoneNumber.replace(/[^\d+]/g, ''))
const isPhoneValid = computed(() => /^\+?\d{10,15}$/.test(normalizedPhone.value))

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

	const fillLight = new THREE.DirectionalLight(0xf0f0f0, 0.55)
	fillLight.position.set(-70, -20, 60)
	scene.add(fillLight)

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.45)
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

	const modelPaths = ['/mizomade.stl', '/images/mizomade.stl']

	const onModelLoaded = (geometry: import('three').BufferGeometry) => {
		geometry.computeVertexNormals()
		geometry.center()
		geometry.computeBoundingBox()

		const size = new THREE.Vector3()
		geometry.boundingBox?.getSize(size)
		const largestAxis = Math.max(size.x, size.y, size.z) || 1
		const scale = 118 / largestAxis

		modelMaterial = new THREE.MeshStandardMaterial({
			color: 0xe2e2e2,
			metalness: 0.1,
			roughness: 0.38,
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
		camera.position.set(0, sphere.radius * 0.18, fitDistance * 1.2)
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

	let frameId = 0
	const animate = () => {
		frameId = window.requestAnimationFrame(animate)

		pivot.rotation.y += 0.0085
		pivot.rotation.x = Math.sin(frameId * 0.0035) * 0.05

		renderer.render(scene, camera)
	}

	animate()

	window.addEventListener('resize', resize)
	const resizeObserver = new ResizeObserver(resize)
	resizeObserver.observe(stage)

	disposeThreeScene = () => {
		window.cancelAnimationFrame(frameId)
		window.removeEventListener('resize', resize)
		resizeObserver.disconnect()

		modelGeometry?.dispose()
		modelMaterial?.dispose()
		renderer.dispose()

		modelMesh = null
		modelGeometry = null
		modelMaterial = null
	}
}

const handleSignUp = async () => {
	errorMessage.value = ''
	successMessage.value = ''

	if (!form.username || !form.phoneNumber || !form.email || !form.password || !form.confirmPassword) {
		errorMessage.value = 'Please complete all fields.'
		return
	}

	if (!isPhoneValid.value) {
		errorMessage.value = 'Please enter a valid phone number.'
		return
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
		errorMessage.value = 'Please enter a valid email address.'
		return
	}

	if (form.password.length < 8) {
		errorMessage.value = 'Password must be at least 8 characters.'
		return
	}

	if (form.password !== form.confirmPassword) {
		errorMessage.value = 'Passwords do not match.'
		return
	}

	isSubmitting.value = true

	try {
		const config = useRuntimeConfig()

		await $fetch('/api/v1/user/register/', {
			method: 'POST',
			baseURL: config.public.apiBase,
			body: {
				username: form.username,
				password1: form.password,
				phone: normalizedPhone.value,
				email: form.email,
			},
		})

		successMessage.value = 'Account created successfully. Redirecting to OTP verification...'

		window.setTimeout(() => {
			void router.push({
				path: '/verify-otp',
				query: {
					phone: normalizedPhone.value,
					purpose: 'Registration',
				},
			})
		}, 900)
	} catch (error: unknown) {
		const statusMessage = (error as { statusMessage?: string })?.statusMessage
		const data = (error as { data?: { detail?: string } })?.data
		errorMessage.value = data?.detail || statusMessage || 'Could not create your account. Please try again.'
	} finally {
		isSubmitting.value = false
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
			<div :class="$style.desktopLayout">
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

				<form :class="$style.card" @submit.prevent="handleSignUp">
					<header :class="$style.cardHeader">
						<h1 :class="$style.cardTitle">Register</h1>
						<p :class="$style.cardSubtitle">Sign in below to access your account</p>
					</header>

					<div :class="$style.fields">
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

						<div :class="$style.fieldWrap">
							<input
								id="phone-number"
								v-model="form.phoneNumber"
								type="tel"
								autocomplete="tel"
								placeholder="Phone Number"
								:class="$style.input"
							>
						</div>

						<p
							v-if="form.phoneNumber && isPhoneValid"
							:class="$style.phoneValid"
						>
							Phone Number valid
						</p>

						<div :class="$style.fieldWrap">
							<input
								id="email"
								v-model="form.email"
								type="email"
								autocomplete="email"
								placeholder="Email Address"
								:class="$style.input"
							>
						</div>

						<div :class="$style.fieldWrap">
							<input
								id="password"
								v-model="form.password"
								type="password"
								autocomplete="new-password"
								placeholder="Password"
								:class="$style.input"
							>
						</div>

						<div :class="$style.fieldWrap">
							<input
								id="confirm-password"
								v-model="form.confirmPassword"
								type="password"
								autocomplete="new-password"
								placeholder="Confirm password"
								:class="$style.input"
							>
						</div>
					</div>

					<p v-if="errorMessage" :class="$style.error">{{ errorMessage }}</p>
					<p v-if="successMessage" :class="$style.success">{{ successMessage }}</p>

					<button
						type="submit"
						:disabled="!canSubmit"
						:class="$style.submitBtn"
					>
						{{ isSubmitting ? 'Registering…' : 'Register' }}
					</button>

					<div :class="$style.divider" />

					<p :class="$style.switchRow">
						<span :class="$style.switchText">Already have an account?</span>
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
	color: var(--su-subtitle);
	background: color-mix(in srgb, var(--su-card-bg) 85%, transparent);
	border: 1px solid var(--su-card-border);
	border-radius: 999px;
	padding: 0.45rem 0.8rem;
	backdrop-filter: blur(4px);
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

.phoneValid {
	font-size: 0.8rem;
	color: var(--su-success);
	margin: 0.15rem 0 0.15rem;
}

.error {
	color: var(--su-error);
}

.success {
	color: var(--su-success);
}

.submitBtn {
	width: 100%;
	padding: 0.9rem 1rem;
	background: var(--su-submit-bg);
	color: var(--su-submit-fg);
	font-size: 0.95rem;
	font-weight: 600;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	letter-spacing: 0.01em;
	transition: background-color 0.2s ease, opacity 0.2s ease !important;
}

.submitBtn:hover:not(:disabled) {
	background: var(--su-submit-hover);
}

.submitBtn:disabled {
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
		grid-template-columns: minmax(520px, 1fr) minmax(360px, 420px);
		gap: clamp(1.5rem, 3vw, 3rem);
		justify-content: space-between;
		align-items: center;
	}

	.card {
		justify-self: end;
		max-width: 100%;
		transform: translateX(18px);
	}

	.modelPanel {
		justify-self: stretch;
		width: 100%;
		min-height: clamp(520px, 72vh, 820px);
	}
}

@media (prefers-reduced-motion: reduce) {
	.input {
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
}
</style>
