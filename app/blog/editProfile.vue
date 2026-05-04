<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import AppFooter from '~/components/AppFooter.vue'
import { useAuthService } from '~/services/authService'
import { useUserStore } from '~/stores/user'
import { resolveMediaUrl } from '~/utils/mediaUrl'
import { useUserService } from '../services/userService'

definePageMeta({
  middleware: 'auth',
})

type ProfileDraft = {
  username: string
  firstName: string
  lastName: string
  phoneNumber: string
  bio: string
  profilePhoto: string | null
  coverPhoto: string | null
}

const userStore = useUserStore()
const router = useRouter()
const authService = useAuthService()
const userService = useUserService()

const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isRepairingProfilePhoto = ref(false)
const isRepairingCoverPhoto = ref(false)
const hasTriedRepairProfile = ref(false)
const hasTriedRepairCover = ref(false)

const selectedPhotoFile = ref<File | null>(null)
const removePhotoOnSave = ref(false)
const selectedCoverFile = ref<File | null>(null)
const removeCoverOnSave = ref(false)
const isUsernameEditable = ref(false)
const usernameCheckState = ref<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle')
const usernameCheckMessage = ref('')

type CropTarget = 'avatar' | 'cover'
const showCropPopup = ref(false)
const cropImageSrc = ref('')
const cropAspect = ref<number | null>(1)
const cropTarget = ref<CropTarget>('avatar')
const cropperRef = ref<{ getResult?: () => { canvas?: HTMLCanvasElement | null; image?: HTMLImageElement | null } } | null>(null)

let cropResolve: ((result: string | null) => void) | null = null
let cropObjectUrl: string | null = null
let profilePreviewObjectUrl: string | null = null
let coverPreviewObjectUrl: string | null = null
let usernameCheckTimer: ReturnType<typeof globalThis.setTimeout> | null = null
let usernameCheckRequestId = 0

const form = reactive<ProfileDraft>({
  username: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  bio: '',
  profilePhoto: null,
  coverPhoto: null,
})

const original = reactive<ProfileDraft>({
  username: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  bio: '',
  profilePhoto: null,
  coverPhoto: null,
})

const displayInitial = computed(() => {
  const source = form.firstName || form.lastName || form.username || 'U'
  return source.trim().charAt(0).toUpperCase() || 'U'
})

const renderImageSrc = (url: string | null): string => resolveMediaUrl(url) || ''

const isUsernameChanged = computed(() => {
  const current = form.username.trim().toLowerCase()
  const baseline = original.username.trim().toLowerCase()
  return current !== baseline
})

const clearUsernameCheckTimer = () => {
  if (usernameCheckTimer !== null) {
    globalThis.clearTimeout(usernameCheckTimer)
    usernameCheckTimer = null
  }
}

const resetUsernameCheck = () => {
  clearUsernameCheckTimer()
  usernameCheckState.value = 'idle'
  usernameCheckMessage.value = ''
}

const checkUsernameAvailabilityNow = async (username: string) => {
  const result = await authService.checkUsernameAvailability(username)
  const [code, message] = result || []
  return {
    available: code !== 0,
    message: String(message || ''),
  }
}

const validateUsername = (username: string) => {
  const trimmed = username.trim()
  clearUsernameCheckTimer()

  if (!isUsernameEditable.value || !isUsernameChanged.value) {
    resetUsernameCheck()
    return
  }

  if (!trimmed) {
    usernameCheckState.value = 'error'
    usernameCheckMessage.value = 'Username is required.'
    return
  }

  if (trimmed.length < 3) {
    usernameCheckState.value = 'error'
    usernameCheckMessage.value = 'Username must be at least 3 characters.'
    return
  }

  usernameCheckState.value = 'checking'
  usernameCheckMessage.value = 'Checking username...'

  const requestId = ++usernameCheckRequestId
  usernameCheckTimer = globalThis.setTimeout(async () => {
    usernameCheckTimer = null
    try {
      const { available, message } = await checkUsernameAvailabilityNow(trimmed)
      if (requestId !== usernameCheckRequestId) {
        return
      }

      if (!available) {
        usernameCheckState.value = 'unavailable'
        usernameCheckMessage.value = message || 'Username not available.'
        return
      }

      usernameCheckState.value = 'available'
      usernameCheckMessage.value = message || 'Username available.'
    } catch (error: unknown) {
      if (requestId !== usernameCheckRequestId) {
        return
      }

      usernameCheckState.value = 'error'
      const statusMessage = (error as { statusMessage?: string })?.statusMessage
      const data = (error as { data?: { detail?: string } | string })?.data
      usernameCheckMessage.value = typeof data === 'string'
        ? data
        : data?.detail || statusMessage || 'Could not validate username.'
    }
  }, 500)
}

watch(
  () => form.username,
  (username) => {
    validateUsername(username)
  },
)

const enableUsernameEdit = () => {
  if (isUsernameEditable.value) {
    return
  }

  isUsernameEditable.value = true
  if (isUsernameChanged.value) {
    validateUsername(form.username)
  }
}

const applyDraft = (draft: ProfileDraft) => {
  Object.assign(form, draft)
  Object.assign(original, draft)
}

const loadProfileDraft = (): ProfileDraft => ({
  username: userStore.user?.username || '',
  firstName: userStore.user?.first_name || '',
  lastName: userStore.user?.last_name || '',
  phoneNumber: userStore.user?.phonenumber || '',
  bio: userStore.user?.bio || '',
  profilePhoto: userStore.user?.profilePhoto || null,
  coverPhoto: userStore.user?.coverPhoto || null,
})

const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
  const blob = await fetch(dataUrl).then(r => r.blob())
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' })
}

const getErrorText = (error: unknown): string => {
  const statusMessage = (error as { statusMessage?: string })?.statusMessage
  const data = (error as { data?: { detail?: string } | string })?.data
  return typeof data === 'string'
    ? data
    : data?.detail || statusMessage || ''
}

const isMissingProfilePhotoStorageError = (error: unknown): boolean => {
  const text = getErrorText(error)
  return /File does not exist:\s*profilephoto\//i.test(text)
}

const createFallbackAvatarFile = async (): Promise<File> => {
  if (!import.meta.client) {
    return new File([''], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })
  }

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, size, size)
  }

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (result) => resolve(result || new Blob([], { type: 'image/jpeg' })),
      'image/jpeg',
      0.9,
    )
  })

  return new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })
}

const createFallbackCoverFile = async (): Promise<File> => {
  if (!import.meta.client) {
    return new File([''], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' })
  }

  const width = 960
  const height = 540
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, width, height)
  }

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (result) => resolve(result || new Blob([], { type: 'image/jpeg' })),
      'image/jpeg',
      0.9,
    )
  })

  return new File([blob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' })
}

const tryRepairProfilePhoto = async () => {
  if (isRepairingProfilePhoto.value || hasTriedRepairProfile.value) {
    return
  }

  if (!userStore.accessToken || !userStore.user?.id || !userStore.user?.username) {
    form.profilePhoto = null
    return
  }

  isRepairingProfilePhoto.value = true
  hasTriedRepairProfile.value = true

  try {
    const repairForm = new FormData()
    repairForm.append('username', userStore.user.username)
    repairForm.append('profilephoto', await createFallbackAvatarFile())
    const repairRes = await userService.updateProfilePhoto(userStore.user.id, repairForm, userStore.accessToken) as { url?: string }
    const resolved = repairRes?.url || null

    form.profilePhoto = resolved
    userStore.updateLocalProfile({ profilePhoto: resolved })
  } catch {
    form.profilePhoto = null
  } finally {
    isRepairingProfilePhoto.value = false
  }
}

const tryRepairCoverPhoto = async () => {
  if (isRepairingCoverPhoto.value || hasTriedRepairCover.value) {
    return
  }

  if (!userStore.accessToken || !userStore.user?.id || !userStore.user?.username) {
    form.coverPhoto = null
    return
  }

  isRepairingCoverPhoto.value = true
  hasTriedRepairCover.value = true

  try {
    const repairForm = new FormData()
    repairForm.append('username', userStore.user.username)
    repairForm.append('coverphoto', await createFallbackCoverFile())
    const repairRes = await userService.updateCoverPhoto(userStore.user.id, repairForm, userStore.accessToken) as { url?: string }
    const resolved = repairRes?.url || null

    form.coverPhoto = resolved
    userStore.updateLocalProfile({ coverPhoto: resolved })
  } catch {
    form.coverPhoto = null
  } finally {
    isRepairingCoverPhoto.value = false
  }
}

const onProfileImageError = () => {
  if (selectedPhotoFile.value || removePhotoOnSave.value) {
    return
  }

  void tryRepairProfilePhoto()
}

const onCoverImageError = () => {
  if (selectedCoverFile.value || removeCoverOnSave.value) {
    return
  }

  void tryRepairCoverPhoto()
}

const handlePhotoChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file.'
    input.value = ''
    return
  }
  try {
    errorMessage.value = ''
    const cropped = await openCropModal(file, 'avatar', 1)
    if (!cropped) return

    const croppedFile = await dataUrlToFile(cropped, `avatar-${Date.now()}.jpg`)
    selectedPhotoFile.value = croppedFile
    removePhotoOnSave.value = false

    if (profilePreviewObjectUrl) {
      URL.revokeObjectURL(profilePreviewObjectUrl)
      profilePreviewObjectUrl = null
    }
    profilePreviewObjectUrl = URL.createObjectURL(croppedFile)
    form.profilePhoto = profilePreviewObjectUrl
  } catch {
    errorMessage.value = 'Could not load image. Please try another one.'
  } finally {
    input.value = ''
  }
}

const handleCoverChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file.'
    input.value = ''
    return
  }
  try {
    errorMessage.value = ''
    const cropped = await openCropModal(file, 'cover', 16 / 9)
    if (!cropped) return

    const croppedFile = await dataUrlToFile(cropped, `cover-${Date.now()}.jpg`)
    selectedCoverFile.value = croppedFile
    removeCoverOnSave.value = false

    if (coverPreviewObjectUrl) {
      URL.revokeObjectURL(coverPreviewObjectUrl)
      coverPreviewObjectUrl = null
    }
    coverPreviewObjectUrl = URL.createObjectURL(croppedFile)
    form.coverPhoto = coverPreviewObjectUrl
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

  if (profilePreviewObjectUrl) {
    URL.revokeObjectURL(profilePreviewObjectUrl)
    profilePreviewObjectUrl = null
  }
}

const removeCover = () => {
  form.coverPhoto = null
  selectedCoverFile.value = null
  removeCoverOnSave.value = true
  successMessage.value = ''
  errorMessage.value = 'Cover photo removal is not supported by the current API. Please upload a new cover photo instead.'

  if (coverPreviewObjectUrl) {
    URL.revokeObjectURL(coverPreviewObjectUrl)
    coverPreviewObjectUrl = null
  }
}



const finalizeCrop = (result: string | null) => {
  showCropPopup.value = false
  cropImageSrc.value = ''

  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl)
    cropObjectUrl = null
  }

  cropResolve?.(result)
  cropResolve = null
}

const openCropModal = async (file: File, target: CropTarget, aspect: number | null) => {
  if (!import.meta.client) return null
  if (!file.type.startsWith('image/')) return null

  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl)
  }

  cropObjectUrl = URL.createObjectURL(file)
  cropImageSrc.value = cropObjectUrl
  cropTarget.value = target
  cropAspect.value = aspect
  showCropPopup.value = true

  return new Promise<string | null>((resolve) => {
    cropResolve = resolve
  })
}

const setCropAspect = (value: number | null) => {
  cropAspect.value = value
}

const applyCrop = () => {
  const resultData = cropperRef.value?.getResult?.()
  const canvas = resultData?.canvas ?? null

  if (!canvas) {
    finalizeCrop(null)
    return
  }

  let result = canvas.toDataURL('image/jpeg', 0.92)

  if (!result || canvas.width === 0 || canvas.height === 0) {
    const imageEl = resultData?.image
    if (imageEl && imageEl.naturalWidth > 0 && imageEl.naturalHeight > 0) {
      const fallbackCanvas = document.createElement('canvas')
      fallbackCanvas.width = imageEl.naturalWidth
      fallbackCanvas.height = imageEl.naturalHeight
      const ctx = fallbackCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(imageEl, 0, 0)
        result = fallbackCanvas.toDataURL('image/jpeg', 0.92)
      }
    }
  }

  finalizeCrop(result)
}

const closeCrop = () => {
  finalizeCrop(null)
}

const handleCancel = () => {
  applyDraft({ ...original })
  isUsernameEditable.value = false
  resetUsernameCheck()
  selectedPhotoFile.value = null
  removePhotoOnSave.value = false
  selectedCoverFile.value = null
  removeCoverOnSave.value = false
  errorMessage.value = ''
  successMessage.value = ''
}

const handleSave = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const trimmedUsername = form.username.trim()

  if (!trimmedUsername) {
    errorMessage.value = 'Username is required.'
    return
  }

  isSaving.value = true

  try {
    userStore.ensureUserIdFromToken()

    if (!userStore.accessToken || !userStore.user?.id) {
      throw new Error('You need to be logged in to update your profile.')
    }

    if (isUsernameChanged.value) {
      clearUsernameCheckTimer()
      usernameCheckState.value = 'checking'
      usernameCheckMessage.value = 'Checking username...'

      const { available, message } = await checkUsernameAvailabilityNow(trimmedUsername)
      if (!available) {
        usernameCheckState.value = 'unavailable'
        usernameCheckMessage.value = message || 'Username not available.'
        errorMessage.value = usernameCheckMessage.value
        return
      }

      usernameCheckState.value = 'available'
      usernameCheckMessage.value = message || 'Username available.'
    }

    const mediaUsername = trimmedUsername
    const currentUsername = (userStore.user?.username || '').trim()
    let nextProfilePhoto = form.profilePhoto
    let nextCoverPhoto = form.coverPhoto

    const profilePayload = {
      username: trimmedUsername,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      bio: form.bio.trim(),
    }

    try {
      await userService.updateProfile(userStore.user.id, profilePayload, userStore.accessToken)
    } catch (error: unknown) {
      if (!isMissingProfilePhotoStorageError(error) || !currentUsername) {
        throw error
      }

      const repairForm = new FormData()
      repairForm.append('username', currentUsername)
      repairForm.append('profilephoto', await createFallbackAvatarFile())
      const repairResponse = await userService.updateProfilePhoto(userStore.user.id, repairForm, userStore.accessToken) as { url?: string }
      nextProfilePhoto = repairResponse?.url || nextProfilePhoto

      await userService.updateProfile(userStore.user.id, profilePayload, userStore.accessToken)
    }

    if (selectedPhotoFile.value) {
      const photoForm = new FormData()
      photoForm.append('username', mediaUsername)
      photoForm.append('profilephoto', selectedPhotoFile.value)
      const photoRes = await userService.updateProfilePhoto(userStore.user.id, photoForm, userStore.accessToken) as { url?: string }
      nextProfilePhoto = photoRes?.url || nextProfilePhoto
    }

    if (selectedCoverFile.value) {
      const coverForm = new FormData()
      coverForm.append('username', mediaUsername)
      coverForm.append('coverphoto', selectedCoverFile.value)
      const coverRes = await userService.updateCoverPhoto(userStore.user.id, coverForm, userStore.accessToken) as { url?: string }
      nextCoverPhoto = coverRes?.url || nextCoverPhoto
    }

    if (removePhotoOnSave.value) {
      const photoForm = new FormData()
      photoForm.append('username', mediaUsername)
      photoForm.append('remove', '1')
      await userService.updateProfilePhoto(userStore.user.id, photoForm, userStore.accessToken)
    }

    if (removeCoverOnSave.value) {
      // Backend endpoint does not support cover removal payload yet.
      removeCoverOnSave.value = false
    }

    userStore.updateLocalProfile({
      username: trimmedUsername,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phonenumber: form.phoneNumber.trim() || null,
      bio: form.bio.trim(),
      profilePhoto: nextProfilePhoto,
      coverPhoto: nextCoverPhoto,
    })

    applyDraft(loadProfileDraft())
    selectedPhotoFile.value = null
    removePhotoOnSave.value = false
    selectedCoverFile.value = null
    removeCoverOnSave.value = false
    isUsernameEditable.value = false
    resetUsernameCheck()
    successMessage.value = 'Profile updated successfully.'
  } catch (error: unknown) {
    errorMessage.value = getErrorText(error) || 'Could not save profile. Please try again.'
  } finally {
    isSaving.value = false
  }
}

const handleBack = () => {
  if (window.history.length > 1) { router.back(); return }
  router.push('/dashboard')
}

onMounted(async () => {
  if (userStore.isAuthenticated && userStore.user && !userStore.user.id) {
    userStore.ensureUserIdFromToken()
  }

  if (userStore.isAuthenticated && !userStore.user) {
    await userStore.fetchUser()
  }
  applyDraft(loadProfileDraft())
  
  isUsernameEditable.value = false
  resetUsernameCheck()
})

onBeforeUnmount(() => {
  clearUsernameCheckTimer()

  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl)
    cropObjectUrl = null
  }

  if (profilePreviewObjectUrl) {
    URL.revokeObjectURL(profilePreviewObjectUrl)
    profilePreviewObjectUrl = null
  }

  if (coverPreviewObjectUrl) {
    URL.revokeObjectURL(coverPreviewObjectUrl)
    coverPreviewObjectUrl = null
  }
})
</script>

<template>
  <main :class="$style.page">
    <div :class="$style.gridBg" />

    <section :class="$style.wrapper">

      <!-- Back button — borderless -->
      <button type="button" :class="$style.backBtn" @click="handleBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </button>

      <div :class="$style.card">

        <!-- Cover photo -->
        <div :class="$style.coverWrap">
          <div :class="$style.coverPreview">
            <img v-if="form.coverPhoto" :src="renderImageSrc(form.coverPhoto)" alt="Cover" :class="$style.coverImg" @error="onCoverImageError">
            <div v-else :class="$style.coverEmpty" />
          </div>
          <div :class="$style.coverOverlay">
            <label :class="$style.textBtn">
              Edit
              <input type="file" accept="image/*" hidden @change="handleCoverChange">
            </label>
            <button v-if="form.coverPhoto" type="button" :class="$style.textBtn" @click="removeCover">x</button>
          </div>

          <!-- Avatar overlapping cover -->
          <div :class="$style.avatarWrap">
            <div :class="$style.avatar">
              <img v-if="form.profilePhoto" :src="renderImageSrc(form.profilePhoto)" alt="Avatar" :class="$style.avatarImg" @error="onProfileImageError">
              <span v-else :class="$style.avatarInitial">{{ displayInitial }}</span>
            </div>
            <div :class="$style.avatarActions">
              <label :class="$style.avatarEditBtn">
                Edit
                <input type="file" accept="image/*" hidden @change="handlePhotoChange">
              </label>
              <button v-if="form.profilePhoto" type="button" :class="$style.avatarRemoveBtn" @click="removePhoto">x</button>
            </div>
          </div>
        </div>

        <!-- Header text -->
        <div :class="$style.headerText">
          <p :class="$style.eyebrow">My Profile</p>
          <h1 :class="$style.title">Edit Profile</h1>
          <p :class="$style.subtitle">Update your photo and personal details.</p>
        </div>

        <!-- Form -->
        <form :class="$style.form" @submit.prevent="handleSave">

          <!-- Username -->
          <div :class="$style.field">
            <span :class="$style.label">Username</span>
            <div :class="$style.usernameRow">
              <input
                v-model="form.username"
                type="text"
                autocomplete="username"
                :class="[$style.input, !isUsernameEditable ? $style.inputReadonly : '']"
                :readonly="!isUsernameEditable"
                :disabled="!isUsernameEditable"
              >
              <button
                type="button"
                :class="$style.usernameEditBtn"
                @click="enableUsernameEdit"
              >
                {{ isUsernameEditable ? 'Editing' : 'Edit' }}
              </button>
            </div>
            <small :class="$style.helper">Click Edit to change username.</small>
            <p
              v-if="isUsernameEditable && form.username.trim()"
              :class="[
                $style.usernameStatus,
                usernameCheckState === 'available' ? $style.usernameStatusAvailable : '',
                usernameCheckState === 'unavailable' || usernameCheckState === 'error' ? $style.usernameStatusError : '',
                usernameCheckState === 'checking' ? $style.usernameStatusChecking : '',
              ]"
            >
              {{ usernameCheckMessage || (isUsernameChanged ? '' : 'Current username') }}
            </p>
          </div>

          <!-- First + Last name -->
          <div :class="$style.row">
            <div :class="$style.field">
              <span :class="$style.label">First Name</span>
              <input v-model="form.firstName" type="text" autocomplete="given-name" :class="$style.input" placeholder="First name">
            </div>
            <div :class="$style.field">
              <span :class="$style.label">Last Name</span>
              <input v-model="form.lastName" type="text" autocomplete="family-name" :class="$style.input" placeholder="Last name">
            </div>
          </div>

          <!-- Bio -->
          <div :class="$style.field">
            <span :class="$style.label">Bio</span>
            <textarea v-model="form.bio" :class="$style.textarea" rows="4" placeholder="Tell the world a little about yourself…" />
          </div>

          <p v-if="errorMessage" :class="$style.error">{{ errorMessage }}</p>
          <p v-if="successMessage" :class="$style.success">{{ successMessage }}</p>

          <div :class="$style.actions">
            <button type="button" :class="$style.ghostBtn" @click="handleCancel">Cancel</button>
            <button type="submit" :class="$style.primaryBtn" :disabled="isSaving">
              {{ isSaving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>

        </form>
      </div>
    </section>

    <section :class="$style.footerSection">
      <AppFooter />
    </section>

    <div v-if="showCropPopup" :class="$style.cropOverlay" @click.self="closeCrop">
      <div :class="$style.cropPopup" role="dialog" aria-modal="true" aria-label="Crop image">
        <div :class="$style.cropTop">
          <h3 :class="$style.cropHeading">Crop {{ cropTarget === 'avatar' ? 'avatar' : 'cover photo' }}</h3>
          <button type="button" :class="$style.cropCloseBtn" title="Close" @click="closeCrop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div :class="$style.cropStage">
          <Cropper
            ref="cropperRef"
            :src="cropImageSrc"
            image-restriction="fit-area"
            :stencil-props="cropAspect ? { aspectRatio: cropAspect } : {}"
            :class="$style.cropperControl"
          />
        </div>

        <div :class="$style.cropTools">
          <span :class="$style.cropToolsLabel">Aspect:</span>
          <button type="button" :class="$style.cropToolBtn" @click="setCropAspect(null)">Free</button>
          <button type="button" :class="$style.cropToolBtn" @click="setCropAspect(16 / 9)">16:9</button>
          <button type="button" :class="$style.cropToolBtn" @click="setCropAspect(1)">1:1</button>
        </div>

        <div :class="$style.cropActions">
          <button type="button" :class="$style.cropApplyBtn" @click="applyCrop">Use Crop</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style module>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:global(:root) {
  --ep-bg: #f0f0f2;
  --ep-card: #ffffff;
  --ep-border: rgba(24,24,27,0.1);
  --ep-border-strong: rgba(24,24,27,0.18);
  --ep-text: #18181b;
  --ep-muted: #71717a;
  --ep-input-bg: #fafafa;
  --ep-input-border: #d4d4d8;
  --ep-input-focus: #18181b;
  --ep-primary-bg: #18181b;
  --ep-primary-fg: #ffffff;
  --ep-ghost-bg: transparent;
  --ep-ghost-fg: #18181b;
  --ep-ghost-border: rgba(24,24,27,0.2);
  --ep-danger: #b91c1c;
  --ep-success: #15803d;
  --ep-cover-h: 200px;
  --ep-avatar-size: 88px;
}

:global(html.dark) {
  --ep-bg: #000000;
  --ep-card: #111113;
  --ep-border: rgba(255,255,255,0.07);
  --ep-border-strong: rgba(255,255,255,0.13);
  --ep-text: #f4f4f5;
  --ep-muted: #a1a1aa;
  --ep-input-bg: #0c0c0e;
  --ep-input-border: #27272a;
  --ep-input-focus: #f4f4f5;
  --ep-primary-bg: #f4f4f5;
  --ep-primary-fg: #09090b;
  --ep-ghost-bg: transparent;
  --ep-ghost-fg: #e4e4e7;
  --ep-ghost-border: rgba(255,255,255,0.15);
  --ep-danger: #f87171;
  --ep-success: #4ade80;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  font-family: 'Sora', sans-serif;
  background: var(--ep-bg);
  color: var(--ep-text);
  min-height: 100vh;
  position: relative;
  overflow-x: clip;
}

.gridBg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, var(--ep-border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ep-border) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%);
  opacity: 0.6;
}

.wrapper {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
  padding: 80px 16px 60px;
}

/* ── Back button — no border, just icon + text ── */
.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--ep-muted);
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 20px;
  transition: color 0.15s ease;
  letter-spacing: 0.01em;
}
.backBtn:hover { color: var(--ep-text); }

/* ── Card — sharp edges as requested ── */
.card {
  background: var(--ep-card);
  border: 1px solid var(--ep-border);
  border-radius: 2px;
  overflow: hidden;
}

/* ── Cover ── */
.coverWrap {
  position: relative;
}

.coverPreview {
  width: 100%;
  height: var(--ep-cover-h);
  overflow: hidden;
  background: var(--ep-input-bg);
}

.coverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.coverEmpty {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--ep-text) 6%, transparent),
    color-mix(in srgb, var(--ep-text) 3%, transparent)
  );
}

.coverOverlay {
  position: absolute;
  top: 10px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.textBtn {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 4px;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  letter-spacing: 0.02em;
}
.textBtn:hover { background: rgba(0,0,0,0.7); }

/* ── Avatar ── */
.avatarWrap {
  position: absolute;
  bottom: calc(-1 * var(--ep-avatar-size) / 2);
  left: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.avatar {
  width: var(--ep-avatar-size);
  height: var(--ep-avatar-size);
  border-radius: 50%;
  border: 3px solid var(--ep-card);
  background: var(--ep-input-bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  flex-shrink: 0;
}

.avatarImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatarInitial {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ep-muted);
  user-select: none;
}

.avatarEditBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--ep-primary-bg);
  color: var(--ep-primary-fg);
  border: none;
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}
.avatarEditBtn:hover { opacity: 0.8; }

.avatarRemoveBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 4px 10px;
  border-radius: 4px;
  background: transparent;
  color: var(--ep-danger);
  border: 1px solid var(--ep-danger);
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.15s, opacity 0.15s;
}
.avatarRemoveBtn:hover { background: color-mix(in srgb, var(--ep-danger) 10%, transparent); }

.avatarActions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Header text — offset for avatar overlap ── */
.headerText {
  padding: 72px 28px 0;
}

.eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--ep-muted);
  font-family: 'DM Mono', monospace;
}

.title {
  margin-top: 6px;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--ep-text);
}

.subtitle {
  margin-top: 6px;
  font-size: 0.88rem;
  color: var(--ep-muted);
}

/* ── Form ── */
.form {
  padding: 24px 28px 28px;
  display: grid;
  gap: 16px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.usernameRow {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.usernameEditBtn {
  padding: 8px 12px;
  font-family: 'Sora', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  background: var(--ep-primary-bg);
  color: var(--ep-primary-fg);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.usernameEditBtn:hover {
  opacity: 0.8;
}

.usernameStatus {
  font-size: 0.8rem;
  min-height: 1rem;
  color: var(--ep-muted);
}

.usernameStatusChecking {
  color: var(--ep-muted);
}

.usernameStatusAvailable {
  color: var(--ep-success);
}

.usernameStatusError {
  color: var(--ep-danger);
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ep-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.input,
.textarea {
  width: 100%;
  background: var(--ep-input-bg);
  border: 1px solid var(--ep-input-border);
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--ep-text);
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus,
.textarea:focus {
  border-color: var(--ep-input-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ep-input-focus) 10%, transparent);
}

.inputReadonly {
  opacity: 0.5;
  cursor: not-allowed;
}

.textarea { resize: vertical; }

.helper {
  font-size: 0.72rem;
  color: var(--ep-muted);
}

.error {
  font-size: 0.82rem;
  color: var(--ep-danger);
}

.success {
  font-size: 0.82rem;
  color: var(--ep-success);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.ghostBtn {
  padding: 9px 18px;
  font-family: 'Sora', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  background: var(--ep-ghost-bg);
  color: var(--ep-ghost-fg);
  border: 1px solid var(--ep-ghost-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.ghostBtn:hover {
  background: color-mix(in srgb, var(--ep-text) 6%, transparent);
  border-color: var(--ep-border-strong);
}

.primaryBtn {
  padding: 9px 22px;
  font-family: 'Sora', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  background: var(--ep-primary-bg);
  color: var(--ep-primary-fg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.primaryBtn:hover { opacity: 0.88; }
.primaryBtn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Crop modal ── */
.cropOverlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.5rem, 2vw, 1.25rem);
}

.cropPopup {
  width: min(1080px, 96vw);
  max-height: 90vh;
  background: var(--ep-card);
  border: 1px solid var(--ep-border-strong);
  border-radius: 8px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cropTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.55rem;
}

.cropHeading {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ep-text);
}

.cropCloseBtn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--ep-muted);
  border-radius: 3px;
  cursor: pointer;
}

.cropCloseBtn:hover {
  background: color-mix(in srgb, var(--ep-text) 8%, transparent);
}

.cropStage {
  height: min(70vh, 620px);
  min-height: 340px;
  background: color-mix(in srgb, var(--ep-text) 4%, transparent);
  border: 1px solid var(--ep-border);
  border-radius: 4px;
  overflow: hidden;
}

.cropperControl {
  width: 100%;
  height: 100%;
  display: block;
}

.cropTools {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.6rem;
}

.cropToolsLabel {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ep-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cropToolBtn {
  padding: 0.4rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--ep-border-strong);
  border-radius: 2px;
  background: color-mix(in srgb, var(--ep-text) 6%, transparent);
  color: var(--ep-text);
  cursor: pointer;
}

.cropActions {
  margin-top: 0.65rem;
  display: flex;
  justify-content: flex-end;
}

.cropApplyBtn {
  padding: 0.6rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid var(--ep-primary-bg);
  background: var(--ep-primary-bg);
  color: var(--ep-primary-fg);
  border-radius: 2px;
  cursor: pointer;
}

/* ── Footer ── */
.footerSection {
  position: relative;
  z-index: 3;
  background: #000;
  margin-top: 24px;
}

@media (max-width: 640px) {
  .wrapper { padding-top: 60px; }
  .row { grid-template-columns: 1fr; }
  .headerText { padding: 52px 18px 0; }
  .form { padding: 20px 18px 24px; }
  .avatarWrap { left: 18px; }
}
</style>