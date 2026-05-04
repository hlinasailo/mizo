<template>
  <div :class="$style.dashboard">

    <!-- Profile Hero -->
    <div :class="$style.profileHero">
      <!-- Cover Image -->
      <div :class="$style.coverImg">
        <img
          v-if="activeProfileUser?.coverPhoto"
          :src="activeProfileUser.coverPhoto"
          alt="Cover photo"
          :class="$style.coverImg__img"
        >
        <div v-else :class="$style.coverImg__placeholder" />
      </div>

      <!-- Avatar centered below cover -->
      <div :class="$style.avatarWrap">
        <div :class="$style.avatar">
          <img v-if="activeProfileUser?.profilePhoto" :src="activeProfileUser.profilePhoto" alt="Profile photo" :class="$style.avatarImage">
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <h2 :class="$style.profileName">{{ profileDisplayName }}</h2>
        <span :class="$style.profileHandle">@{{ profileUsername }}</span>
        <p v-if="activeProfileUser?.bio" :class="$style.profileBio">
          {{ activeProfileUser.bio }}
        </p>

        <!-- Edit Profile Button -->
        <NuxtLink v-if="!isViewingExternalProfile" to="/edit-profile" :class="$style.editProfileBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit Profile
        </NuxtLink>
      </div>
    </div>

    <!-- Tabs -->
    <nav :class="$style.tabs">
      <NuxtLink v-if="!isViewingExternalProfile" to="/create" :class="[$style.tabs__item, $style.tabs__item_link]">
        <IconEdit :class="$style.tabs__icon" />
        Create
      </NuxtLink>
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[$style.tabs__item, { [$style.tabs__item_active]: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" :class="$style.tabs__icon" />
        {{ tab.label }}
      </button>
      <span v-if="isViewingExternalProfile" :class="[$style.tabs__item, $style.tabs__item_active]">
        <IconDoc :class="$style.tabs__icon" />
        Posts
      </span>
    </nav>

    <!-- Tab Content -->
    <main :class="$style.content">

      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'">
        <h2 :class="$style.content__heading">{{ postsHeading }}</h2>
        <div v-if="currentPostsLoading" :class="$style.post_card">{{ currentPostsLoadingText }}</div>
        <div v-else-if="currentPostsError" :class="$style.post_card">{{ currentPostsError }}</div>
        <div v-else-if="!publishedPosts.length" :class="$style.post_card">No post</div>
        <div v-else :class="[$style.bookmark_grid, $style.bookmark_grid_center]">
          <article
            v-for="post in publishedPosts"
            :key="post.id"
            :class="[$style.blog_card, { [$style.blog_card_clickable]: !!post.slug }]"
            @click="post.slug && router.push(`/blog/${post.slug}`)"
          >
            <div :class="$style.blog_thumb">
              <img
                v-if="post.coverimage"
                :src="resolveMediaUrl(post.coverimage) || ''"
                :alt="post.title"
                :class="$style.blog_thumbImg"
              >
              <div v-else :class="$style.blog_thumbFallback">
                <span :class="$style.blog_thumbFallbackLabel">{{ getFallbackLabel(post) }}</span>
              </div>

              <span v-if="post.comments > 0" :class="$style.blog_commentBadge">
                {{ post.comments }} comment{{ post.comments === 1 ? '' : 's' }}
              </span>
            </div>

            <div :class="$style.blog_body">
              <h3 :class="$style.blog_title">{{ post.title }}</h3>

              <div :class="$style.blog_authorRow">
                <div :class="$style.blog_avatar">
                  <img
                    v-if="canRenderCardAvatar(post.id, getPostCardAvatarSrc(post))"
                    :src="getPostCardAvatarSrc(post)"
                    :alt="post.author"
                    :class="$style.blog_avatarImg"
                    @error="markCardAvatarBroken(post.id, getPostCardAvatarSrc(post))"
                  >
                  <svg v-else viewBox="0 0 24 24" fill="none" :class="$style.blog_avatarIcon">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>

                <div :class="$style.blog_authorMeta">
                  <p :class="$style.blog_authorName">{{ post.author_name || post.author || profileUsername }}</p>
                  <p :class="$style.blog_date">{{ formatPostDate(post.date) }}</p>
                </div>
              </div>
            </div>

            <div v-if="!isViewingExternalProfile" :class="$style.blog_menuWrap" @click.stop>
              <button :class="$style.blog_menu" aria-label="Options" @click.stop="togglePostMenu(post.id)">⋮</button>
              <div v-if="openPostMenuId === post.id" :class="$style.blog_dropdown" @click.stop>
                <button :class="$style.blog_dropdownItem" @click.stop="editPost(post.id)">Edit</button>
                <button :class="[$style.blog_dropdownItem, $style.blog_dropdownItemDanger]" @click.stop="deletePost(post.id)">Delete</button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Bookmarks Tab -->
      <div v-if="!isViewingExternalProfile && activeTab === 'bookmarks'">
        <h2 :class="$style.content__heading">Bookmarks</h2>
        <div v-if="bookmarksLoading" :class="$style.post_card">Loading your bookmarks…</div>
        <div v-else-if="bookmarksError || !bookmarks.length" :class="$style.post_card">No bookmark</div>
        <div v-else :class="[$style.bookmark_grid, $style.bookmark_grid_center]">
          <article
            v-for="bm in bookmarks"
            :key="bm.id"
            :class="[$style.blog_card, { [$style.blog_card_clickable]: !!bm.slug }]"
            @click="bm.slug && router.push(`/blog/${bm.slug}`)"
          >
            <div :class="$style.blog_thumb">
              <img
                v-if="bm.coverimage"
                :src="bm.coverimage"
                :alt="bm.title"
                :class="$style.blog_thumbImg"
              >
              <div v-else :class="$style.blog_thumbFallback">
                <span :class="$style.blog_thumbFallbackLabel">{{ getFallbackLabel(bm) }}</span>
              </div>
            </div>

            <div :class="$style.blog_body">
              <h3 :class="$style.blog_title">{{ bm.title }}</h3>

              <div :class="$style.blog_authorRow">
                <div :class="$style.blog_avatar">
                  <img
                    v-if="canRenderCardAvatar(bm.id, getBookmarkCardAvatarSrc(bm))"
                    :src="getBookmarkCardAvatarSrc(bm)"
                    :alt="bm.author"
                    :class="$style.blog_avatarImg"
                    @error="markCardAvatarBroken(bm.id, getBookmarkCardAvatarSrc(bm))"
                  >
                  <svg v-else viewBox="0 0 24 24" fill="none" :class="$style.blog_avatarIcon">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>

                <div :class="$style.blog_authorMeta">
                  <p :class="$style.blog_authorName">{{ bm.author_name || bm.author }}</p>
                  <p :class="$style.blog_date">{{ formatPostDate(bm.date) }}</p>
                </div>
              </div>
            </div>

            <div :class="$style.blog_menuWrap" @click.stop>
              <button :class="$style.blog_menu" aria-label="Options" @click.stop="toggleBookmarkMenu(bm.id)">⋮</button>
              <div v-if="openBookmarkMenuId === bm.id" :class="$style.blog_dropdown" @click.stop>
                <button
                  :class="[$style.blog_dropdownItem, $style.blog_dropdownItemDanger]"
                  :disabled="isRemovingBookmark"
                  @click.stop="removeBookmark(bm.id)"
                >
                  {{ isRemovingBookmark ? 'Removing...' : 'Remove Bookmark' }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Drafts Tab -->
      <div v-if="!isViewingExternalProfile && activeTab === 'drafts'">
        <h2 :class="$style.content__heading">Drafts</h2>
        <div v-if="!drafts.length" :class="$style.post_card">No drafts yet.</div>
        <div v-else :class="[$style.bookmark_grid, $style.bookmark_grid_center]">
          <article
            v-for="draft in drafts"
            :key="draft.id"
            :class="[$style.blog_card, $style.blog_card_clickable]"
            @click="editDraft(draft.id)"
          >
            <div :class="$style.blog_thumb">
              <img
                v-if="draft.coverimage"
                :src="draft.coverimage"
                :alt="draft.title"
                :class="$style.blog_thumbImg"
              >
              <div v-else :class="$style.blog_thumbFallback">
                <span :class="$style.blog_thumbFallbackLabel">DRAFT</span>
              </div>
            </div>

            <div :class="$style.blog_body">
              <h3 :class="$style.blog_title">{{ draft.title }}</h3>
              <div :class="$style.post_card__info">
                <span :class="$style.blog_date">Last edited {{ formatDraftDate(draft.lastEdited) }}</span>
                <span :class="[$style.badge, $style.badge_draft]">DRAFT</span>
              </div>
            </div>

            <div :class="$style.blog_menuWrap" @click.stop>
              <button :class="$style.blog_menu" aria-label="Options" @click.stop="toggleDraftMenu(draft.id)">⋮</button>
              <div v-if="openDraftMenuId === draft.id" :class="$style.blog_dropdown" @click.stop>
                <button :class="$style.blog_dropdownItem" @click.stop="editDraft(draft.id)">Edit</button>
                <button :class="[$style.blog_dropdownItem, $style.blog_dropdownItemDanger]" @click.stop="deleteDraft(draft.id)">Delete</button>
              </div>
            </div>
          </article>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useAuthService } from '~/services/authService'
import { useUserStore } from '~/stores/user'
import { useBlogService } from '~/services/blogService'
import { useCommentService } from '~/services/commentService'
import { resolveMediaUrl } from '~/utils/mediaUrl'

definePageMeta({
  middleware: (to) => {
    if (to.query.username) {
      return
    }

    const accessToken = useCookie('access_token').value
    if (!accessToken) {
      return navigateTo('/login')
    }
  },
})

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const authService = useAuthService()
const blogService = useBlogService()
const commentService = useCommentService()

const drafts = ref([])
const postsLoading = ref(false)
const postsError = ref('')
const bookmarksLoading = ref(false)
const bookmarksError = ref('')

const allPosts = ref([])
const bookmarks = ref([])
const externalProfileUser = ref(null)
const externalPublishedPosts = ref([])
const externalPostsLoading = ref(false)
const externalPostsError = ref('')
const brokenCardAvatars = ref({})

const normalizeAvatarSrc = (value) => resolveMediaUrl(value) || ''

const getCardAvatarKey = (id, src = '') => {
  if (id === null || id === undefined) return ''
  const normalizedSrc = String(src || '').trim()
  return `${String(id)}::${normalizedSrc}`
}

const resetBrokenCardAvatars = () => {
  brokenCardAvatars.value = {}
}

const markCardAvatarBroken = (id, src) => {
  const key = getCardAvatarKey(id, src)
  if (!key) return
  brokenCardAvatars.value = {
    ...brokenCardAvatars.value,
    [key]: true,
  }
}

const canRenderCardAvatar = (id, src) => {
  const normalizedSrc = String(src || '').trim()
  const key = getCardAvatarKey(id, normalizedSrc)
  if (!normalizedSrc || !key) return false
  return !brokenCardAvatars.value[key]
}

const getPostCardAvatarSrc = (post) => {
  const profileAvatar = normalizeAvatarSrc(activeProfileUser.value?.profilePhoto)
  if (profileAvatar) return profileAvatar

  const postAvatar = normalizeAvatarSrc(post?.authorphoto)
  if (postAvatar) return postAvatar

  return ''
}

const getBookmarkCardAvatarSrc = (bookmark) => {
  const bookmarkAuthor = String(bookmark?.author || '').trim().toLowerCase()
  const currentUsername = String(activeProfileUser.value?.username || '').trim().toLowerCase()

  if (bookmarkAuthor && currentUsername && bookmarkAuthor === currentUsername) {
    const profileAvatar = normalizeAvatarSrc(activeProfileUser.value?.profilePhoto)
    if (profileAvatar) return profileAvatar
  }

  const bookmarkAvatar = normalizeAvatarSrc(bookmark?.authorphoto)
  if (bookmarkAvatar) return bookmarkAvatar

  return ''
}

const viewedUsername = computed(() => String(route.query.username || '').trim())
const isViewingExternalProfile = computed(() => {
  if (!viewedUsername.value) return false
  const ownUsername = String(userStore.user?.username || '').trim().toLowerCase()
  return viewedUsername.value.toLowerCase() !== ownUsername
})

const activeProfileUser = computed(() => (
  isViewingExternalProfile.value ? externalProfileUser.value : userStore.user
))

const profileUsername = computed(() => activeProfileUser.value?.username || 'user')
const profileDisplayName = computed(() => (
  [activeProfileUser.value?.first_name, activeProfileUser.value?.last_name]
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
  || activeProfileUser.value?.username
  || 'User'
))

const formatCategory = (category) => {
  const normalized = String(category || '').trim().toLowerCase()
  if (!normalized) return 'Blog'
  if (normalized === 'beauty and fashion') return 'Beauty & Fashion'
  return normalized.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const getFallbackLabel = (post) => {
  const category = post?.category ?? post?.category_name ?? post?.categoryName
  return formatCategory(category)
}

const postsHeading = computed(() => (
  isViewingExternalProfile.value ? `${profileDisplayName.value}'s Posts` : 'My Posts'
))

const currentPostsLoading = computed(() => (
  isViewingExternalProfile.value ? externalPostsLoading.value : postsLoading.value
))

const currentPostsError = computed(() => (
  isViewingExternalProfile.value ? externalPostsError.value : postsError.value
))

const currentPostsLoadingText = computed(() => (
  isViewingExternalProfile.value ? 'Loading profile posts…' : 'Loading your posts…'
))

const mapPost = post => ({
  id: post?.id,
  title: (post?.title || '').trim() || 'Untitled',
  slug: post?.slug,
  author: post?.author,
  author_name: post?.author_name,
  category: post?.category,
  date: post?.date,
  coverimage: resolveMediaUrl(post?.coverimage),
  authorphoto: resolveMediaUrl(post?.authorphoto),
  status: post?.published === false ? 'DRAFT' : 'PUBLISHED',
  comments: typeof post?.comments === 'number' ? post.comments : 0,
})

const resetExternalProfileState = () => {
  resetBrokenCardAvatars()
  externalProfileUser.value = null
  externalPublishedPosts.value = []
  externalPostsError.value = ''
  externalPostsLoading.value = false
}

const loadExternalProfile = async () => {
  if (!viewedUsername.value) {
    resetExternalProfileState()
    return
  }

  resetBrokenCardAvatars()
  externalPostsLoading.value = true
  externalPostsError.value = ''

  try {
    const data = await authService.fetchUserProfileByUsername(viewedUsername.value, userStore.accessToken ?? undefined)
    const userData = Array.isArray(data) ? data[0] : null
    const profileData = Array.isArray(data) ? data[1] : null
    const postsData = Array.isArray(data) ? data[2] : []

    externalProfileUser.value = {
      id: userData?.id,
      username: userData?.username || viewedUsername.value,
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      bio: profileData?.bio || '',
      profilePhoto: resolveMediaUrl(profileData?.profilephoto),
      coverPhoto: resolveMediaUrl(profileData?.coverphoto),
    }

    externalPublishedPosts.value = Array.isArray(postsData)
      ? postsData
        .filter(post => post?.published !== false)
        .map(mapPost)
      : []
  } catch (error) {
    console.error('Failed to load external profile:', error)
    externalProfileUser.value = {
      username: viewedUsername.value,
      first_name: '',
      last_name: '',
      profilePhoto: null,
      coverPhoto: null,
    }
    externalPublishedPosts.value = []
    externalPostsError.value = 'Failed to load profile.'
  } finally {
    externalPostsLoading.value = false
  }
}

const syncProfileView = async () => {
  if (isViewingExternalProfile.value) {
    activeTab.value = 'posts'
    await loadExternalProfile()
    return
  }

  if (!userStore.isAuthenticated) {
    await navigateTo('/login')
    return
  }

  resetExternalProfileState()
  await loadMyPostsAndDrafts()
  await loadBookmarks()
}

const loadBookmarks = async () => {
  resetBrokenCardAvatars()
  bookmarksLoading.value = true
  bookmarksError.value = ''
  try {
    const results = await blogService.fetchBookmarkedPosts()
    bookmarks.value = (results || []).map(post => ({
      id: post.id,
      title: post.title,
      author: post.author,
      author_name: post.author_name,
      category: post.category,
      date: post.date,
      slug: post.slug,
      coverimage: resolveMediaUrl(post.coverimage),
      authorphoto: resolveMediaUrl(post.authorphoto),
    }))
  } catch (error) {
    bookmarksError.value = (error && typeof error === 'object' && 'message' in error)
      ? String(error.message)
      : 'Failed to load bookmarks.'
    bookmarks.value = []
  } finally {
    bookmarksLoading.value = false
  }
}

const loadMyPostsAndDrafts = async () => {
  resetBrokenCardAvatars()
  postsLoading.value = true
  postsError.value = ''

  try {
    if (!userStore.accessToken) {
      allPosts.value = []
      drafts.value = []
      return
    }

    const posts = await userStore.fetchMyPosts()

    allPosts.value = posts
      .filter(post => post?.published === true)
      .map(post => ({
        id: post.id,
        title: (post.title || '').trim() || 'Untitled',
        slug: post.slug,
        author: post.author,
        author_name: post.author_name,
        category: post.category,
        date: post.date,
        coverimage: resolveMediaUrl(post.coverimage),
        authorphoto: resolveMediaUrl(post.authorphoto),
        status: 'PUBLISHED',
        comments: 0,
      }))

    allPosts.value = await Promise.all(
      allPosts.value.map(async (post) => {
        try {
          const response = await commentService.fetchComments(post.id)
          return {
            ...post,
            comments: (response?.results || []).length,
          }
        } catch {
          return {
            ...post,
            comments: 0,
          }
        }
      })
    )

    drafts.value = posts
      .filter(post => post?.published === false)
      .map(post => ({
        id: post.id,
        title: (post.title || '').trim() || 'Untitled',
        slug: post.slug,
        coverimage: resolveMediaUrl(post.coverimage),
        lastEdited: post.date,
      }))
      .sort((a, b) => {
        const aTs = new Date(a.lastEdited).getTime()
        const bTs = new Date(b.lastEdited).getTime()
        const safeA = Number.isNaN(aTs) ? 0 : aTs
        const safeB = Number.isNaN(bTs) ? 0 : bTs
        return safeB - safeA
      })
  } catch (error) {
    postsError.value = (error && typeof error === 'object' && 'message' in error)
      ? String(error.message)
      : 'Failed to load your posts.'
    allPosts.value = []
    drafts.value = []
  } finally {
    postsLoading.value = false
  }
}

onMounted(async () => {
  if (userStore.isAuthenticated && !userStore.user) {
    await userStore.fetchUser()
  }
  await syncProfileView()
})

watch(() => route.query.username, async () => {
  await syncProfileView()
})

/* ─── Icon components ─────────────────────────────────────────── */
const IconDoc = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 18, height: 18 }, [
    h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '9', y1: '13', x2: '15', y2: '13' }),
    h('line', { x1: '9', y1: '17', x2: '13', y2: '17' }),
  ])
}
const IconEdit = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 16, height: 16 }, [
    h('path', { d: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' }),
  ])
}
const IconBookmark = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 16, height: 16 }, [
    h('path', { d: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' }),
  ])
}
const IconDraft = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 16, height: 16 }, [
    h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
  ])
}

/* ─── State ───────────────────────────────────────────────────── */
const activeTab = ref('posts')
const openPostMenuId = ref(null)
const openDraftMenuId = ref(null)
const openBookmarkMenuId = ref(null)
const isRemovingBookmark = ref(false)

const allTabs = [
  { id: 'posts',     label: 'Posts',     icon: IconDoc },
  { id: 'bookmarks', label: 'Bookmarks', icon: IconBookmark },
  { id: 'drafts',    label: 'Drafts',    icon: IconDraft },
]

const tabs = computed(() => (isViewingExternalProfile.value ? [] : allTabs))

const getPostTimestamp = (post) => {
  const rawDate = post?.date ?? post?.created_at ?? post?.createdAt ?? ''
  const ts = new Date(rawDate).getTime()
  return Number.isNaN(ts) ? 0 : ts
}

const publishedPosts = computed(() => {
  const basePosts = isViewingExternalProfile.value
    ? externalPublishedPosts.value
    : allPosts.value.filter(p => p.status === 'PUBLISHED')

  return [...basePosts].sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
})

function formatDraftDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  const day = String(parsed.getDate()).padStart(2, '0')
  const month = parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const year = parsed.getFullYear()
  return `${day}-${month}-${year}`
}

function formatPostDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  const day = String(parsed.getDate()).padStart(2, '0')
  const month = parsed.toLocaleString('en-US', { month: 'short' }).toLowerCase()
  const year = parsed.getFullYear()
  return `${day}-${month}-${year}`
}

function togglePostMenu(postId) {
  openPostMenuId.value = openPostMenuId.value === postId ? null : postId
}

async function editPost(postId) {
  openPostMenuId.value = null
  // Find the post to get its ID
  const post = allPosts.value.find(p => p.id === postId)
  if (post?.id) {
    navigateTo(`/create?postId=${post.id}`)
  } else {
    console.error('Post ID not found')
  }
}

async function deletePost(postId) {
  openPostMenuId.value = null

  // Confirm deletion
  if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
    return
  }

  try {
    // Call the API to delete
    await blogService.deletePost(postId, userStore.accessToken)

    // Remove from local state
    allPosts.value = allPosts.value.filter(post => post.id !== postId)

    console.log('Post deleted successfully')
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('Failed to delete post. Please try again.')
  }
}
function toggleDraftMenu(draftId) {
  openDraftMenuId.value = openDraftMenuId.value === draftId ? null : draftId
}
function editDraft(draftId) {
  openDraftMenuId.value = null
  const draft = drafts.value.find(d => d.id === draftId)
  if (draft?.id) {
    navigateTo(`/create?draftId=${draft.id}`)
    return
  }

  navigateTo('/create')
}

async function deleteDraft(draftId) {
  openDraftMenuId.value = null

  if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
    return
  }

  try {
    await blogService.deletePost(draftId, userStore.accessToken)
    drafts.value = drafts.value.filter(draft => draft.id !== draftId)
  } catch (error) {
    console.error('Failed to delete draft:', error)
    alert('Failed to delete draft. Please try again.')
  }

  openDraftMenuId.value = null
}

function toggleBookmarkMenu(bookmarkId) {
  openBookmarkMenuId.value = openBookmarkMenuId.value === bookmarkId ? null : bookmarkId
}

async function removeBookmark(bookmarkId) {
  openBookmarkMenuId.value = null
  isRemovingBookmark.value = true

  try {
    // Call toggle bookmark to remove it
    await blogService.toggleBookmark(bookmarkId)

    // Remove from local state
    bookmarks.value = bookmarks.value.filter(bm => bm.id !== bookmarkId)

    console.log('Bookmark removed successfully')
  } catch (error) {
    console.error('Failed to remove bookmark:', error)
    alert('Failed to remove bookmark. Please try again.')
  } finally {
    isRemovingBookmark.value = false
  }
}
</script>

<style module>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

:global(:root) {
  --dash-page-bg: #dfdfe3;
  --dash-surface: #ffffff;
  --dash-surface-alt: #fafafa;
  --dash-surface-soft: #f1f5f9;
  --dash-border: rgba(24, 24, 27, 0.1);
  --dash-border-strong: rgba(24, 24, 27, 0.16);
  --dash-text: #18181b;
  --dash-text-muted: #71717a;
  --dash-text-soft: #52525b;
  --dash-text-inverse: #fafafa;
  --dash-accent: #18181b;
  --dash-accent-soft: rgba(24, 24, 27, 0.08);
  --dash-hover-bg: rgba(24, 24, 27, 0.06);
  --dash-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  --dash-shadow-hover: 0 14px 34px rgba(15, 23, 42, 0.12);
  --dash-danger: #b91c1c;
  --dash-danger-soft: #fef2f2;
}

:global(html.dark) {
  --dash-page-bg: #000000;
  --dash-surface: #19191d;
  --dash-surface-alt: #111114;
  --dash-surface-soft: #18181b;
  --dash-border: rgba(255, 255, 255, 0.08);
  --dash-border-strong: rgba(255, 255, 255, 0.14);
  --dash-text: #fafafa;
  --dash-text-muted: #a1a1aa;
  --dash-text-soft: #d4d4d8;
  --dash-text-inverse: #09090b;
  --dash-accent: #f4f4f5;
  --dash-accent-soft: rgba(255, 255, 255, 0.08);
  --dash-hover-bg: rgba(255, 255, 255, 0.08);
  --dash-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  --dash-shadow-hover: 0 20px 48px rgba(0, 0, 0, 0.58);
  --dash-danger: #f87171;
  --dash-danger-soft: rgba(248, 113, 113, 0.14);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard {
  font-family: 'Sora', sans-serif;
  background: var(--dash-page-bg);
  min-height: 100vh;
  padding-top: 64px;
  color: var(--dash-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ── Profile Hero ── */
.profileHero { position: relative; margin-bottom: 32px; }

.coverImg {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--dash-surface-soft);
}
.coverImg__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.coverImg__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--dash-surface-soft) 0%, var(--dash-border) 100%);
}

.avatarWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -48px;
  padding-bottom: 8px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--dash-surface);
  border: 4px solid var(--dash-page-bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--dash-shadow);
}
.avatarImage { width: 100%; height: 100%; object-fit: cover; }
.avatar svg { width: 40px; height: 40px; color: var(--dash-text-muted); }

.profileName {
  margin-top: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--dash-text);
}
.profileHandle {
  font-size: 0.8rem;
  color: var(--dash-text-muted);
  font-family: 'DM Mono', monospace;
  margin-top: 4px;
}
.profileBio {
  margin-top: 10px;
  max-width: 28rem;
  text-align: center;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--dash-text);
  opacity: 0.82;
  white-space: pre-wrap;
}

/* ── Edit Profile Button ── */
.editProfileBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 7px 18px;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--dash-text);
  background: var(--dash-surface);
  border: 1.5px solid var(--dash-border-strong);
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.editProfileBtn:hover {
  background: var(--dash-hover-bg);
  border-color: var(--dash-accent);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1.5px solid var(--dash-border-strong);
  margin-bottom: 28px;
  padding: 0 40px;
}
.tabs__item {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -1.5px;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--dash-text-muted);
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}
.tabs__item:hover { color: var(--dash-text); }
.tabs__item_active { color: var(--dash-text); border-bottom-color: var(--dash-accent); }
.tabs__icon { width: 15px; height: 15px; }
.tabs__item_link { text-decoration: none; }

/* ── Content ── */
.content { padding: 0 40px 40px; }
.content__heading {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

/* ── Post cards ── */
.post_list { display: flex; flex-direction: column; gap: 12px; }
.blog_grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.bookmark_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 220px));
  gap: 14px;
  justify-content: start;
}
.bookmark_grid_center {
  justify-content: center;
}
.blog_card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 14px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.3s ease;
}
.blog_card_clickable { cursor: pointer; }
.blog_card:hover {
  transform: translateY(-2px);
  box-shadow: var(--dash-shadow-hover);
  border-color: var(--dash-border-strong);
}
.blog_thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--dash-surface-soft);
}
.blog_thumbImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}
.blog_card:hover .blog_thumbImg { transform: scale(1.03); }
.blog_thumbFallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--dash-surface-soft), var(--dash-border));
}
.blog_thumbFallbackLabel {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  color: var(--dash-text-muted);
  text-transform: uppercase;
  line-height: 1.2;
  padding: 0 1rem;
  text-align: center;
  word-break: break-word;
}
.blog_commentBadge {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--dash-text);
  background: color-mix(in srgb, var(--dash-surface) 72%, transparent);
  border: 1px solid var(--dash-border);
  backdrop-filter: blur(10px);
}
.blog_body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 14px 16px;
  min-height: 140px;
}
.blog_title {
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--dash-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog_authorRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}
.blog_avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dash-surface-soft);
  border: 1px solid var(--dash-border);
}
.blog_avatarImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.blog_avatarIcon {
  width: 15px;
  height: 15px;
  color: var(--dash-text-muted);
}
.blog_authorMeta {
  min-width: 0;
}
.blog_authorName {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dash-text-muted);
}
.blog_date {
  margin-top: 2px;
  font-size: 0.7rem;
  color: var(--dash-text-soft);
}
.blog_menuWrap {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}
.blog_menu {
  width: 30px;
  height: 30px;
  border: 1px solid var(--dash-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--dash-surface) 82%, transparent);
  color: var(--dash-text-muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  backdrop-filter: blur(10px);
}
.blog_menu:hover {
  background: var(--dash-hover-bg);
  color: var(--dash-text);
}
.blog_dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 128px;
  padding: 5px;
  border-radius: 10px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-border-strong);
  box-shadow: var(--dash-shadow-hover);
}
.blog_dropdownItem {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 9px;
  border-radius: 7px;
  font-size: 0.8rem;
  color: var(--dash-text);
  cursor: pointer;
}
.blog_dropdownItem:hover { background: var(--dash-hover-bg); }
.blog_dropdownItemDanger { color: var(--dash-danger); }
.blog_dropdownItemDanger:hover { background: var(--dash-danger-soft); }
.post_card {
  background: var(--dash-surface);
  border-radius: 14px;
  padding: 20px 24px;
  border: 1px solid var(--dash-border);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
}
.post_card:hover { box-shadow: var(--dash-shadow); transform: translateY(-1px); }
.post_card__main { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.post_card__menu_wrap { position: relative; }
.post_card__meta { flex: 1; }
.post_card__title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 8px;
  color: var(--dash-text);
}
.post_card__info { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.post_card__date { font-size: 0.78rem; color: var(--dash-text-muted); }
.post_card__stats { display: flex; gap: 16px; }
.stat_pill { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: var(--dash-text-soft); }
.stat_pill svg { color: var(--dash-text-muted); }
.post_card__menu {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--dash-text-muted);
  padding: 0 4px;
  line-height: 1;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.post_card__menu:hover { background: var(--dash-hover-bg); color: var(--dash-text); }
.post_card__dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 120px;
  background: var(--dash-surface-alt);
  border: 1px solid var(--dash-border-strong);
  border-radius: 8px;
  box-shadow: var(--dash-shadow-hover);
  padding: 6px;
  z-index: 20;
}
.post_card__dropdown_item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.82rem;
  color: var(--dash-text);
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.post_card__dropdown_item:hover { background: var(--dash-hover-bg); }
.post_card__dropdown_item_danger { color: var(--dash-danger); }
.post_card__dropdown_item_danger:hover { background: var(--dash-danger-soft); }

/* ── Badge ── */
.badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 20px;
}
.badge_published { background: var(--dash-accent); color: var(--dash-text-inverse); }
.badge_draft { background: var(--dash-surface-soft); color: var(--dash-text-soft); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .coverImg { height: 160px; }
  .tabs {
    padding: 0 16px;
    overflow: visible;
    white-space: normal;
  }
  .tabs__item {
    flex: 1 1 0;
    min-width: 0;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    font-size: 0.75rem;
  }
  .tabs__icon {
    width: 14px;
    height: 14px;
  }
  .content { padding: 0 16px 24px; }
}
</style>