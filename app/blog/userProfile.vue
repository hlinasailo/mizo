<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { useUserService } from '../services/userService'

type ProfileDraft = {
	username: string
	firstName: string
	phoneNumber: string
	bio: string
	profilePhoto: string | null
}
const userStore = useUserStore()
const router = useRouter()
const userService = useUserService()

const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedPhotoFile = ref<File | null>(null)
const removePhotoOnSave = ref(false)

const form = reactive<ProfileDraft>({
	username: '',
	firstName: '',
	phoneNumber: '',
	bio: '',
	profilePhoto: null,
})

const original = reactive<ProfileDraft>({
	username: '',
	firstName: '',
	phoneNumber: '',
	bio: '',
	profilePhoto: null,
})

const hasPhoto = computed(() => !!form.profilePhoto)
const displayInitial = computed(() => {
	const source = form.username || form.firstName || 'U'
	return source.trim().charAt(0).toUpperCase() || 'U'
})

const applyDraft = (draft: ProfileDraft) => {
	form.username = draft.username
	form.firstName = draft.firstName
	form.phoneNumber = draft.phoneNumber
	form.bio = draft.bio
	form.profilePhoto = draft.profilePhoto

	original.username = draft.username
	original.firstName = draft.firstName
	original.phoneNumber = draft.phoneNumber
	original.bio = draft.bio
	original.profilePhoto = draft.profilePhoto
}

const loadProfileDraft = (): ProfileDraft => {
	return {
		username: userStore.user?.username || '',
		firstName: userStore.user?.first_name || '',
		phoneNumber: userStore.user?.phonenumber || '',
		bio: userStore.user?.bio || '',
		profilePhoto: userStore.user?.profilePhoto || null,
	}
}

const handlePhotoChange = async (event: Event) => {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]

	if (!file) {
		return
	}

	if (!file.type.startsWith('image/')) {
		errorMessage.value = 'Please upload an image file.'
		input.value = ''
		return
	}

	const toDataUrl = () => new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(String(reader.result || ''))
		reader.onerror = () => reject(new Error('Unable to read image file'))
		reader.readAsDataURL(file)
	})

	try {
		errorMessage.value = ''
		form.profilePhoto = await toDataUrl()
		selectedPhotoFile.value = file
		removePhotoOnSave.value = false
	} catch {
		errorMessage.value = 'Could not load image. Please try another one.'
	} finally {
		input.value = ''
	}
}

const removePhoto = () => {
	form.profilePhoto = null
	selectedPhotoFile.value = null
	removePhotoOnSave.value = true
}

const handleCancel = () => {
	applyDraft({ ...original })
	selectedPhotoFile.value = null
	removePhotoOnSave.value = false
	errorMessage.value = ''
	successMessage.value = ''
}

const handleSave = async () => {
	errorMessage.value = ''
	successMessage.value = ''

	if (!form.username.trim()) {
		errorMessage.value = 'Username is required.'
		return
	}

	isSaving.value = true

	try {
		if (!userStore.accessToken || !userStore.user?.id) {
			throw new Error('You need to be logged in to update your profile.')
		}

		await userService.updateProfile(userStore.user.id, {
			username: form.username.trim(),
			first_name: form.firstName.trim(),
			last_name: userStore.user.last_name || '',
			phonenumber: form.phoneNumber.trim(),
			bio: form.bio.trim(),
		}, userStore.accessToken)

		if (selectedPhotoFile.value || removePhotoOnSave.value) {
			const photoForm = new FormData()
			photoForm.append('username', form.username.trim())

			if (selectedPhotoFile.value) {
				photoForm.append('profilephoto', selectedPhotoFile.value)
			} else if (removePhotoOnSave.value) {
				photoForm.append('remove', '1')
			}

			await userService.updateProfilePhoto(userStore.user.id, photoForm, userStore.accessToken)
		}

		await userStore.fetchUser()
		const snapshot = loadProfileDraft()
		applyDraft(snapshot)
		selectedPhotoFile.value = null
		removePhotoOnSave.value = false

		successMessage.value = 'Profile updated successfully.'
	} catch (error: unknown) {
		const statusMessage = (error as { statusMessage?: string })?.statusMessage
		const data = (error as { data?: { detail?: string } | string })?.data
		errorMessage.value = typeof data === 'string'
			? data
			: data?.detail || statusMessage || 'Could not save profile. Please try again.'
	} finally {
		isSaving.value = false
	}
}

onMounted(async () => {
	if (userStore.isAuthenticated && !userStore.user) {
		await userStore.fetchUser()
	}

	applyDraft(loadProfileDraft())
})
</script>

<template>
	<main :class="$style.page">
		<section :class="$style.card">
			<header :class="$style.header">
				<div>
					<p :class="$style.eyebrow">My Profile</p>
					<h1 :class="$style.title">Edit Profile</h1>
					<p :class="$style.subtitle">Update your photo, username and bio.</p>
				</div>

				<button type="button" :class="$style.backBtn" @click="router.push('/dashboard')">
					Back to Dashboard
				</button>
			</header>

			<div :class="$style.photoRow">
				<div :class="$style.photoWrap">
					  <img v-if="hasPhoto" :src="form.profilePhoto || ''" alt="Profile preview" :class="$style.photo">
					<div v-else :class="$style.photoFallback">{{ displayInitial }}</div>
				</div>

				<div :class="$style.photoActions">
					<label :class="$style.secondaryBtn">
						Upload Photo
						<input type="file" accept="image/*" hidden @change="handlePhotoChange">
					</label>
					<button v-if="hasPhoto" type="button" :class="$style.ghostBtn" @click="removePhoto">Remove</button>
				</div>
			</div>

			<form :class="$style.form" @submit.prevent="handleSave">
				<label :class="$style.field">
					<span :class="$style.label">Username</span>
					  <input v-model="form.username" type="text" autocomplete="username" :class="$style.input" placeholder="Enter username">
				</label>

				<label :class="$style.field">
					<span :class="$style.label">Display Name</span>
					  <input v-model="form.firstName" type="text" autocomplete="name" :class="$style.input" placeholder="Enter display name">
				</label>

				<label :class="$style.field">
					<span :class="$style.label">Phone Number (optional)</span>
					  <input v-model="form.phoneNumber" type="tel" autocomplete="tel" :class="$style.input" placeholder="Enter phone number">
				</label>

				<label :class="$style.field">
					<span :class="$style.label">Bio (optional)</span>
					<textarea v-model="form.bio" rows="4" :class="$style.textarea" placeholder="Write a short bio" />
				</label>

				<p v-if="errorMessage" :class="$style.error">{{ errorMessage }}</p>
				<p v-if="successMessage" :class="$style.success">{{ successMessage }}</p>

				<div :class="$style.actions">
					<button type="button" :class="$style.ghostBtn" @click="handleCancel">Cancel</button>
					<button type="submit" :class="$style.primaryBtn" :disabled="isSaving">
						{{ isSaving ? 'Saving…' : 'Save' }}
					</button>
				</div>
			</form>
		</section>
	</main>
</template>

<style module>
:global(:root) {
	--profile-page-bg: #ececee;
	--profile-card-bg: #ffffff;
	--profile-card-border: rgba(24, 24, 27, 0.1);
	--profile-title: #18181b;
	--profile-subtitle: #52525b;
	--profile-input-bg: #fbfbfc;
	--profile-input-border: rgba(24, 24, 27, 0.16);
	--profile-input-focus: #18181b;
	--profile-fg: #18181b;
	--profile-muted: #71717a;
	--profile-primary-bg: #18181b;
	--profile-primary-fg: #fafafa;
	--profile-ghost-bg: #f4f4f5;
	--profile-ghost-fg: #27272a;
	--profile-danger: #b91c1c;
	--profile-success: #1f8f47;
}

:global(html.dark) {
	--profile-page-bg: #050505;
	--profile-card-bg: #141416;
	--profile-card-border: rgba(255, 255, 255, 0.08);
	--profile-title: #fafafa;
	--profile-subtitle: #a1a1aa;
	--profile-input-bg: #18181b;
	--profile-input-border: rgba(255, 255, 255, 0.14);
	--profile-input-focus: #f4f4f5;
	--profile-fg: #f4f4f5;
	--profile-muted: #a1a1aa;
	--profile-primary-bg: #f4f4f5;
	--profile-primary-fg: #09090b;
	--profile-ghost-bg: #1e1e22;
	--profile-ghost-fg: #e4e4e7;
	--profile-danger: #f87171;
	--profile-success: #4ade80;
}

.page {
	min-height: 100vh;
	background: var(--profile-page-bg);
	color: var(--profile-fg);
	padding: 110px 16px 32px;
}

.card {
	max-width: 860px;
	margin: 0 auto;
	background: var(--profile-card-bg);
	border: 1px solid var(--profile-card-border);
	border-radius: 16px;
	padding: 24px;
}

.header {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	align-items: flex-start;
	margin-bottom: 22px;
}

.eyebrow {
	margin: 0;
	color: var(--profile-muted);
	font-size: 0.78rem;
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

.title {
	margin: 6px 0 0;
	font-size: clamp(1.5rem, 3vw, 2rem);
	line-height: 1.1;
}

.subtitle {
	margin: 8px 0 0;
	color: var(--profile-subtitle);
	font-size: 0.92rem;
}

.backBtn {
	border: 1px solid var(--profile-input-border);
	background: transparent;
	color: var(--profile-fg);
	border-radius: 10px;
	padding: 10px 12px;
	font-size: 0.82rem;
	cursor: pointer;
}

.photoRow {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 14px;
	border: 1px solid var(--profile-card-border);
	border-radius: 12px;
	margin-bottom: 20px;
}

.photoWrap {
	width: 76px;
	height: 76px;
	border-radius: 50%;
	overflow: hidden;
	border: 1px solid var(--profile-input-border);
	background: var(--profile-input-bg);
}

.photo {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.photoFallback {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.35rem;
	font-weight: 700;
	color: var(--profile-fg);
}

.photoActions {
	display: flex;
	gap: 10px;
	align-items: center;
	flex-wrap: wrap;
}

.secondaryBtn,
.ghostBtn,
.primaryBtn {
	border-radius: 10px;
	padding: 10px 14px;
	font-size: 0.84rem;
	font-weight: 600;
	border: 1px solid transparent;
	cursor: pointer;
}

.secondaryBtn,
.ghostBtn {
	background: var(--profile-ghost-bg);
	color: var(--profile-ghost-fg);
	border-color: var(--profile-input-border);
}

.primaryBtn {
	background: var(--profile-primary-bg);
	color: var(--profile-primary-fg);
}

.primaryBtn:disabled {
	opacity: 0.55;
	cursor: not-allowed;
}

.form {
	display: grid;
	gap: 12px;
}

.field {
	display: grid;
	gap: 6px;
}

.label {
	font-size: 0.8rem;
	color: var(--profile-muted);
}

.input,
.textarea {
	width: 100%;
	border: 1px solid var(--profile-input-border);
	border-radius: 10px;
	padding: 11px 12px;
	background: var(--profile-input-bg);
	color: var(--profile-fg);
	outline: none;
	font-size: 0.92rem;
}

.input:focus,
.textarea:focus {
	border-color: var(--profile-input-focus);
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--profile-input-focus) 12%, transparent);
}

.textarea {
	resize: vertical;
}

.error {
	color: var(--profile-danger);
	margin: 2px 0;
	font-size: 0.84rem;
}

.success {
	color: var(--profile-success);
	margin: 2px 0;
	font-size: 0.84rem;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 4px;
}

@media (max-width: 640px) {
	.card {
		padding: 16px;
	}

	.header {
		flex-direction: column;
	}

	.photoRow {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
