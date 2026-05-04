<script setup lang="ts">
import { onBeforeUnmount, ref, onMounted, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useUserStore } from '~/stores/user'
import { useBlogService } from '~/services/blogService'

definePageMeta({
  middleware: 'auth',
})

defineOptions({ name: 'BlogCreatePage' })

// Stores & Composables
const userStore = useUserStore()
const blogService = useBlogService()
const router = useRouter()
const config = useRuntimeConfig()

// ── Constants ──
const VALID_CATEGORIES = ['Zirna', 'Gospel', 'Hriselna', 'Thiamna', 'Beauty and Fashion', 'Story', 'Politics', 'Infiamna', 'Others']

// ── Utility Functions ──
const getValidCategory = (categoryValue: string | null | undefined): string => {
  const trimmed = (categoryValue || '').trim()
  return VALID_CATEGORIES.includes(trimmed) ? trimmed : 'Others'
}

const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  if (imageUrl.startsWith('/')) {
    return `${config.public.apiBase}${imageUrl}`
  }
  return imageUrl
}

// Form data
const title       = ref('')
const category    = ref('Others')
const content     = ref('')
const thumbnail   = ref('')
const originalThumbnail = ref('')
const coverImageFile = ref<File | null>(null)
const draftId     = ref<number | null>(null)
const tagsInput   = ref('')

// UI states
const isSubmitting      = ref(false)
const isSavingDraft     = ref(false)
const isDraftSaved      = ref(false)
const isUploadingImages = ref(false)
const showMetaPopup     = ref(false)
const showCropPopup     = ref(false)
const cropImageSrc      = ref('')
const cropAspect        = ref<number | null>(16 / 9)
const cropperRef        = ref<{ getResult?: () => { canvas?: HTMLCanvasElement | null; image?: HTMLImageElement | null } } | null>(null)
const errorMessage      = ref('')

// Notification
const showNotification    = ref(false)
const notificationMessage = ref('')
const notificationType    = ref<'success' | 'error'>('success')
let notificationTimer: NodeJS.Timeout | null = null

let cropResolve:   ((result: string | null) => void) | null = null
let cropObjectUrl: string | null = null
let lastSavedDraftContent = ''

// ── Computed Properties ──
const displayThumbnailUrl = computed(() => {
  if (!thumbnail.value) return ''
  if (thumbnail.value.startsWith('data:')) {
    return thumbnail.value
  }
  return getFullImageUrl(thumbnail.value)
})

const normalizeContent = (value: string) => String(value || '').trim()

const markdownParser = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
})

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
})

type SupportedTextAlign = 'left' | 'center' | 'right' | 'justify'

const getNodeTextAlign = (node: Node): SupportedTextAlign | null => {
  if (!(node instanceof HTMLElement)) return null

  const inline = String(node.style?.textAlign || '').trim().toLowerCase()
  const attribute = String(node.getAttribute('text-align') || '').trim().toLowerCase()
  const alignAttr = String(node.getAttribute('align') || '').trim().toLowerCase()
  const candidate = inline || attribute || alignAttr

  if (candidate === 'left' || candidate === 'center' || candidate === 'right' || candidate === 'justify') {
    return candidate
  }

  return null
}

const wrapAlignmentMarker = (content: string, align: SupportedTextAlign | null) => {
  const normalized = content.trim()
  if (!normalized || !align) return normalized
  return `[[align:${align}]]${normalized}[[/align]]`
}

turndownService.addRule('preserveParagraphAlignment', {
  filter: (node) => node.nodeName === 'P',
  replacement: (content, node) => {
    const align = getNodeTextAlign(node)
    const body = wrapAlignmentMarker(content, align)
    return body ? `\n\n${body}\n\n` : '\n\n'
  },
})

turndownService.addRule('preserveHeadingAlignment', {
  filter: (node) => /^H[1-6]$/.test(node.nodeName),
  replacement: (content, node) => {
    const align = getNodeTextAlign(node)
    const headingNode = node as HTMLElement
    const level = Number(headingNode.tagName.charAt(1)) || 1
    const hashes = '#'.repeat(Math.min(Math.max(level, 1), 6))
    const body = wrapAlignmentMarker(content, align)
    return body ? `\n\n${hashes} ${body}\n\n` : '\n\n'
  },
})

const parsePositiveInt = (value: string | null | undefined) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  const rounded = Math.round(parsed)
  return rounded > 0 ? rounded : null
}

turndownService.addRule('preserveResizableImageSize', {
  filter: (node) => node.nodeName === 'IMG',
  replacement: (_content, node) => {
    const imageNode = node as HTMLElement
    const src = String(imageNode.getAttribute('src') || '').trim()
    if (!src) return ''

    const alt = String(imageNode.getAttribute('alt') || '').replace(/\]/g, '\\]')
    const width = parsePositiveInt(imageNode.getAttribute('width'))
    const height = parsePositiveInt(imageNode.getAttribute('height'))

    const sizeMeta = (width || height)
      ? `size:${width ?? 'auto'}x${height ?? 'auto'}`
      : ''

    const titlePart = sizeMeta ? ` "${sizeMeta}"` : ''
    return `![${alt}](${src}${titlePart})`
  },
})

const isProbablyHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

const processAlignmentMarkersInHtml = (html: string) => {
  const withAlignedBlocks = html.replace(
    /<(p|h[1-6])>(?:\s|&nbsp;)*\[\[align:(left|center|right|justify)\]\]([\s\S]*?)\[\[\/align\]\](?:\s|&nbsp;)*<\/\1>/gi,
    (_match, tag: string, align: string, content: string) => `<${tag} style="text-align:${align}">${content}</${tag}>`,
  )

  const withoutEmptyAlignMarkers = withAlignedBlocks.replace(
    /<p>(?:\s|&nbsp;|<br\s*\/?\s*>)*\[\[align:(left|center|right|justify)\]\](?:\s|&nbsp;|<br\s*\/?\s*>)*\[\[\/align\]\](?:\s|&nbsp;|<br\s*\/?\s*>)*<\/p>/gi,
    '',
  )

  return withoutEmptyAlignMarkers.replace(/\[\[align:(left|center|right|justify)\]\]|\[\[\/align\]\]/gi, '')
}

const toEditorHtml = (storedContent: string) => {
  const normalized = normalizeContent(storedContent)
  if (!normalized) return ''
  if (isProbablyHtml(normalized)) return normalized
  const rendered = markdownParser.render(normalized)
  return processAlignmentMarkersInHtml(rendered)
}

const toStorageMarkdown = (editorContent: string) => {
  const normalized = normalizeContent(editorContent)
  if (!normalized) return ''
  if (!isProbablyHtml(normalized)) return normalized
  return turndownService.turndown(normalized).trim()
}

const getCurrentDraftContent = () => toStorageMarkdown(content.value)

// ── Initialization ──
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  const route = useRoute()

  // Load existing owned post by ID (preferred, avoids slug collisions)
  const postIdQueryRaw = route.query.postId as string | undefined
  const postIdQuery = postIdQueryRaw ? Number(postIdQueryRaw) : NaN

  if (Number.isFinite(postIdQuery) && postIdQuery > 0) {
    try {
      const response = await blogService.fetchDraftDetail(postIdQuery)
      if (response?.post) {
        const post = response.post
        title.value    = post.title || ''
        category.value = getValidCategory(post.category)
        content.value  = toEditorHtml(post.content)
        if (post.coverimage) {
          thumbnail.value = post.coverimage
          originalThumbnail.value = post.coverimage
        }
        if (post.tags && post.tags.length > 0) {
          tagsInput.value = post.tags.join(', ')
        }
        draftId.value  = post.id
      }
    } catch (error) {
      console.error('Failed to load post for editing:', error)
      errorMessage.value = 'Failed to load post. Please try again.'
    }
    return
  }

  // Load existing draft by ID when editing from Drafts tab
  const draftIdQueryRaw = route.query.draftId as string | undefined
  const draftIdQuery = draftIdQueryRaw ? Number(draftIdQueryRaw) : NaN

  if (Number.isFinite(draftIdQuery) && draftIdQuery > 0) {
    try {
      const response = await blogService.fetchDraftDetail(draftIdQuery)
      if (response?.post) {
        const post = response.post
        title.value    = post.title || ''
        category.value = getValidCategory(post.category)
        content.value  = toEditorHtml(post.content)
        if (post.coverimage) {
          thumbnail.value = post.coverimage
          originalThumbnail.value = post.coverimage
        }
        if (post.tags && post.tags.length > 0) {
          tagsInput.value = post.tags.join(', ')
        }
        draftId.value  = post.id
      }
    } catch (error) {
      console.error('Failed to load draft for editing:', error)
      errorMessage.value = 'Failed to load draft. Please try again.'
    }
    return
  }

  // Load existing published post if editing by slug
  const postSlug = route.query.postSlug as string | undefined
  if (postSlug) {
    const normalizedSlug = String(postSlug).trim().toLowerCase()
    if (
      !normalizedSlug ||
      normalizedSlug === 'none' ||
      normalizedSlug === 'nonenone' ||
      normalizedSlug === 'null' ||
      normalizedSlug === 'undefined'
    ) {
      errorMessage.value = 'This post link is invalid. Please open the post from your profile again.'
      return
    }

    try {
      const response = await blogService.fetchPostDetail(postSlug)
      if (response?.post) {
        const post = response.post
        title.value    = post.title || ''
        category.value = getValidCategory(post.category)
        content.value  = toEditorHtml(post.content)
        if (post.coverimage) {
          thumbnail.value = post.coverimage
          originalThumbnail.value = post.coverimage
        }
        if (post.tags && post.tags.length > 0) {
          tagsInput.value = post.tags.join(', ')
        }
        draftId.value  = post.id
      }
    } catch (error) {
      console.error('Failed to load post for editing:', error)
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load post. Please try again.'
    }
  }
})

// ── Image handling ──
const addThumbnailByFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file  = input.files?.[0]
  if (!file) return
  await processThumbnailFile(file)
  input.value = ''
}

const dataUrlToFile = async (dataUrl: string, filename = 'coverimage.jpg'): Promise<File> => {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const extension = blob.type === 'image/png' ? 'png' : 'jpg'
  const safeName = filename.replace(/\.(jpg|jpeg|png)$/i, `.${extension}`)
  return new File([blob], safeName, { type: blob.type || 'image/jpeg' })
}

const uploadCroppedImage = async (base64DataUrl: string): Promise<string | null> => {
  try {
    isUploadingImages.value = true
    errorMessage.value = ''

    // Convert base64 to Blob
    const blob = await fetch(base64DataUrl).then(r => r.blob())
    
    // Upload using blog service
    const response = await blogService.uploadImage(blob)
    
    return response.url  // Server returns compressed image URL
  } catch (error) {
    console.error('Image upload error:', error)
    errorMessage.value = 'Failed to upload image. Please try again.'
    return null
  } finally {
    isUploadingImages.value = false
  }
}

const processThumbnailFile = async (file: File) => {
  if (!file.type.startsWith('image/')) return
  const cropped = await openCropModal(file)
  if (cropped) {
    // Keep a file for publish API (current backend expects multipart file field)
    coverImageFile.value = await dataUrlToFile(cropped, 'coverimage.jpg')

    // Upload immediately and store server URL
    const imageUrl = await uploadCroppedImage(cropped)
    if (imageUrl) {
      thumbnail.value = imageUrl        // Store server URL, not base64
      originalThumbnail.value = imageUrl
      return
    }

    // Fallback preview if immediate upload fails; publish can still use coverImageFile.
    thumbnail.value = cropped
    originalThumbnail.value = cropped
  }
}

const handleThumbnailDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleThumbnailDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  await processThumbnailFile(file)
}

const clearThumbnail = () => {
  thumbnail.value      = ''
  coverImageFile.value = null
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
  cropObjectUrl       = URL.createObjectURL(file)
  cropImageSrc.value  = cropObjectUrl
  cropAspect.value    = 16 / 9
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

const closeCrop = () => finalizeCrop(null)

const parseTags = (input: string): string[] => {
  const normalized = input
    .split(/[,\s]+/)
    .map(tag => tag.replace(/^#+/, '').replace(/[^a-zA-Z0-9_-]/g, '').trim().toLowerCase())
    .filter(tag => tag.length > 0)
  return [...new Set(normalized)]
}

// ── Draft persistence ────────────────────────────────────────────────────────
/**
 * Converts editor HTML → markdown, uploads any embedded base64
 * images to the server, then saves the cleaned markdown to the API.
 */
const persistDraftContent = async (markdownContent = toStorageMarkdown(content.value)) => {
  const body = markdownContent

  if (draftId.value) {
    await blogService.updateDraft(draftId.value, body)
    return { draftId: draftId.value, content: body }
  }

  const draft = await blogService.createDraft(body)
  draftId.value = draft.id
  return { draftId: draft.id, content: body }
}

watch(content, () => {
  if (isSavingDraft.value) return

  const currentContent = getCurrentDraftContent()
  isDraftSaved.value = !!currentContent && currentContent === lastSavedDraftContent
})

const handleNextStep = async () => {
  if (!toStorageMarkdown(content.value).trim()) {
    errorMessage.value = 'Please write your post content before continuing.'
    return
  }

  isSavingDraft.value = true
  errorMessage.value  = ''

  try {
    await persistDraftContent()
    showMetaPopup.value = true
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save draft'
    console.error('Next step save error:', error)
  } finally {
    isSavingDraft.value = false
  }
}

// ── Notifications ──
const _displayNotification = (message: string, type: 'success' | 'error' = 'success', duration = 2000) => {
  if (notificationTimer) clearTimeout(notificationTimer)
  notificationMessage.value = message
  notificationType.value    = type
  showNotification.value    = true
  notificationTimer = setTimeout(() => { showNotification.value = false }, duration)
}

// ── Publish ──────────────────────────────────────────────────────────────────
const submitPost = async () => {
  if (!title.value.trim()) {
    errorMessage.value = 'Please enter a blog title'
    return
  }

  const markdownContent = toStorageMarkdown(content.value)
  if (!markdownContent.trim()) {
    errorMessage.value = 'Please add post content before publishing'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Persist a cleaned draft first, then publish the same sanitized body.
    const { draftId: currentDraftId, content: cleanedContent } = await persistDraftContent(markdownContent)

    // Thumbnail already uploaded and stored as server URL
    // No need to convert or re-upload
    let coverImageFileToPublish: File | undefined
    if (coverImageFile.value) {
      coverImageFileToPublish = coverImageFile.value
    }

    const publishPayload = {
      id:         currentDraftId,
      title:      title.value.trim(),
      category:   category.value,
      tags:       parseTags(tagsInput.value),
      content:    cleanedContent,
      coverimage: coverImageFileToPublish,
    }

    const result = await blogService.publishPostWithCategoryName(publishPayload)

    if (result.save === 1) {
      showMetaPopup.value = false
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

// ── Save Draft ───────────────────────────────────────────────────────────────
const saveDraft = async () => {
  isSavingDraft.value = true
  errorMessage.value  = ''

  try {
    const savedContent = getCurrentDraftContent()
    await persistDraftContent(savedContent)
    lastSavedDraftContent = savedContent
    isDraftSaved.value = true
    _displayNotification('Draft saved successfully', 'success')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save draft'
    console.error('Draft save error:', error)
    isDraftSaved.value = false
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
        <p :class="$style.headerSub">Write and publish insight.</p>
      </div>

      <!-- ── Error Message ─────────────────────────────── -->
      <div v-if="errorMessage" :class="$style.errorBanner">
        {{ errorMessage }}
      </div>

      <!-- ── Image upload progress ──────────────────────── -->
      <div v-if="isUploadingImages" :class="$style.infoBanner">
         Uploading images…
      </div>

      <!-- ── Form ───────────────────────────────────────── -->
      <form :class="$style.form" @submit.prevent="submitPost">
        <BlogContentEditor v-model="content" />

        <div :class="$style.actions">
          <button
            type="button"
            :class="$style.draftBtn"
            :disabled="isSavingDraft || isUploadingImages"
            @click="saveDraft"
          >
            <span>{{ isSavingDraft ? (isUploadingImages ? 'Uploading images…' : 'Saving…') : isDraftSaved ? 'Saved' : 'Save Draft' }}</span>
          </button>
          <button
            type="button"
            :class="$style.publishBtn"
            :disabled="isSubmitting || isSavingDraft || isUploadingImages"
            @click="handleNextStep"
          >
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

          <p :class="$style.metaSub">Add title, category, tags, and thumbnail before publishing.</p>

          <div v-if="errorMessage" :class="$style.errorBanner">
            {{ errorMessage }}
          </div>

          <div :class="$style.metaFields">
            <label :class="[$style.fieldGroup, $style.fieldSpan2]">
              <span :class="$style.fieldLabel">Title</span>
              <input v-model="title" type="text" placeholder="Enter blog title" :class="$style.fieldInput">
            </label>

            <label :class="$style.fieldGroup">
              <span :class="$style.fieldLabel">Category</span>
              <select v-model="category" :class="$style.fieldInput">
                <option
                  v-for="cat in ['Zirna','Gospel','Hriselna','Thiamna','Beauty and Fashion','Story','Politics','Infiamna','Others']"
                  :key="cat"
                  :value="cat"
                >{{ cat }}</option>
              </select>
            </label>

            <label :class="$style.fieldGroup">
              <span :class="$style.fieldLabel">Tags</span>
              <input v-model="tagsInput" type="text" placeholder="e.g., #sports, #trending, #news" :class="$style.fieldInput">
              <p v-if="tagsInput" :class="$style.tagPreview">Tags: {{ parseTags(tagsInput).join(', ') }}</p>
            </label>

            <div :class="[$style.fieldGroup, $style.fieldSpan2]">
              <span :class="$style.fieldLabel">Thumbnail</span>
              <label
                :class="[$style.thumbDropzone, { [$style.thumbDropzoneActive]: !!thumbnail }]"
                @dragover.prevent="handleThumbnailDragOver"
                @drop.prevent="handleThumbnailDrop"
              >
                <input type="file" accept="image/*" class="hidden" @change="addThumbnailByFile">
                <template v-if="thumbnail">
                  <img :src="displayThumbnailUrl" alt="Thumbnail preview" :class="$style.thumbDropzoneImage">
                </template>
                <template v-else>
                  <span :class="$style.thumbDropzoneIconWrap">
                    <svg :class="$style.thumbDropzoneIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="14" rx="2.5" />
                      <path d="M7 14l3-3 3 3 4-4 2 2" />
                      <circle cx="9" cy="8" r="1.3" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <span :class="$style.thumbDropzoneText">Select or drag &amp; drop image</span>
                </template>
              </label>
              <button v-if="thumbnail" type="button" :class="$style.thumbRemoveBtn" @click="clearThumbnail">Remove</button>
            </div>
          </div>

          <div :class="$style.popupActions">
            <button
              type="button"
              :class="$style.applyBtn"
              :disabled="isSubmitting || isUploadingImages || !title.trim()"
              @click="submitPost"
            >
              {{ isSubmitting ? (isUploadingImages ? 'Uploading images…' : 'Publishing…') : 'Publish Post' }}
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
  --cp-thumb-drop-bg: rgba(24,24,27,0.03);
  --cp-thumb-drop-bd: rgba(24,24,27,0.20);
  --cp-thumb-drop-fg: #18181b;
  --cp-thumb-remove-bd: rgba(24,24,27,0.18);
  --cp-thumb-remove-fg: #3f3f46;

  --cp-crop-stage-bg:   rgba(24,24,27,0.03);
  --cp-crop-stage-bd:   rgba(24,24,27,0.12);
  --cp-tool-bg:         rgba(24,24,27,0.06);
  --cp-tool-bd:         rgba(24,24,27,0.18);
  --cp-tool-fg:         #18181b;
  --cp-tool-label:      #52525b;

  --cp-apply-bg:        #18181b;
  --cp-apply-bd:        #18181b;
  --cp-apply-fg:        #fafafa;

  --cp-info-bg:         rgba(59,130,246,0.08);
  --cp-info-border:     rgba(59,130,246,0.30);
  --cp-info-fg:         #1d4ed8;
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
  --cp-thumb-drop-bg: rgba(255,255,255,0.03);
  --cp-thumb-drop-bd: rgba(255,255,255,0.22);
  --cp-thumb-drop-fg: #f4f4f5;
  --cp-thumb-remove-bd: rgba(255,255,255,0.22);
  --cp-thumb-remove-fg: #d4d4d8;

  --cp-crop-stage-bg:   rgba(255,255,255,0.03);
  --cp-crop-stage-bd:   rgba(255,255,255,0.12);
  --cp-tool-bg:         rgba(255,255,255,0.08);
  --cp-tool-bd:         rgba(255,255,255,0.20);
  --cp-tool-fg:         #f4f4f5;
  --cp-tool-label:      #a1a1aa;

  --cp-apply-bg:        #f4f4f5;
  --cp-apply-bd:        #f4f4f5;
  --cp-apply-fg:        #111110;

  --cp-info-bg:         rgba(59,130,246,0.12);
  --cp-info-border:     rgba(59,130,246,0.35);
  --cp-info-fg:         #93c5fd;
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
  background: #fee;
  border: 1px solid #f99;
  color: #c33;
}

:global(html.dark) .errorBanner {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.4);
  color: #fca5a5;
}

/* ── Info Banner (image upload progress) ────────────────── */
.infoBanner {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
  background: var(--cp-info-bg);
  border: 1px solid var(--cp-info-border);
  color: var(--cp-info-fg);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
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
  width: min(760px, 96vw);
  max-height: 90vh;
  background: var(--cp-popup-bg);
  border: 1px solid var(--cp-popup-border);
  border-radius: 8px;
  padding: 1rem;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
}
.metaSub {
  margin: 0.15rem 0 0.9rem;
  font-size: 0.85rem;
  color: var(--cp-popup-sub);
}
.metaFields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.fieldSpan2 {
  grid-column: 1 / -1;
}

.popupActions {
  position: sticky;
  bottom: 0;
  background: var(--cp-popup-bg);
  padding-top: 0.7rem;
  margin-top: 0.65rem;
  border-top: 1px solid var(--cp-popup-border);
}

/* Thumbnail controls */
.thumbDropzone {
  width: 100%;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 1.25rem;
  text-align: center;
  border: 2px dotted var(--cp-thumb-drop-bd);
  border-radius: 10px;
  cursor: pointer;
  background: var(--cp-thumb-drop-bg);
  color: var(--cp-thumb-drop-fg);
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease !important;
}
.thumbDropzone:hover {
  border-color: color-mix(in srgb, var(--cp-thumb-drop-bd) 70%, var(--cp-thumb-drop-fg));
  background: color-mix(in srgb, var(--cp-thumb-drop-bg) 65%, var(--cp-thumb-drop-fg) 5%);
}
.thumbDropzoneActive {
  min-height: 220px;
}
.thumbDropzoneImage {
  width: 100%;
  height: 100%;
  min-height: 190px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}
.thumbDropzoneIconWrap {
  width: 3.25rem;
  height: 3.25rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cp-thumb-drop-fg) 8%, transparent);
}
.thumbDropzoneIcon {
  width: 1.65rem;
  height: 1.65rem;
  color: var(--cp-thumb-drop-fg);
}
.thumbDropzoneText {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--cp-thumb-drop-fg);
}

.thumbRemoveBtn {
  align-self: flex-start;
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

@media (max-width: 640px) {
  .metaFields {
    grid-template-columns: 1fr;
  }

  .fieldSpan2 {
    grid-column: auto;
  }
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

/* ── Tag Preview ─────────────────────────────────────────── */
.tagPreview {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: var(--cp-fg-muted);
  font-weight: 500;
}
</style>