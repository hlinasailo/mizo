<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { useBlogService, type BlogPostDetail, type BlogPostListItem } from '~/services/blogService'
import { useCommentService, type Comment } from '~/services/commentService'
import { useUserStore } from '~/stores/user'
import { resolveMediaUrl } from '~/utils/mediaUrl'

defineOptions({ name: 'BlogPostPage' })

const route  = useRoute()
const router = useRouter()
const blogService = useBlogService()
const commentService = useCommentService()
const userStore = useUserStore()

const slug = computed(() => route.params.slug as string)
const postId = computed(() => post.value?.id ?? null)
const post = ref<BlogPostDetail | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

const markdownParser = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
})

// Helper to convert strikethrough in rendered HTML
const processStrikethrough = (html: string): string => {
  return html.replace(/~~([^~]+)~~/g, '<s>$1</s>')
}

const processAlignmentMarkers = (html: string): string => {
  return html.replace(
    /<(p|h[1-6])>(?:\s|&nbsp;)*\[\[align:(left|center|right|justify)\]\]([\s\S]*?)\[\[\/align\]\](?:\s|&nbsp;)*<\/\1>/gi,
    (_match, tag: string, align: string, content: string) => {
      return `<${tag} style="text-align:${align}">${content}</${tag}>`
    },
  )
}

const baseValidateLink = markdownParser.validateLink.bind(markdownParser)
markdownParser.validateLink = (url: string) => {
  const normalized = String(url || '').trim().toLowerCase()
  if (/^data:image\/[a-z0-9.+-]+;base64,/.test(normalized)) {
    return true
  }
  return baseValidateLink(url)
}

const parseImageSizeMeta = (value: string | null | undefined) => {
  const normalized = String(value || '').trim()
  const match = normalized.match(/^size:(\d+|auto)x(\d+|auto)$/i)
  if (!match) return null

  const rawWidth = String(match[1] || '').toLowerCase()
  const rawHeight = String(match[2] || '').toLowerCase()

  const width = rawWidth === 'auto' ? null : Number(rawWidth)
  const height = rawHeight === 'auto' ? null : Number(rawHeight)

  return {
    width: Number.isFinite(width) && (width as number) > 0 ? Math.round(width as number) : null,
    height: Number.isFinite(height) && (height as number) > 0 ? Math.round(height as number) : null,
  }
}

const mergeStyle = (existing: string | null | undefined, additions: string[]) => {
  const base = String(existing || '').trim()
  const merged = [...(base ? [base.replace(/;\s*$/, '')] : []), ...additions]
  return merged.join('; ')
}

// Custom renderers for better formatting
const defaultImageRenderer = markdownParser.renderer.rules.image
markdownParser.renderer.rules.image = (tokens, index, options, env, self) => {
  const token = tokens[index]
  if (!token) return ''

  const srcIndex = token.attrIndex('src')

  if (srcIndex >= 0) {
    const originalSrc = token.attrs?.[srcIndex]?.[1]
    const resolvedSrc = resolveMediaUrl(originalSrc)
    if (resolvedSrc) {
      token.attrSet('src', resolvedSrc)
    }
  }

  const title = token.attrGet('title')
  const imageSize = parseImageSizeMeta(title)
  if (imageSize) {
    const inlineStyle = mergeStyle(token.attrGet('style'), [
      imageSize.width ? `width:${imageSize.width}px` : 'width:auto',
      imageSize.height ? `height:${imageSize.height}px` : 'height:auto',
      'max-width:100%',
    ])
    token.attrSet('style', inlineStyle)

    const titleIndex = token.attrIndex('title')
    if (titleIndex >= 0) {
      token.attrs?.splice(titleIndex, 1)
    }
  }

  return defaultImageRenderer ? defaultImageRenderer(tokens, index, options, env, self) : self.renderToken(tokens, index, options)
}

// Custom header renderer
markdownParser.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  if (!token) return ''
  const level = token.tag.charAt(1)
  return `<${token.tag} class="markdown-h${level} font-bold my-2">`
}

markdownParser.renderer.rules.heading_close = (tokens, idx) => {
  const token = tokens[idx]
  return token ? `</${token.tag}>` : ''
}

// Custom list renderers
markdownParser.renderer.rules.bullet_list_open = () => '<ul class="markdown-ul list-disc list-inside my-2 pl-4">'
markdownParser.renderer.rules.bullet_list_close = () => '</ul>'

markdownParser.renderer.rules.ordered_list_open = () => '<ol class="markdown-ol list-decimal list-inside my-2 pl-4">'
markdownParser.renderer.rules.ordered_list_close = () => '</ol>'

markdownParser.renderer.rules.list_item_open = () => '<li class="markdown-li my-1">'
markdownParser.renderer.rules.list_item_close = () => '</li>'

// Custom blockquote renderer
markdownParser.renderer.rules.blockquote_open = () => '<blockquote class="markdown-blockquote border-l-4 border-gray-400 pl-4 my-2 italic text-gray-600">'
markdownParser.renderer.rules.blockquote_close = () => '</blockquote>'

// Custom code block renderer
markdownParser.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  if (!token) return ''
  const code = token.content
  return `<pre class="markdown-code-block bg-gray-900 text-gray-100 p-4 rounded my-2 overflow-x-auto"><code>${markdownParser.utils.escapeHtml(code)}</code></pre>`
}

// Custom inline code renderer
markdownParser.renderer.rules.code_inline = (tokens, idx) => {
  const token = tokens[idx]
  if (!token) return ''
  return `<code class="markdown-code-inline bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-mono">${markdownParser.utils.escapeHtml(token.content)}</code>`
}

const isProbablyHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

const renderedPostContent = computed(() => {
  const content = String(post.value?.content || '').trim()
  if (!content) return ''
  if (isProbablyHtml(content)) return content
  const rendered = markdownParser.render(content)
  return processAlignmentMarkers(processStrikethrough(rendered))
})

// Likes & Bookmarks state
const mylike = ref(0)
const likecount = ref(0)
const isBookmarked = ref(false)
const isLoadingLike = ref(false)
const isLoadingBookmark = ref(false)

// Related posts state
const relatedPosts = ref<BlogPostListItem[]>([])
const relatedLoading = ref(false)

// Comments state
const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const commentsError = ref('')
const newCommentText = ref('')
const isAddingComment = ref(false)
const showCommentForm = ref(false)
const editingCommentId = ref<number | null>(null)
const editingCommentText = ref('')
const pendingDeleteCommentId = ref<number | null>(null)
const isDeletingComment = ref(false)
const brokenCommentAvatars = ref<Record<string, boolean>>({})

// Copy link state
const linkCopied = ref(false)

const resolveCommentAvatarUrl = (path?: string | null) => {
  if (!path) return null
  const cleaned = path.trim()
  if (!cleaned) return null
  const lowered = cleaned.toLowerCase()
  if (lowered === 'null' || lowered === 'none') return null
  return resolveMediaUrl(cleaned)
}

const getCommentAvatarKey = (commentId: number, src?: string | null) => `${commentId}::${String(src || '').trim()}`

const getCommentAvatarSrc = (comment: Comment) => resolveCommentAvatarUrl(comment.authorphoto)

const canRenderCommentAvatar = (comment: Comment) => {
  const src = getCommentAvatarSrc(comment)
  if (!src) return false
  return !brokenCommentAvatars.value[getCommentAvatarKey(comment.id, src)]
}

const markCommentAvatarBroken = (comment: Comment) => {
  const src = getCommentAvatarSrc(comment)
  if (!src) return
  const key = getCommentAvatarKey(comment.id, src)
  brokenCommentAvatars.value = {
    ...brokenCommentAvatars.value,
    [key]: true,
  }
}

// ── Tag helpers ──────────────────────────────────────────
const normalizeTag = (value: string) => value.trim().replace(/^#+/, '').toLowerCase()

const normalizeTagList = (tags: string[] = []) =>
  tags.map(normalizeTag).filter(Boolean)

const getListItemTags = (item: BlogPostListItem) => {
  const maybeTags = (item as BlogPostListItem & { tags?: unknown }).tags
  if (!Array.isArray(maybeTags)) return []
  return maybeTags.filter((tag): tag is string => typeof tag === 'string')
}

const hasSharedTag = (candidateTags: string[], currentTagSet: Set<string>) => {
  const normalizedCandidate = normalizeTagList(candidateTags)
  return normalizedCandidate.some(tag => currentTagSet.has(tag))
}

const filterRelatedBySharedTags = async (
  candidates: BlogPostListItem[],
  currentTagSet: Set<string>,
) => {
  if (!currentTagSet.size) return candidates

  const checks = await Promise.all(
    candidates.map(async (item) => {
      let tags = getListItemTags(item)

      if (!tags.length && item.slug) {
        try {
          const detail = await blogService.fetchPostDetail(item.slug)
          tags = Array.isArray(detail?.post?.tags) ? detail.post.tags : []
        } catch {
          tags = []
        }
      }

      return { item, matches: hasSharedTag(tags, currentTagSet) }
    }),
  )

  return checks.filter(entry => entry.matches).map(entry => entry.item)
}

// ── Load post ────────────────────────────────────────────
const loadPost = async () => {
  if (!slug.value) {
    post.value = null
    errorMessage.value = 'Invalid post URL.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await blogService.fetchPostDetail(slug.value)
    post.value = response?.post ?? null

    if (post.value?.id) {
      await Promise.all([
        loadRelatedPosts(post.value, response?.related || []),
        loadComments(post.value.id),
        ...(userStore.isAuthenticated ? [loadLikesAndBookmarks(post.value.id)] : []),
      ])
    } else {
      relatedPosts.value = []
    }
  } catch (error: unknown) {
    const status = typeof error === 'object' && error && 'statusCode' in error
      ? Number((error as { statusCode?: number }).statusCode)
      : null

    post.value = null
    relatedPosts.value = []
    errorMessage.value = status === 404
      ? ''
      : 'Unable to load this post right now. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// ── Related posts ────────────────────────────────────────
const loadRelatedPosts = async (currentPost: BlogPostDetail, initialRelated: BlogPostListItem[] = []) => {
  relatedLoading.value = true

  try {
    const currentTagSet = new Set(normalizeTagList(currentPost.tags || []))

    if (initialRelated.length) {
      const initialCandidates = initialRelated
        .filter(item => item.id !== currentPost.id && item.slug !== currentPost.slug)

      const tagMatchedInitial = await filterRelatedBySharedTags(initialCandidates, currentTagSet)
      if (tagMatchedInitial.length || !currentTagSet.size) {
        relatedPosts.value = tagMatchedInitial.slice(0, 3)
        return
      }
    }

    // Fallback: same category
    const response = await blogService.fetchPosts(1, currentPost.category)
    const categoryCandidates = (response.results || [])
      .filter(item => item.id !== currentPost.id && item.slug !== currentPost.slug)

    const tagMatchedCategory = await filterRelatedBySharedTags(categoryCandidates, currentTagSet)
    relatedPosts.value = tagMatchedCategory.slice(0, 3)
  } catch {
    relatedPosts.value = []
  } finally {
    relatedLoading.value = false
  }
}

// ── Likes & Bookmarks ────────────────────────────────────
const loadLikesAndBookmarks = async (id: number) => {
  try {
    const [likeInfo, bookmarkStatus] = await Promise.all([
      blogService.fetchLikes(id),
      blogService.fetchBookmarkStatus(id),
    ])
    mylike.value = likeInfo.mylike
    likecount.value = likeInfo.likecount
    isBookmarked.value = bookmarkStatus.isBookmarked
  } catch (error: unknown) {
    console.error('Failed to load likes/bookmarks:', error)
    mylike.value = 0
    likecount.value = 0
    isBookmarked.value = false
  }
}

const handleToggleLike = async () => {
  if (!postId.value || !userStore.isAuthenticated || isLoadingLike.value) return

  isLoadingLike.value = true
  try {
    const result = await blogService.toggleLike(postId.value)
    mylike.value = result.isLiked ? 1 : 0
    likecount.value = result.likecount
  } catch (error: unknown) {
    console.error('Failed to toggle like:', error)
    if (postId.value) await loadLikesAndBookmarks(postId.value)
  } finally {
    isLoadingLike.value = false
  }
}

const handleToggleBookmark = async () => {
  if (!postId.value || !userStore.isAuthenticated || isLoadingBookmark.value) return

  isLoadingBookmark.value = true
  try {
    const result = await blogService.toggleBookmark(postId.value)
    isBookmarked.value = result.isBookmarked
  } catch (error: unknown) {
    console.error('Failed to toggle bookmark:', error)
    if (postId.value) {
      const bookmarkStatus = await blogService.fetchBookmarkStatus(postId.value)
      isBookmarked.value = bookmarkStatus.isBookmarked
    }
  } finally {
    isLoadingBookmark.value = false
  }
}

const handleLikeClick = () => {
  if (!userStore.isAuthenticated) { router.push('/login'); return }
  void handleToggleLike()
}

const handleBookmarkClick = () => {
  if (!userStore.isAuthenticated) { router.push('/login'); return }
  void handleToggleBookmark()
}

// ── Share ────────────────────────────────────────────────
const getCurrentUrl = () => typeof window !== 'undefined' ? window.location.href : ''

const getShareText = () => `Check out this article: "${post.value?.title || 'Interesting Post'}"`

const handleShareFacebook = () => {
  const url = getCurrentUrl()
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
}

const handleShareWhatsApp = () => {
  const url = getCurrentUrl()
  const text = getShareText()
  window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
}

const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(getCurrentUrl())
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch (error: unknown) {
    console.error('Failed to copy link:', error)
  }
}

// ── Comments ─────────────────────────────────────────────
const loadComments = async (id: number) => {
  commentsLoading.value = true
  commentsError.value = ''
  try {
    const response = await commentService.fetchComments(id)
    comments.value = (response.results || []).map(comment => ({
      ...comment,
      authorphoto: resolveCommentAvatarUrl(comment.authorphoto),
    }))
  } catch (error: unknown) {
    commentsError.value = error instanceof Error ? error.message : 'Failed to load comments'
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const submitComment = async () => {
  if (!newCommentText.value.trim() || !postId.value || !userStore.isAuthenticated) return

  isAddingComment.value = true
  try {
    await commentService.createComment(postId.value, newCommentText.value)
    newCommentText.value = ''
    showCommentForm.value = false
    await loadComments(postId.value)
  } catch (error: unknown) {
    commentsError.value = error instanceof Error ? error.message : 'Failed to add comment'
  } finally {
    isAddingComment.value = false
  }
}

const startEditComment = (comment: Comment) => {
  editingCommentId.value = comment.id
  editingCommentText.value = comment.content
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editingCommentText.value = ''
}

const saveEditComment = async (commentId: number) => {
  if (!editingCommentText.value.trim()) return

  try {
    await commentService.updateComment(commentId, editingCommentText.value)
    editingCommentId.value = null
    editingCommentText.value = ''
    if (postId.value) await loadComments(postId.value)
  } catch (error: unknown) {
    commentsError.value = error instanceof Error ? error.message : 'Failed to update comment'
  }
}

const openDeleteCommentModal = (commentId: number) => {
  pendingDeleteCommentId.value = commentId
}

const cancelDeleteComment = () => {
  if (isDeletingComment.value) return
  pendingDeleteCommentId.value = null
}

const confirmDeleteComment = async () => {
  const commentId = pendingDeleteCommentId.value
  if (!commentId) return

  isDeletingComment.value = true
  try {
    await commentService.deleteComment(commentId)
    pendingDeleteCommentId.value = null
    if (postId.value) await loadComments(postId.value)
  } catch (error: unknown) {
    commentsError.value = error instanceof Error ? error.message : 'Failed to delete comment'
  } finally {
    isDeletingComment.value = false
  }
}

const isCommentAuthor = (comment: Comment): boolean => {
  const currentUser = userStore.user?.username?.trim().toLowerCase()
  const commentAuthor = (comment.author || '').trim().toLowerCase()
  return !!currentUser && currentUser === commentAuthor
}

const getCommentAuthor = (comment: Comment) => (comment.author || 'Unknown').trim() || 'Unknown'
const getCommentInitial = (comment: Comment) => getCommentAuthor(comment).charAt(0).toUpperCase()
const getCommentDate = (comment: Comment) => comment.date ? formatDateShort(comment.date) : 'Unknown date'

onMounted(() => { void loadPost() })
watch(slug, () => { void loadPost() })

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const formatDateShort = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
</script>

<template>
  <main :class="$style.page">
    <div :class="$style.gridOverlay" />

    <section :class="$style.section">
      <div :class="$style.card">

        <!-- ── Loading ─────────────────────────────────────── -->
        <div v-if="isLoading" :class="$style.notFound">
          <p :class="$style.notFoundTitle">Loading post...</p>
        </div>

        <!-- ── Error ───────────────────────────────────────── -->
        <div v-else-if="errorMessage" :class="$style.notFound">
          <p :class="$style.notFoundTitle">{{ errorMessage }}</p>
          <button :class="$style.backBtn" @click="router.back()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        <!-- ── Not Found ───────────────────────────────────── -->
        <div v-else-if="!post" :class="$style.notFound">
          <p :class="$style.notFoundTitle">Post not found</p>
          <button :class="$style.backBtn" @click="router.back()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        <!-- ── Post ───────────────────────────────────────── -->
        <template v-else>

          <!-- Header -->
          <div :class="$style.header">
            <div :class="$style.headerTopLeft">
              <button :class="$style.backArrow" title="Go back" @click="router.back()">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            <!-- Category + Title -->
            <div :class="$style.titleBlock">
              <span :class="$style.categoryLabel">{{ post.category }}</span>
              <h1 :class="$style.title">{{ post.title }}</h1>
            </div>

            <div :class="$style.titleBar" />

            <!-- Meta + Top-right actions -->
            <div :class="$style.metaRow">
              <div :class="$style.meta">
                <span :class="$style.metaAuthor">@{{ post.author }}</span>
                <span :class="$style.metaDot">•</span>
                <span :class="$style.metaDate">{{ formatDate(post.date) }}</span>
                <span :class="$style.metaDot">•</span>
                <span :class="$style.metaBadge">{{ post.category }}</span>
              </div>

              <div :class="$style.topActions">
                <button
                  :class="[$style.actionIconBtn, mylike === 1 ? $style.active : '']"
                  :disabled="isLoadingLike"
                  :title="userStore.isAuthenticated ? (mylike === 1 ? 'Unlike' : 'Like') : 'Login to like'"
                  @click="handleLikeClick"
                >
                  <svg class="w-6 h-6" :fill="mylike === 1 ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span :class="$style.count">{{ likecount }}</span>
                </button>

                <button
                  :class="[$style.actionIconBtn, isBookmarked ? $style.active : '']"
                  :disabled="isLoadingBookmark"
                  :title="userStore.isAuthenticated ? (isBookmarked ? 'Remove bookmark' : 'Bookmark') : 'Login to bookmark'"
                  @click="handleBookmarkClick"
                >
                  <svg class="w-6 h-6" :fill="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Content -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div :class="$style.prose" class="markdown-prose" v-html="renderedPostContent" />

          <!-- Share (inline, after content) -->
          <div :class="$style.shareInline">
            <span :class="$style.shareLabel">(Share)</span>

            <button :class="$style.shareInlineBtn" title="Share on Facebook" @click="handleShareFacebook">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button :class="$style.shareInlineBtn" title="Share on WhatsApp" @click="handleShareWhatsApp">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 2.827.737 5.484 2.027 7.789L0 32l8.418-2.007A15.934 15.934 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.267 13.267 0 0 1-6.756-1.843l-.484-.287-5.006 1.194 1.238-4.87-.317-.5A13.234 13.234 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.878c-.398-.199-2.354-1.162-2.719-1.294-.365-.133-.63-.199-.896.199-.265.398-1.029 1.294-1.261 1.56-.232.265-.465.298-.863.1-.398-.2-1.681-.62-3.203-1.977-1.184-1.057-1.983-2.363-2.215-2.761-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.697.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.896-2.16-1.228-2.958-.323-.776-.651-.671-.896-.683-.232-.01-.498-.013-.763-.013-.265 0-.697.1-1.062.498-.365.398-1.394 1.362-1.394 3.322 0 1.96 1.427 3.854 1.626 4.12.199.265 2.809 4.29 6.807 6.018.951.41 1.693.655 2.271.839.954.303 1.823.26 2.51.158.765-.114 2.354-.962 2.686-1.89.332-.929.332-1.726.232-1.89-.099-.165-.365-.265-.763-.465z"/>
              </svg>
            </button>

            <button
              :class="[$style.shareInlineBtn, linkCopied ? $style.shareInlineBtnCopied : '']"
              :title="linkCopied ? 'Copied!' : 'Copy link'"
              @click="handleCopyLink"
            >
              <svg v-if="!linkCopied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-if="linkCopied" :class="$style.copiedLabel">Copied!</span>
            </button>
          </div>

          <!-- Footer -->
          <div :class="$style.footer">
            <div :class="$style.footerRight">
              <button :class="$style.backBtn" @click="router.back()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Posts
              </button>
            </div>
          </div>

        </template>
      </div>

      <!-- ── Related Card ────────────────────────────────── -->
      <div v-if="!isLoading && !errorMessage && post" :class="[$style.card, $style.relatedCard]">
        <div :class="$style.relatedHeader">
          <h2 :class="$style.relatedTitle">Related</h2>
          <div v-if="post.tags?.length" :class="$style.relatedTags">
            <span v-for="tag in post.tags.slice(0, 5)" :key="tag" :class="$style.relatedTag">#{{ tag }}</span>
          </div>
        </div>

        <div v-if="relatedLoading" :class="$style.relatedGrid">
          <div v-for="n in 3" :key="`related-skeleton-${n}`" :class="$style.relatedSkeleton">
            <div :class="$style.relatedSkeletonImage" />
            <div :class="$style.relatedSkeletonLine" />
            <div :class="$style.relatedSkeletonLineShort" />
          </div>
        </div>

        <div v-else-if="relatedPosts.length" :class="$style.relatedGrid">
          <article
            v-for="related in relatedPosts"
            :key="related.id"
            :class="$style.relatedItem"
            @click="router.push(`/blog/${related.slug}`)"
          >
            <div :class="$style.relatedImageWrap">
              <img
                v-if="related.coverimage"
                :src="resolveMediaUrl(related.coverimage) || ''"
                :alt="related.title"
                :class="$style.relatedImage"
              >
              <div v-else :class="$style.relatedImagePlaceholder">Mizomade</div>
            </div>
            <div :class="$style.relatedBody">
              <h3 :class="$style.relatedItemTitle">{{ related.title }}</h3>
              <div :class="$style.relatedMeta">
                <span :class="$style.relatedAuthor">@{{ related.author }}</span>
                <span :class="$style.metaDot">•</span>
                <span :class="$style.relatedDate">{{ formatDateShort(related.date) }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else :class="$style.noRelated">
          <p>No related posts available yet.</p>
        </div>
      </div>

      <!-- ── Comments Card ───────────────────────────────── -->
      <div v-if="!isLoading && !errorMessage && post" :class="[$style.card, $style.commentsCard]">
        <div :class="$style.commentsSection">
          <h2 :class="$style.commentsTitle">Comments</h2>

          <!-- Add Comment Button / Form -->
          <div v-if="!showCommentForm" :class="$style.addCommentButtonWrapper">
            <button
              v-if="userStore.isAuthenticated"
              :class="$style.addCommentBtn"
              @click="showCommentForm = true"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.3-2-2.5s-4.506-.7-6.5 0C1.964 2.526.75 3.578.75 5c0 5 0 5.5-.75 5.5s.75.5.75 4.5C.75 20 3 21 3 21z" />
              </svg>
              ADD COMMENT ...
            </button>
            <button
              v-else
              :class="$style.addCommentBtn"
              @click="router.push('/login')"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.3-2-2.5s-4.506-.7-6.5 0C1.964 2.526.75 3.578.75 5c0 5 0 5.5-.75 5.5s.75.5.75 4.5C.75 20 3 21 3 21z" />
              </svg>
              LOGIN TO COMMENT
            </button>
          </div>

          <!-- Comment Form -->
          <div v-else :class="$style.commentForm">
            <textarea
              v-model="newCommentText"
              :class="$style.commentInput"
              placeholder="Write your comment here..."
              rows="4"
            />
            <div :class="$style.formActions">
              <button
                :class="$style.submitBtn"
                :disabled="!newCommentText.trim() || isAddingComment"
                @click="submitComment"
              >
                {{ isAddingComment ? 'Posting...' : 'Post Comment' }}
              </button>
              <button
                :class="$style.cancelBtn"
                @click="() => { showCommentForm = false; newCommentText = ''; commentsError = '' }"
              >
                Cancel
              </button>
            </div>
            <div v-if="commentsError" :class="$style.errorMessage">{{ commentsError }}</div>
          </div>

          <!-- Comments Loading -->
          <div v-if="commentsLoading" :class="$style.commentsLoading">
            <p>Loading comments...</p>
          </div>

          <!-- Comments List -->
          <div v-else :class="$style.commentsList">
            <div v-if="comments.length === 0" :class="$style.noComments">
              <p>No comments yet. Be the first to comment!</p>
            </div>

            <div v-for="comment in comments" :key="comment.id" :class="$style.commentCard">
              <!-- Avatar + Author + Date -->
              <div :class="$style.commentHeader">
                <img
                  v-if="canRenderCommentAvatar(comment)"
                  :src="getCommentAvatarSrc(comment) || ''"
                  :alt="`${getCommentAuthor(comment)}'s avatar`"
                  :class="$style.commentAvatar"
                  @error="markCommentAvatarBroken(comment)"
                >
                <div v-else :class="$style.commentAvatarPlaceholder">
                  {{ getCommentInitial(comment) }}
                </div>
                <div :class="$style.commentMeta">
                  <span :class="$style.commentAuthor">@{{ getCommentAuthor(comment) }}</span>
                  <span :class="$style.commentDate">{{ getCommentDate(comment) }}</span>
                </div>
              </div>

              <!-- Comment Content or Edit Form -->
              <div v-if="editingCommentId === comment.id" :class="$style.editCommentForm">
                <textarea
                  v-model="editingCommentText"
                  :class="$style.commentEditInput"
                  rows="3"
                />
                <div :class="$style.editActions">
                  <button :class="$style.saveBtn" @click="saveEditComment(comment.id)">Save</button>
                  <button :class="$style.cancelEditBtn" @click="cancelEditComment">Cancel</button>
                </div>
              </div>
              <p v-else :class="$style.commentContent">{{ comment.content }}</p>

              <!-- Edit/Delete Actions -->
              <div v-if="isCommentAuthor(comment) && editingCommentId !== comment.id" :class="$style.commentActions">
                <button :class="$style.editBtn" @click="startEditComment(comment)">EDIT</button>
                <button :class="$style.deleteBtn" @click="openDeleteCommentModal(comment.id)">DELETE</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Delete Confirm Modal ────────────────────────── -->
      <div
        v-if="pendingDeleteCommentId"
        :class="$style.deleteModalOverlay"
        @click="cancelDeleteComment"
      >
        <div :class="$style.deleteModal" @click.stop>
          <h3 :class="$style.deleteModalTitle">Delete Comment?</h3>
          <p :class="$style.deleteModalText">This action cannot be undone.</p>
          <div :class="$style.deleteModalActions">
            <button
              type="button"
              :class="$style.deleteModalCancel"
              :disabled="isDeletingComment"
              @click="cancelDeleteComment"
            >
              Cancel
            </button>
            <button
              type="button"
              :class="$style.deleteModalConfirm"
              :disabled="isDeletingComment"
              @click="confirmDeleteComment"
            >
              {{ isDeletingComment ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style module>
/* ── Tokens ───────────────────────────────────────────────── */
:global(:root) {
  --bp-page-bg:         #e8e6e6;
  --bp-grid-color:      rgba(0, 0, 0, 0.077);
  --bp-card-bg:         rgba(255,255,255,0.75);
  --bp-card-border:     rgba(0,0,0,0.08);
  --bp-card-shadow:     0 2px 24px rgba(0,0,0,0.07);

  --bp-back-fg:         #999895;
  --bp-back-hover:      #111110;

  --bp-cat-label:       #aaa9a5;
  --bp-title:           #111110;
  --bp-bar:             rgba(0,0,0,0.20);

  --bp-author:          #333331;
  --bp-dot:             #cccbc7;
  --bp-date:            #888884;
  --bp-badge-bg:        rgba(0,0,0,0.06);
  --bp-badge-border:    rgba(0,0,0,0.12);
  --bp-badge-fg:        #666663;

  --bp-h2:              #111110;
  --bp-h3:              #333331;
  --bp-p:               #55534f;
  --bp-bq-border:       #cccbc7;
  --bp-bq-fg:           #888884;
  --bp-bq-bg:           rgba(0,0,0,0.03);
  --bp-hr:              #cccbc7;
  --bp-li-marker:       #cccbc7;
  --bp-li-fg:           #55534f;
  --bp-strong:          #222220;

  --bp-footer-border:   rgba(0,0,0,0.10);

  --bp-notfound-bg:     rgba(0,0,0,0.04);
  --bp-notfound-border: rgba(0,0,0,0.09);
  --bp-notfound-fg:     #888884;

  --bp-comment-bg:      #f5f5f5;
  --bp-comment-border:  #e0e0e0;
  --bp-comment-text:    #333;
  --bp-comment-meta:    #999;
  --bp-button-bg:       #f0f0f0;
  --bp-button-hover:    #e0e0e0;
  --bp-action-text:     #666;
}

:global(html.dark) {
  --bp-page-bg:         #0f0f11;
  --bp-grid-color:      rgba(255, 255, 255, 0.078);
  --bp-card-bg:         rgba(255,255,255,0.04);
  --bp-card-border:     rgba(255,255,255,0.08);
  --bp-card-shadow:     0 2px 24px rgba(0,0,0,0.40);

  --bp-back-fg:         #52525b;
  --bp-back-hover:      #ffffff;

  --bp-cat-label:       #52525b;
  --bp-title:           #ffffff;
  --bp-bar:             #52525b;

  --bp-author:          #d4d4d8;
  --bp-dot:             #3f3f46;
  --bp-date:            #71717a;
  --bp-badge-bg:        transparent;
  --bp-badge-border:    #3f3f46;
  --bp-badge-fg:        #71717a;

  --bp-h2:              #ffffff;
  --bp-h3:              #e4e4e7;
  --bp-p:               #e4e0e0;
  --bp-bq-border:       #52525b;
  --bp-bq-fg:           #71717a;
  --bp-bq-bg:           rgba(255,255,255,0.03);
  --bp-hr:              #3f3f46;
  --bp-li-marker:       #52525b;
  --bp-li-fg:           #a1a1aa;
  --bp-strong:          #d4d4d8;

  --bp-footer-border:   #3f3f46;

  --bp-notfound-bg:     #18181b;
  --bp-notfound-border: #27272a;
  --bp-notfound-fg:     #52525b;

  --bp-comment-bg:      #18181b;
  --bp-comment-border:  #27272a;
  --bp-comment-text:    #e4e4e7;
  --bp-comment-meta:    #71717a;
  --bp-button-bg:       #27272a;
  --bp-button-hover:    #3f3f46;
  --bp-action-text:     #a1a1aa;
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
  position: relative;
  min-height: 100vh;
  background: var(--bp-page-bg);
  padding: 6rem 1.5rem 4rem;
}
@media (min-width: 1024px) { .page { padding-left: 3rem; padding-right: 3rem; } }

.gridOverlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(var(--bp-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--bp-grid-color) 1px, transparent 1px);
  background-size: 120px 120px;
}

.section {
  position: relative;
  z-index: 1;
  max-width: 56rem;
  margin: 0 auto;
}

/* ── Card ───────────────────────────────────────────────── */
.card {
  background: var(--bp-card-bg);
  border: 1px solid var(--bp-card-border);
  border-radius: 4px;
  box-shadow: var(--bp-card-shadow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem 2rem 2.5rem;
}
@media (min-width: 768px) { .card { padding: 3rem; } }

/* ── Not found ──────────────────────────────────────────── */
.notFound {
  text-align: center;
  padding: 6rem 2rem;
  background: var(--bp-notfound-bg);
  border: 1px solid var(--bp-notfound-border);
}
.notFoundTitle {
  color: var(--bp-notfound-fg);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

/* ── Header ─────────────────────────────────────────────── */
.header { margin-bottom: 2.5rem; }

.headerTopLeft {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.backArrow {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--bp-back-fg);
  display: inline-flex;
  transition: color 0.2s ease !important;
}
.backArrow:hover { color: var(--bp-back-hover); }

.titleBlock  { margin-bottom: 1.5rem; }
.categoryLabel {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--bp-cat-label);
  margin-bottom: 0.75rem;
}
.title {
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.05;
  text-transform: uppercase;
  font-size: clamp(1.75rem, 5vw, 3.5rem);
  color: var(--bp-title);
}

.titleBar {
  width: 6rem;
  height: 3px;
  background: var(--bp-bar);
  margin-bottom: 1.5rem;
}

.metaRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.875rem;
}
.metaAuthor { color: var(--bp-author); font-weight: 500; }
.metaDot    { color: var(--bp-dot); }
.metaDate   { color: var(--bp-date); }
.metaBadge  {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--bp-badge-fg);
  border: 1px solid var(--bp-badge-border);
  background: var(--bp-badge-bg);
  padding: 0.2rem 0.5rem;
}

.topActions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
}

.actionIconBtn {
  background: none;
  border: none;
  color: var(--bp-back-fg);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease !important;
}
.actionIconBtn:hover:not(:disabled) {
  color: var(--bp-back-hover);
  transform: scale(1.05);
}
.actionIconBtn.active { color: var(--bp-back-fg); }
.actionIconBtn:disabled { opacity: 0.5; cursor: not-allowed; }

.count {
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.25rem;
}

/* ── Back button ────────────────────────────────────────── */
.backBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--bp-back-fg);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  transition: color 0.2s ease !important;
}
.backBtn:hover { color: var(--bp-back-hover); }

/* ── Footer ─────────────────────────────────────────────── */
.footer {
  border-top: 1px solid var(--bp-footer-border);
  margin-top: 4rem;
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}
.footerRight { display: flex; gap: 1rem; }

/* ── Share ───────────────────────────────────────────────── */
.shareInline {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1rem;
  color: var(--bp-back-fg);
}
.shareLabel {
  font-size: 0.9rem;
  color: var(--bp-back-fg);
}
.shareInlineBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-width: 1.5rem;
  height: 1.5rem;
  background: none;
  border: none;
  color: var(--bp-back-fg);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease !important;
}
.shareInlineBtn:hover { color: var(--bp-back-hover); }
.shareInlineBtnCopied { color: var(--bp-date) !important; }
.copiedLabel {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ── Prose ───────────────────────────────────────────────── */
:global(.markdown-prose h1) {
  font-size: 1.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--bp-h2);
  margin: 2.5rem 0 1rem;
  line-height: 1.1;
}
:global(.markdown-prose h2) {
  font-size: 1.375rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--bp-h2);
  margin: 2.25rem 0 1rem;
  line-height: 1.1;
}
:global(.markdown-prose h3) {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--bp-h3);
  margin: 1.75rem 0 0.75rem;
}
:global(.markdown-prose h4),
:global(.markdown-prose h5),
:global(.markdown-prose h6) {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--bp-h3);
  margin: 1.25rem 0 0.625rem;
}
:global(.markdown-prose p) {
  color: var(--bp-p);
  line-height: 1.85;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}
:global(.markdown-prose blockquote) {
  border-left: 3px solid var(--bp-bq-border);
  background: var(--bp-bq-bg);
  padding: 0.75rem 1rem 0.75rem 1.25rem;
  color: var(--bp-bq-fg);
  font-style: italic;
  margin: 2rem 0;
  font-size: 1rem;
  line-height: 1.7;
}
:global(.markdown-prose hr) {
  border: 0;
  border-top: 1px solid var(--bp-hr);
  margin: 1.5rem 0;
}
:global(.markdown-prose ul) {
  list-style-type: disc;
  list-style-position: outside;
  margin: 0 0 1.25rem;
  padding-left: 1.8rem;
}
:global(.markdown-prose ol) {
  list-style-type: decimal;
  list-style-position: outside;
  margin: 0 0 1.25rem;
  padding-left: 1.8rem;
}
:global(.markdown-prose ul li),
:global(.markdown-prose ol li) {
  color: var(--bp-li-fg);
  margin: 0.35rem 0;
  font-size: 0.9375rem;
  line-height: 1.7;
}
:global(.markdown-prose ul li::marker) {
  color: var(--bp-strong);
  font-weight: 900;
  font-size: 1.15em;
}
:global(.markdown-prose ol li::marker) {
  color: var(--bp-strong);
  font-weight: 800;
  font-size: 1em;
}
:global(.markdown-prose strong) {
  color: var(--bp-strong);
  font-weight: 700;
}
:global(.markdown-prose u),
:global(.markdown-prose ins) {
  color: var(--bp-strong);
  text-decoration-line: underline;
  text-decoration-color: var(--bp-strong);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}
:global(.markdown-prose img) {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  margin: 1.25rem 0;
}

:global(.markdown-prose p[style*="text-align:center"] img) {
  margin-left: auto;
  margin-right: auto;
}

:global(.markdown-prose p[style*="text-align:right"] img) {
  margin-left: auto;
  margin-right: 0;
}

:global(.markdown-prose p[style*="text-align:left"] img),
:global(.markdown-prose p[style*="text-align:justify"] img) {
  margin-left: 0;
  margin-right: auto;
}

/* ── Related ─────────────────────────────────────────────── */
.relatedCard { margin-top: 1.5rem; }

.relatedHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.relatedTitle {
  font-size: 1.9rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--bp-h2);
}
.relatedTags { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.relatedTag {
  padding: 0.3rem 0.55rem;
  border-radius: 4px;
  background: var(--bp-button-bg);
  border: 1px solid var(--bp-comment-border);
  color: var(--bp-action-text);
  font-size: 0.7rem;
  font-weight: 700;
}

.relatedGrid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}
@media (min-width: 768px) {
  .relatedGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.relatedItem {
  background: var(--bp-comment-bg);
  border: 1px solid var(--bp-comment-border);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}
.relatedImageWrap {
  aspect-ratio: 16 / 10;
  background: var(--bp-button-bg);
  overflow: hidden;
}
.relatedImage { width: 100%; height: 100%; object-fit: cover; }
.relatedImagePlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bp-comment-meta);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.relatedBody { padding: 0.95rem; }
.relatedItemTitle {
  color: var(--bp-comment-text);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.35;
  margin-bottom: 0.7rem;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.relatedMeta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.78rem;
}
.relatedAuthor { color: var(--bp-comment-text); font-weight: 700; }
.relatedDate   { color: var(--bp-comment-meta); }
.noRelated {
  text-align: center;
  padding: 1.8rem 1rem;
  color: var(--bp-comment-meta);
}

.relatedSkeleton {
  background: var(--bp-comment-bg);
  border: 1px solid var(--bp-comment-border);
  border-radius: 10px;
  overflow: hidden;
}
.relatedSkeletonImage {
  aspect-ratio: 16 / 10;
  background: color-mix(in srgb, var(--bp-button-bg) 80%, transparent);
}
.relatedSkeletonLine {
  height: 12px;
  margin: 0.9rem 0.9rem 0.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bp-button-bg) 75%, transparent);
}
.relatedSkeletonLineShort {
  height: 10px;
  margin: 0 0.9rem 0.9rem;
  width: 55%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bp-button-bg) 75%, transparent);
}

/* ── Comments ────────────────────────────────────────────── */
.commentsCard    { margin-top: 1.5rem; }
.commentsSection { margin-top: 0; padding-top: 0; border-top: none; }

.commentsTitle {
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--bp-h2);
  margin-bottom: 1.5rem;
}

.addCommentButtonWrapper { margin-bottom: 2rem; }
.addCommentBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bp-button-bg);
  border: 1px solid var(--bp-comment-border);
  padding: 0.6rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: var(--bp-action-text);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: background-color 0.2s ease, border-color 0.2s ease !important;
}
.addCommentBtn:hover {
  background: var(--bp-button-hover);
  border-color: var(--bp-action-text);
}

.commentForm {
  background: var(--bp-comment-bg);
  border: 1px solid var(--bp-comment-border);
  border-radius: 4px;
  padding: 1.25rem;
  margin-bottom: 2rem;
}
.commentInput {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--bp-comment-border);
  border-radius: 4px;
  color: var(--bp-comment-text);
  font-family: inherit;
  font-size: 0.9375rem;
  resize: vertical;
  margin-bottom: 1rem;
}
.commentInput:focus { outline: none; border-color: var(--bp-action-text); }

.formActions { display: flex; gap: 0.75rem; }

.submitBtn {
  background: var(--bp-button-bg);
  border: 1px solid var(--bp-comment-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  color: var(--bp-action-text);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: background-color 0.2s ease !important;
}
.submitBtn:hover:not(:disabled) { background: var(--bp-button-hover); }
.submitBtn:disabled { opacity: 0.5; cursor: not-allowed; }

.cancelBtn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--bp-action-text);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.2s ease !important;
}
.cancelBtn:hover { color: var(--bp-back-hover); }

.errorMessage {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.75rem;
}

.commentsLoading,
.noComments {
  text-align: center;
  padding: 2rem;
  color: var(--bp-comment-meta);
}

.commentsList { display: flex; flex-direction: column; gap: 1rem; }

.commentCard {
  background: var(--bp-comment-bg);
  border: 1px solid var(--bp-comment-border);
  border-radius: 4px;
  padding: 1.25rem;
}

.commentHeader {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}
.commentAvatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.commentAvatarPlaceholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bp-button-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bp-action-text);
  font-weight: 700;
  flex-shrink: 0;
}
.commentMeta { display: flex; gap: 0.6rem; align-items: center; }
.commentAuthor { color: var(--bp-comment-text); font-weight: 700; font-size: 0.85rem; }
.commentDate   { color: var(--bp-comment-meta); font-size: 0.8rem; }

.commentContent {
  color: var(--bp-comment-text);
  line-height: 1.6;
  margin-bottom: 0.75rem;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.editCommentForm { margin-bottom: 0.75rem; }
.commentEditInput {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--bp-comment-border);
  border-radius: 4px;
  color: var(--bp-comment-text);
  font-family: inherit;
  font-size: 0.9375rem;
  resize: vertical;
  margin-bottom: 0.75rem;
}
.commentEditInput:focus { outline: none; border-color: var(--bp-action-text); }
.editActions { display: flex; gap: 0.5rem; }

.saveBtn {
  background: var(--bp-button-bg);
  border: 1px solid var(--bp-comment-border);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  color: var(--bp-action-text);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.saveBtn:hover { background: var(--bp-button-hover); }

.cancelEditBtn {
  background: none;
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  color: var(--bp-action-text);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.cancelEditBtn:hover { color: var(--bp-back-hover); }

.commentActions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
.editBtn,
.deleteBtn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--bp-action-text);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color 0.2s ease !important;
}
.editBtn:hover   { color: var(--bp-back-hover); }
.deleteBtn:hover { color: #e74c3c; }

/* ── Delete Modal ────────────────────────────────────────── */
.deleteModalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.deleteModal {
  width: min(100%, 28rem);
  background: var(--bp-comment-bg);
  border: 1px solid var(--bp-comment-border);
  border-radius: 8px;
  box-shadow: 0 20px 45px rgba(0,0,0,0.35);
  padding: 1.2rem 1.2rem 1rem;
}
.deleteModalTitle {
  color: var(--bp-comment-text);
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.4rem;
}
.deleteModalText {
  color: var(--bp-comment-meta);
  font-size: 0.88rem;
  margin-bottom: 1rem;
}
.deleteModalActions { display: flex; justify-content: flex-end; gap: 0.6rem; }

.deleteModalCancel,
.deleteModalConfirm {
  border: 1px solid var(--bp-comment-border);
  border-radius: 4px;
  padding: 0.42rem 0.8rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
}
.deleteModalCancel {
  color: var(--bp-action-text);
  background: var(--bp-button-bg);
}
.deleteModalCancel:hover:not(:disabled) { background: var(--bp-button-hover); }
.deleteModalConfirm {
  color: #ffffff;
  background: #c0392b;
  border-color: #c0392b;
}
.deleteModalConfirm:hover:not(:disabled) { background: #a93226; border-color: #a93226; }
.deleteModalCancel:disabled,
.deleteModalConfirm:disabled { opacity: 0.6; cursor: not-allowed; }
</style>