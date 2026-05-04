<script setup>
import { useRoute, useRouter } from '#imports'
import { ref, watch, onMounted, computed } from 'vue'
import { useSearchService } from '~/services/searchService'
import { useAuthService } from '~/services/authService'
import { resolveMediaUrl } from '~/utils/mediaUrl'

const route = useRoute()
const router = useRouter()
const searchService = useSearchService()
const authService = useAuthService()

const results = ref({ users: [], posts: [] })
const loading = ref(false)
const brokenUserAvatars = ref({})
const brokenPostAvatars = ref({})
const userPhotoCache = ref({})
const userPhotoRetryAfter = ref({})

const inFlightUserPhotoRequests = new Set()
const USER_PHOTO_RETRY_MS = 60 * 1000

const normalizeUsername = (value) => String(value || '').trim().replace(/^@+/, '').toLowerCase()

const getCachedUserPhoto = (username) => {
  const key = normalizeUsername(username)
  return key ? userPhotoCache.value[key] || '' : ''
}

const setCachedUserPhoto = (username, photoUrl) => {
  const key = normalizeUsername(username)
  if (!key || !photoUrl) return

  userPhotoCache.value = {
    ...userPhotoCache.value,
    [key]: photoUrl,
  }
}

const getApiStatusCode = (error) => {
  const status = Number(error?.statusCode ?? error?.status)
  return Number.isFinite(status) ? status : null
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const capitalizeCategory = (category = '') => {
  if (!category) return ''
  if (category.toLowerCase() === 'beauty and fashion') return 'Beauty & Fashion'
  return category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const categoryGradient = {
  'zirna': 'from-zinc-500 to-zinc-700',
  'gospel': 'from-slate-500 to-slate-700',
  'hriselna': 'from-zinc-600 to-zinc-800',
  'thiamna': 'from-stone-500 to-stone-700',
  'beauty and fashion': 'from-zinc-400 to-zinc-600',
  'story': 'from-neutral-500 to-neutral-700',
  'politics': 'from-zinc-600 to-zinc-900',
  'infiamna': 'from-slate-400 to-slate-700',
  'others': 'from-zinc-500 to-zinc-800',
}

const getGradient = (category) => {
  const key = (category || 'others').toLowerCase()
  return categoryGradient[key] || 'from-zinc-500 to-zinc-700'
}

const getUserAvatarUrl = (user) => {
  const cached = getCachedUserPhoto(user?.username)
  if (cached) return cached

  const rawPath =
    user?.profilephoto ||
    user?.profilePhoto ||
    user?.profile_photo ||
    user?.avatar ||
    user?.avatar_url ||
    user?.photo ||
    user?.user?.profilephoto ||
    user?.user?.profilePhoto ||
    ''
  const normalized = String(rawPath).trim()

  if (!normalized) return ''

  const lowered = normalized.toLowerCase()
  if (lowered === 'null' || lowered === 'none' || lowered === 'undefined') return ''

  return resolveMediaUrl(normalized) || ''
}

const markUserAvatarBroken = (userId) => {
  brokenUserAvatars.value = { ...brokenUserAvatars.value, [userId]: true }
}

const getPostAuthorAvatarUrl = (post) => {
  const cached = getCachedUserPhoto(post?.author)
  if (cached) return cached

  return resolveMediaUrl(post?.authorphoto || '') || ''
}

const getPostAvatarKey = (post) => {
  const src = getPostAuthorAvatarUrl(post)
  return `${String(post?.id || '')}::${src}`
}

const canRenderPostAvatar = (post) => {
  const src = getPostAuthorAvatarUrl(post)
  if (!src) return false
  return !brokenPostAvatars.value[getPostAvatarKey(post)]
}

const markPostAvatarBroken = (post) => {
  const src = getPostAuthorAvatarUrl(post)
  if (!src) return

  brokenPostAvatars.value = {
    ...brokenPostAvatars.value,
    [getPostAvatarKey(post)]: true,
  }
}

const openUserProfile = (user) => {
  const username = String(user?.username || '').trim()
  if (!username) return

  router.push({
    path: '/user-profile',
    query: { username },
  })
}

const getUserDisplayName = (user) => {
  const firstName = String(user?.firstname ?? user?.first_name ?? '').trim()
  const lastName = String(user?.lastname ?? user?.last_name ?? '').trim()
  const fullName = `${firstName} ${lastName}`.trim()

  if (fullName) return fullName
  const username = String(user?.username || '').trim()
  return username ? `@${username}` : 'Unknown user'
}

const getPostTimestamp = (post) => {
  const rawDate = post?.date ?? post?.created_at ?? post?.createdAt ?? ''
  const timestamp = new Date(rawDate).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortedSearchPosts = computed(() => {
  const posts = Array.isArray(results.value?.posts) ? results.value.posts : []
  return [...posts].sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
})

const collectSearchUsernames = (users = [], posts = []) => {
  const fromUsers = users.map((user) => String(user?.username || '').trim())
  const fromPosts = posts.map((post) => String(post?.author || '').trim())

  return Array.from(new Set([...fromUsers, ...fromPosts].filter(Boolean)))
}

const loadLatestProfilePhotos = async (usernames = []) => {
  if (!usernames.length) return

  await Promise.allSettled(
    usernames.map(async (username) => {
      const normalized = normalizeUsername(username)
      if (!normalized || userPhotoCache.value[normalized]) return
      if (inFlightUserPhotoRequests.has(normalized)) return

      const retryAfter = Number(userPhotoRetryAfter.value[normalized] || 0)
      if (retryAfter && Date.now() < retryAfter) return

      inFlightUserPhotoRequests.add(normalized)

      try {
        const response = await authService.fetchProfilePhotoByUsername(username)
        const resolved = resolveMediaUrl(response?.profilephoto || '') || ''

        if (resolved) {
          setCachedUserPhoto(username, resolved)
        }

        if (userPhotoRetryAfter.value[normalized]) {
          userPhotoRetryAfter.value = Object.fromEntries(
            Object.entries(userPhotoRetryAfter.value).filter(([key]) => key !== normalized),
          )
        }
      } catch (error) {
        const statusCode = getApiStatusCode(error)

        if (statusCode === 429 || statusCode === 404 || statusCode === 403) {
          userPhotoRetryAfter.value = {
            ...userPhotoRetryAfter.value,
            [normalized]: Date.now() + USER_PHOTO_RETRY_MS,
          }
        }
      } finally {
        inFlightUserPhotoRequests.delete(normalized)
      }
    }),
  )
}

const fetchResults = async () => {
  const query = String(route.params.query || '').trim()
  if (!query) {
    results.value = { users: [], posts: [] }
    brokenUserAvatars.value = {}
    brokenPostAvatars.value = {}
    return
  }

  loading.value = true
  brokenUserAvatars.value = {}
  brokenPostAvatars.value = {}

  try {
    const nextResults = await searchService.search(query)
    results.value = nextResults

    const usernames = collectSearchUsernames(nextResults?.users || [], nextResults?.posts || [])
    await loadLatestProfilePhotos(usernames)
  } catch (err) {
    console.error('Search error:', err)
    results.value = { users: [], posts: [] }
  } finally {
    loading.value = false
  }
}

onMounted(fetchResults)
watch(() => route.params.query, fetchResults)
</script>

<template>
  <div class="pt-28 px-6 max-w-6xl mx-auto text-zinc-900 dark:text-white">

    <!-- TITLE -->
    <h1 class="text-3xl font-bold mb-8">
      Search: <span class="text-zinc-600 dark:text-zinc-400">{{ route.params.query }}</span>
    </h1>

    <!-- LOADING -->
    <div v-if="loading" class="text-zinc-600 dark:text-zinc-400">Loading...</div>

    <!-- NO RESULTS -->
    <div v-else-if="!results.users.length && !results.posts.length" class="text-zinc-600 dark:text-zinc-500">
      No results found
    </div>

    <!-- USERS -->
    <div v-if="results.users.length" class="mb-10">
      <h2 class="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Users</h2>

      <div class="flex gap-4 overflow-x-auto pb-2">
        <div
          v-for="user in results.users"
          :key="user.id"
          class="flex items-center gap-2 cursor-pointer bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-200 transition dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
          role="button"
          tabindex="0"
          @click="openUserProfile(user)"
          @keydown.enter.prevent="openUserProfile(user)"
        >
          <img
            v-if="getUserAvatarUrl(user) && !brokenUserAvatars[user.id]"
            :src="getUserAvatarUrl(user)"
            :alt="user.username"
            class="w-8 h-8 rounded-full object-cover"
            @error="markUserAvatarBroken(user.id)"
          >
          <div
            v-else
            class="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200 text-xs font-bold flex-shrink-0"
          >
            {{ (user.username || '?').slice(0, 1).toUpperCase() }}
          </div>
          <div class="flex flex-col leading-tight">
            <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ getUserDisplayName(user) }}</span>
            <span v-if="user.firstname || user.lastname || user.first_name || user.last_name" class="text-xs text-zinc-500 dark:text-zinc-400">@{{ user.username }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- POSTS -->
    <div v-if="sortedSearchPosts.length">
      <h2 class="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Posts</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <article
          v-for="post in sortedSearchPosts"
          :key="post.id"
          class="group cursor-pointer rounded-2xl overflow-hidden border border-zinc-200 bg-white hover:border-zinc-300 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"
          @click="post.slug && router.push(`/blog/${post.slug}`)"
        >
          <div class="relative w-full aspect-[4/3] overflow-hidden bg-zinc-900/40">
            <img
              v-if="post.coverimage || post.image"
              :src="resolveMediaUrl(post.coverimage || post.image) || ''"
              :alt="post.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            >
            <div
              v-else
              :class="['absolute inset-0 bg-gradient-to-br', getGradient(post.category)]"
            />

            <span
              v-if="post.category"
              class="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-md border border-white/15 bg-black/45 text-xs font-bold uppercase tracking-widest text-white"
            >
              {{ capitalizeCategory(post.category) }}
            </span>
          </div>

          <div class="p-4 sm:p-5">
            <h3 class="font-bold text-lg sm:text-xl leading-snug tracking-tight mb-4 text-zinc-900 dark:text-white">
              {{ post.title }}
            </h3>

            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-200 dark:bg-zinc-900/80 dark:border-white/15">
                <img
                  v-if="canRenderPostAvatar(post)"
                  :src="getPostAuthorAvatarUrl(post)"
                  :alt="post.author"
                  class="w-full h-full object-cover"
                  @error="markPostAvatarBroken(post)"
                >
                <svg v-else class="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v1h20v-1c0-3.324-6.663-5-10-5z"/>
                </svg>
              </div>

              <div>
                <p class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">@{{ post.author }}</p>
                <p class="text-sm text-zinc-500 dark:text-zinc-500">{{ formatDate(post.date) }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

  </div>
</template>