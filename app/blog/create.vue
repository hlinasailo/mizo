<script setup lang="ts">
import { onBeforeUnmount, ref, onMounted } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useUserStore } from '~/stores/user'
import { useBlogService } from '~/services/blogService'

defineOptions({ name: 'BlogCreatePage' })

// Stores & Composables
const userStore = useUserStore()
const blogService = useBlogService()
const router = useRouter()

// Form data
const title       = ref('')
const category    = ref('Others')
const content     = ref('')
const thumbnail   = ref('')
const coverImageFile = ref<File | null>(null)
const draftId     = ref<number | null>(null)

// UI states
const isSubmitting  = ref(false)
const isSavingDraft = ref(false)
const showMetaPopup = ref(false)
const showCropPopup = ref(false)
const cropImageSrc  = ref('')
const cropAspect    = ref<number | null>(16 / 9)
const cropperRef    = ref<{ getResult?: () => { canvas?: HTMLCanvasElement | null; image?: HTMLImageElement | null } } | null>(null)
const errorMessage  = ref('')

// Notification
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')
let notificationTimer: NodeJS.Timeout | null = null

let cropResolve:   ((result: string | null) => void) | null = null
let cropObjectUrl: string | null = null

// ── Initialization ──
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Create a draft on page load
  try {
    const draft = await blogService.createDraft('')
    draftId.value = draft.id
  } catch (err) {
    console.error('Failed to initialize draft:', err)
    errorMessage.value = 'Failed to initialize editor'
  }
})

// ── Image handling ──
const addThumbnailByFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return
  const cropped = await openCropModal(file)
  if (cropped) {
    thumbnail.value = cropped
    coverImageFile.value = file
  }
  input.value = ''
}

const finalizeCrop = (result: string | null) => {
  showCropPopup.value = false
  cropImageSrc.value  = ''
  if (cropObjectUrl) { URL.revokeObjectURL(cropObjectUrl); cropObjectUrl = null }
  cropResolve?.(result)
  cropResolve = null
}

const openCropModal = async (file: File) => {
  if (!import.meta.client) return null
  if (!file.type.startsWith('image/')) return null
  if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl)
  cropObjectUrl      = URL.createObjectURL(file)
  cropImageSrc.value = cropObjectUrl
  cropAspect.value   = 16 / 9
  showCropPopup.value = true
  return new Promise<string | null>((resolve) => { cropResolve = resolve })
}

const setCropAspect = (value: number | null) => { cropAspect.value = value }

const applyCrop = () => {
  const resultData = cropperRef.value?.getResult?.()
  const canvas     = resultData?.canvas ?? null
  if (!canvas) { finalizeCrop(null); return }

  let result = canvas.toDataURL('image/jpeg', 0.92)
  if (!result || canvas.width === 0 || canvas.height === 0) {
    const imageEl = resultData?.image
    if (imageEl && imageEl.naturalWidth > 0 && imageEl.naturalHeight > 0) {
      const fb  = document.createElement('canvas')
      fb.width  = imageEl.naturalWidth
      fb.height = imageEl.naturalHeight
      const ctx = fb.getContext('2d')
      if (ctx) { ctx.drawImage(imageEl, 0, 0); result = fb.toDataURL('image/jpeg', 0.92) }
    }
  }
  finalizeCrop(result)
}

const closeCrop     = () => finalizeCrop(null)
const openMetaPopup = () => { showMetaPopup.value = true; errorMessage.value = '' }

// ── Notifications ──
const _displayNotification = (message: string, type: 'success' | 'error' = 'success', duration: number = 2000) => {
  // Clear any existing timer
  if (notificationTimer) clearTimeout(notificationTimer)
  
  // Set the message and type
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  
  // Auto-hide after duration
  notificationTimer = setTimeout(() => {
    showNotification.value = false
  }, duration)
}

// ── API calls ──
const submitPost = async () => {
  if (!draftId.value) {
    errorMessage.value = 'Error: Draft not initialized'
    return
  }

  if (!title.value.trim()) {
    errorMessage.value = 'Please enter a blog title'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Convert thumbnail to File if it's a data URL
    let coverImageFileToPublish: File | undefined
    if (thumbnail.value && !coverImageFile.value) {
      // thumbnail is a data URL from crop, convert it back to File
      const blob = await fetch(thumbnail.value).then(r => r.blob())
      coverImageFileToPublish = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
    } else if (coverImageFile.value) {
      coverImageFileToPublish = coverImageFile.value
    }

    const publishPayload = {
      id: draftId.value,
      title: title.value.trim(),
      category: category.value,
      tags: [], // Add tag parsing if you implement tags UI
      content: content.value,
      coverimage: coverImageFileToPublish,
    }

    const result = await blogService.publishPostWithCategoryName(publishPayload)

    if (result.save === 1) {
      showMetaPopup.value = false
      // Show success message and redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/blog/${result.slug}`)
    } else {
      errorMessage.value = 'Failed to publish post'
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred'
    console.error('Publish error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  if (!draftId.value) {
    errorMessage.value = 'Error: Draft not initialized'
    return
  }

  isSavingDraft.value = true
  errorMessage.value = ''

  try {
    await blogService.updateDraft(draftId.value, content.value)
    console.log('Draft saved successfully')
    _displayNotification('Draft saved successfully', 'success')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save draft'
    console.error('Draft save error:', error)
    console.log('Draft save failed:', error)
  } finally {
    isSavingDraft.value = false
  }
}

onBeforeUnmount(() => { if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl) })
</script>

<template>
  <main :class="$style.page">
    <section :class="$style.section">

      <!-- ── Header ─────────────────────────────────────── -->
      <div :class="$style.header">
        <div :class="$style.headerTop">
          <h1 :class="$style.heading">
            Create <span :class="$style.headingMuted">Blog</span>
          </h1>
          <button :class="$style.backBtn" title="Go back" @click="$router.back()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
        <div :class="$style.headerBar" />
        <p :class="$style.headerSub">Write and publish with the same Mizomade style.</p>
      </div>

      <!-- ── Error Message ─────────────────────────────── -->
      <div v-if="errorMessage" :class="$style.errorBanner">
        {{ errorMessage }}
      </div>

      <!-- ── Form ───────────────────────────────────────── -->
      <form :class="$style.form" @submit.prevent="submitPost">
        <BlogContentEditor v-model="content" />

        <div :class="$style.actions">
          <button type="button" :class="$style.draftBtn" :disabled="isSavingDraft" @click="saveDraft">
            <span>{{ isSavingDraft ? 'Saving…' : 'Save Draft' }}</span>
          </button>
          <button type="button" :class="$style.publishBtn" :disabled="isSubmitting" @click="openMetaPopup">
            <span>Next</span>
          </button>
        </div>
      </form>

      <!-- ── Meta popup ──────────────────────────────────── -->
      <div v-if="showMetaPopup" :class="$style.overlay" @click.self="showMetaPopup = false">
        <div :class="$style.metaPopup" role="dialog" aria-modal="true" aria-label="Post details">
          <div :class="$style.popupTop">
            <h3 :class="$style.popupHeading">Post details</h3>
            <button type="button" :class="$style.popupCloseBtn" title="Close" @click="showMetaPopup = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p :class="$style.metaSub">Add title, category, and thumbnail before publishing.</p>

          <div v-if="errorMessage" :class="$style.errorBanner">
            {{ errorMessage }}
          </div>

          <div :class="$style.metaFields">
            <label :class="$style.fieldGroup">
              <span :class="$style.fieldLabel">Title</span>
              <input v-model="title" type="text" placeholder="Enter blog title" :class="$style.fieldInput" >
            </label>

            <label :class="$style.fieldGroup">
              <span :class="$style.fieldLabel">Category</span>
              <select v-model="category" :class="$style.fieldInput">
                <option
v-for="cat in ['Zirna','Gospel','Hriselna','Thiamna','Beauty & Fashion','Story','Politics','Infiamna','Others']"
                  :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </label>

            <label :class="$style.fieldGroup">
              <span :class="$style.fieldLabel">Thumbnail</span>
              <div :class="$style.thumbControls">
                <label :class="$style.thumbUploadBtn">
                  Upload Photo
                  <input type="file" accept="image/*" class="hidden" @change="addThumbnailByFile" >
                </label>
                <button v-if="thumbnail" type="button" :class="$style.thumbRemoveBtn" @click="thumbnail = ''">Remove</button>
              </div>
              <div v-if="thumbnail" :class="$style.thumbPreviewWrap">
                <img :src="thumbnail" alt="Thumbnail preview" :class="$style.thumbPreview" >
              </div>
            </label>
          </div>

          <div :class="$style.popupActions">
            <button
              type="button"
              :class="$style.applyBtn"
              :disabled="isSubmitting || !title.trim()"
              @click="submitPost"
            >
              {{ isSubmitting ? 'Publishing…' : 'Publish Post' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Crop popup ──────────────────────────────────── -->
      <div v-if="showCropPopup" :class="$style.overlay" @click.self="closeCrop">
        <div :class="$style.cropPopup" role="dialog" aria-modal="true" aria-label="Crop image">
          <div :class="$style.popupTop">
            <h3 :class="$style.popupHeading">Crop image</h3>
            <button type="button" :class="$style.popupCloseBtn" title="Close" @click="closeCrop">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
            <button type="button" :class="$style.cropToolBtn" @click="setCropAspect(16/9)">16:9</button>
            <button type="button" :class="$style.cropToolBtn" @click="setCropAspect(1)">1:1</button>
          </div>

          <div :class="$style.popupActions">
            <button type="button" :class="$style.applyBtn" @click="applyCrop">Use Crop</button>
          </div>
        </div>
      </div>

    </section>
  </main>
</template>

<style module>
/* ── Tokens ──────────────────────────────────────────────────
   Navbar sets/removes `dark` on <html>.
   Light = :root  |  Dark = html.dark                        */
:global(:root) {
  --cp-page-bg:         #c6c6c6;
  --cp-fg:              #18181b;
  --cp-fg-muted:        #71717a;

  --cp-field-bg:        #fafafa;
  --cp-field-border:    rgba(24,24,27,0.14);
  --cp-field-focus:     rgba(24,24,27,0.35);
  --cp-field-text:      #18181b;
  --cp-field-ph:        rgba(24,24,27,0.38);

  --cp-pub-fg:          #18181b;
  --cp-pub-border:      rgba(24,24,27,0.22);
  --cp-pub-fill:        #18181b;
  --cp-pub-hover-text:  #fafafa;
  --cp-pub-hover-bd:    rgba(24,24,27,0.85);

  --cp-draft-fg:        rgba(24,24,27,0.70);
  --cp-draft-border:    rgba(24,24,27,0.26);
  --cp-draft-fill:      rgba(24,24,27,0.08);
  --cp-draft-hover-fg:  #18181b;
  --cp-draft-hover-bd:  rgba(24,24,27,0.55);

  --cp-popup-bg:        #fafafa;
  --cp-popup-border:    rgba(24,24,27,0.12);
  --cp-popup-heading:   #18181b;
  --cp-popup-sub:       #52525b;

  --cp-close-fg:        #52525b;
  --cp-close-hover:     rgba(24,24,27,0.08);

  --cp-thumb-upload-bg: rgba(24,24,27,0.06);
  --cp-thumb-upload-bd: rgba(24,24,27,0.16);
  --cp-thumb-upload-fg: #18181b;
  --cp-thumb-remove-bd: rgba(24,24,27,0.18);
  --cp-thumb-remove-fg: #3f3f46;
  --cp-thumb-prev-bg:   rgba(24,24,27,0.04);
  --cp-thumb-prev-bd:   rgba(24,24,27,0.10);

  --cp-crop-stage-bg:   rgba(24,24,27,0.03);
  --cp-crop-stage-bd:   rgba(24,24,27,0.12);
  --cp-tool-bg:         rgba(24,24,27,0.06);
  --cp-tool-bd:         rgba(24,24,27,0.18);
  --cp-tool-fg:         #18181b;
  --cp-tool-label:      #52525b;

  --cp-apply-bg:        #18181b;
  --cp-apply-bd:        #18181b;
  --cp-apply-fg:        #fafafa;
}

:global(html.dark) {
  --cp-page-bg:         #27272a;
  --cp-fg:              #fafafa;
  --cp-fg-muted:        #a1a1aa;

  --cp-field-bg:        rgba(255,255,255,0.06);
  --cp-field-border:    rgba(255,255,255,0.12);
  --cp-field-focus:     rgba(255,255,255,0.35);
  --cp-field-text:      #f4f4f5;
  --cp-field-ph:        rgba(255,255,255,0.30);

  --cp-pub-fg:          #ffffff;
  --cp-pub-border:      rgba(255,255,255,0.25);
  --cp-pub-fill:        #ffffff;
  --cp-pub-hover-text:  #18181b;
  --cp-pub-hover-bd:    rgba(255,255,255,0.90);

  --cp-draft-fg:        rgba(255,255,255,0.70);
  --cp-draft-border:    rgba(255,255,255,0.30);
  --cp-draft-fill:      rgba(255,255,255,0.10);
  --cp-draft-hover-fg:  #ffffff;
  --cp-draft-hover-bd:  rgba(255,255,255,0.60);

  --cp-popup-bg:        #18181b;
  --cp-popup-border:    rgba(255,255,255,0.12);
  --cp-popup-heading:   #f4f4f5;
  --cp-popup-sub:       #a1a1aa;

  --cp-close-fg:        #d4d4d8;
  --cp-close-hover:     rgba(255,255,255,0.08);

  --cp-thumb-upload-bg: rgba(255,255,255,0.08);
  --cp-thumb-upload-bd: rgba(255,255,255,0.20);
  --cp-thumb-upload-fg: #f4f4f5;
  --cp-thumb-remove-bd: rgba(255,255,255,0.22);
  --cp-thumb-remove-fg: #d4d4d8;
  --cp-thumb-prev-bg:   rgba(255,255,255,0.04);
  --cp-thumb-prev-bd:   rgba(255,255,255,0.12);

  --cp-crop-stage-bg:   rgba(255,255,255,0.03);
  --cp-crop-stage-bd:   rgba(255,255,255,0.12);
  --cp-tool-bg:         rgba(255,255,255,0.08);
  --cp-tool-bd:         rgba(255,255,255,0.20);
  --cp-tool-fg:         #f4f4f5;
  --cp-tool-label:      #a1a1aa;

  --cp-apply-bg:        #f4f4f5;
  --cp-apply-bd:        #f4f4f5;
  --cp-apply-fg:        #111110;
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
  background: var(--cp-page-bg);
  color: var(--cp-fg);
  padding: 6rem 1.5rem 4rem;
}
@media (min-width: 1024px) { .page { padding-left: 3rem; padding-right: 3rem; } }

.section { max-width: 64rem; margin: 0 auto; }

/* ── Header ─────────────────────────────────────────────── */
.header    { margin-bottom: 2.5rem; }
.headerTop { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }

.heading {
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1;
  text-transform: uppercase;
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  color: var(--cp-fg);
}
.headingMuted { color: var(--cp-fg-muted); }
.headerBar    { width: 6rem; height: 3px; background: var(--cp-fg-muted); opacity: 0.6; margin-bottom: 1rem; }
.headerSub    { color: var(--cp-fg-muted); font-size: 0.9rem; }

.backBtn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--cp-fg-muted);
  margin-top: 0.5rem;
  flex-shrink: 0;
  transition: color 0.2s ease !important;
}
.backBtn:hover { color: var(--cp-fg); }
/* ── Error Banner ───────────────────────────────────────── */
.errorBanner {
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

:root .errorBanner {
  background: #fee;
  border: 1px solid #f99;
  color: #c33;
}

:global(html.dark) .errorBanner {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.4);
  color: #fca5a5;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* ── Form ───────────────────────────────────────────────── */
.form    { display: flex; flex-direction: column; gap: 1.5rem; }
.actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }

/* ── Fields ─────────────────────────────────────────────── */
.fieldGroup { display: flex; flex-direction: column; gap: 0.5rem; }
.fieldLabel {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--cp-fg-muted);
}
.fieldInput {
  width: 100%;
  background: var(--cp-field-bg);
  border: 1px solid var(--cp-field-border);
  color: var(--cp-field-text);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  outline: none;
  border-radius: 2px;
  display: block;
  transition: border-color 0.2s ease, background-color 0.35s ease, color 0.35s ease !important;
}
.fieldInput::placeholder { color: var(--cp-field-ph); }
.fieldInput:focus         { border-color: var(--cp-field-focus); }
.fieldInput option        { background: var(--cp-popup-bg); color: var(--cp-fg); }

/* ── Publish button ─────────────────────────────────────── */
.publishBtn {
  position: relative;
  padding: 1rem 2.5rem;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cp-pub-fg);
  background: transparent;
  border: 2px solid var(--cp-pub-border);
  cursor: pointer;
  overflow: hidden;
  border-radius: 2px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
}
.publishBtn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--cp-pub-fill);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.35s ease !important;
  z-index: 0;
}
.publishBtn span { position: relative; z-index: 1; transition: color 0.3s ease !important; }
.publishBtn:hover { border-color: var(--cp-pub-hover-bd); }
.publishBtn:hover::before { transform: translateX(0); }
.publishBtn:hover span    { color: var(--cp-pub-hover-text); }
.publishBtn:active        { transform: scale(0.98); }
.publishBtn:disabled      { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* ── Draft button ───────────────────────────────────────── */
.draftBtn {
  position: relative;
  padding: 1rem 2rem;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--cp-draft-fg);
  background: transparent;
  border: 2px solid var(--cp-draft-border);
  cursor: pointer;
  overflow: hidden;
  border-radius: 2px;
  transition: border-color 0.3s ease, color 0.3s ease !important;
}
.draftBtn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--cp-draft-fill);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.35s ease !important;
  z-index: 0;
}
.draftBtn span  { position: relative; z-index: 1; }
.draftBtn:hover { border-color: var(--cp-draft-hover-bd); color: var(--cp-draft-hover-fg); }
.draftBtn:hover::before { transform: translateX(0); }
.draftBtn:active  { transform: scale(0.98); }
.draftBtn:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

/* ── Overlay ────────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.5rem, 2vw, 1.25rem);
}

/* ── Shared popup shell ─────────────────────────────────── */
.popupTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.55rem;
}
.popupHeading {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--cp-popup-heading);
}
.popupCloseBtn {
  width: 30px; height: 30px;
  border: none;
  background: transparent;
  color: var(--cp-close-fg);
  border-radius: 3px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background-color 0.15s ease !important;
}
.popupCloseBtn:hover { background: var(--cp-close-hover); }

.popupActions { margin-top: 0.65rem; display: flex; justify-content: flex-end; }

.applyBtn {
  padding: 0.6rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid var(--cp-apply-bd);
  background: var(--cp-apply-bg);
  color: var(--cp-apply-fg);
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.2s ease !important;
}
.applyBtn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Meta popup ─────────────────────────────────────────── */
.metaPopup {
  width: min(460px, 96vw);
  max-height: 90vh;
  background: var(--cp-popup-bg);
  border: 1px solid var(--cp-popup-border);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.metaSub {
  margin: 0.15rem 0 0.9rem;
  font-size: 0.85rem;
  color: var(--cp-popup-sub);
}
.metaFields { display: flex; flex-direction: column; gap: 0.95rem; }

/* Thumbnail controls */
.thumbControls  { display: flex; align-items: center; gap: 0.55rem; }
.thumbUploadBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.75rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid var(--cp-thumb-upload-bd);
  border-radius: 2px;
  cursor: pointer;
  color: var(--cp-thumb-upload-fg);
  background: var(--cp-thumb-upload-bg);
}
.thumbRemoveBtn {
  padding: 0.55rem 0.75rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border: 1px solid var(--cp-thumb-remove-bd);
  border-radius: 2px;
  cursor: pointer;
  color: var(--cp-thumb-remove-fg);
  background: transparent;
}
.thumbPreviewWrap {
  margin-top: 0.55rem;
  border: 1px solid var(--cp-thumb-prev-bd);
  border-radius: 3px;
  overflow: hidden;
  background: var(--cp-thumb-prev-bg);
}
.thumbPreview {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  object-fit: cover;
}

/* ── Crop popup ─────────────────────────────────────────── */
.cropPopup {
  width: min(1080px, 96vw);
  max-height: 90vh;
  background: var(--cp-popup-bg);
  border: 1px solid var(--cp-popup-border);
  border-radius: 8px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cropStage {
  height: min(70vh, 620px);
  min-height: 340px;
  background: var(--cp-crop-stage-bg);
  border: 1px solid var(--cp-crop-stage-bd);
  border-radius: 4px;
  overflow: hidden;
}
.cropperControl { width: 100%; height: 100%; display: block; }

.cropTools {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.6rem;
}
.cropToolsLabel {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--cp-tool-label);
}
.cropToolBtn {
  padding: 0.4rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--cp-tool-bd);
  border-radius: 2px;
  background: var(--cp-tool-bg);
  color: var(--cp-tool-fg);
  cursor: pointer;
  transition: opacity 0.15s ease !important;
}
.cropToolBtn:hover { opacity: 0.75; }
</style>