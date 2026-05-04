<template>
  <section class="dashboard">
    <div class="metricsGrid">
      <article class="metricCard">
        <p class="metricLabel">Total Likes</p>
        <p class="metricValue">{{ totalLikes }}</p>
      </article>

      <article class="metricCard">
        <p class="metricLabel">Total Comments</p>
        <p class="metricValue">{{ totalComments }}</p>
      </article>

      <article class="metricCard">
        <p class="metricLabel">Most Liked Post</p>
        <p class="metricValue metricTitle">{{ mostLikedPost.title }}</p>
        <p class="metricSub">{{ mostLikedPost.likes }} likes</p>
      </article>

      <article class="metricCard">
        <p class="metricLabel">Most Commented Post</p>
        <p class="metricValue metricTitle">{{ mostCommentedPost.title }}</p>
        <p class="metricSub">{{ mostCommentedPost.commentCount }} comments</p>
      </article>
    </div>

    <div class="contentGrid">
      <section class="panel">
        <h2 class="panelTitle">Likes per Post</h2>
        <div class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th>Post</th>
                <th class="tableNum">Likes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in postsSortedByLikes" :key="`likes-${post.id}`">
                <td>{{ post.title }}</td>
                <td class="tableNum">{{ post.likes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <h2 class="panelTitle">Comments per Post</h2>
        <div class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th>Post</th>
                <th class="tableNum">Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in postsSortedByComments" :key="`comments-${post.id}`">
                <td>{{ post.title }}</td>
                <td class="tableNum">{{ post.comments.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <section class="panel">
      <h2 class="panelTitle">Recent Comments</h2>
      <ul class="commentFeed">
        <li v-for="comment in recentComments" :key="comment.id" class="commentItem">
          <span class="avatar">{{ comment.initials }}</span>
          <div class="commentBody">
            <p class="commentMeta">
              <strong>{{ comment.author }}</strong>
              <span>on</span>
              <em>{{ comment.postTitle }}</em>
              <time>{{ formatDate(comment.createdAt) }}</time>
            </p>
            <p class="commentText">{{ comment.text }}</p>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBlogService } from '~/services/blogService'
import { useCommentService } from '~/services/commentService'
import { useUserStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth',
})

type DashboardComment = {
  author: string
  text: string
  createdAt: string
}

type DashboardPost = {
  id: number
  authorId: number
  title: string
  likes: number
  comments: DashboardComment[]
}

const userStore = useUserStore()
const blogService = useBlogService()
const commentService = useCommentService()
const isLoadingDashboard = ref(false)

const posts = ref<DashboardPost[]>([])

const loadDashboardData = async () => {
  isLoadingDashboard.value = true

  try {
    if (userStore.isAuthenticated && (!userStore.user || typeof userStore.user.id !== 'number')) {
      await userStore.fetchUser()
    }

    const username = userStore.user?.username?.trim()
    const userId = typeof userStore.user?.id === 'number' ? userStore.user.id : null

    if (!username || userId === null) {
      posts.value = []
      return
    }

    const myPosts: Array<{ id: number; title: string; likes?: number }> = []
    let page = 1

    while (true) {
      const response = await blogService.fetchPosts(page)
      const results = response?.results || []

      if (!results.length) {
        break
      }

      const mine = results.filter((post) => post.author === username)
      myPosts.push(
        ...mine.map((post) => ({
          id: post.id,
          title: post.title,
          likes: 0,
        }))
      )

      if (!response.next) {
        break
      }

      page += 1
    }

    const postsWithComments = await Promise.all(
      myPosts.map(async (post) => {
        try {
          const [commentResponse, likeResponse] = await Promise.all([
            commentService.fetchComments(post.id),
            blogService.fetchLikes(post.id),
          ])
          return {
            id: post.id,
            authorId: userId,
            title: post.title,
            likes: likeResponse.likecount,
            comments: (commentResponse.results || []).map((comment) => ({
              author: comment.author,
              text: comment.content,
              createdAt: comment.date,
            })),
          } satisfies DashboardPost
        } catch {
          return {
            id: post.id,
            authorId: userId,
            title: post.title,
            likes: 0,
            comments: [],
          } satisfies DashboardPost
        }
      })
    )

    posts.value = postsWithComments
  } finally {
    isLoadingDashboard.value = false
  }
}

onMounted(async () => {
  await loadDashboardData()
})

const currentUserId = computed<number | null>(() =>
  typeof userStore.user?.id === 'number' ? userStore.user.id : null
)

// Keep scoping strict to the logged-in author.
const authorPosts = computed(() =>
  currentUserId.value === null
    ? []
    : posts.value.filter((post) => post.authorId === currentUserId.value)
)

const totalLikes = computed(() =>
  authorPosts.value.reduce((sum, post) => sum + post.likes, 0)
)

const totalComments = computed(() =>
  authorPosts.value.reduce((sum, post) => sum + post.comments.length, 0)
)

const mostLikedPost = computed(() => {
  if (!authorPosts.value.length) {
    return { title: 'No posts yet', likes: 0 }
  }

  return authorPosts.value.reduce((max, post) =>
    post.likes > max.likes ? post : max
  )
})

const mostCommentedPost = computed(() => {
  if (!authorPosts.value.length) {
    return { title: 'No posts yet', commentCount: 0 }
  }

  const top = authorPosts.value.reduce((max, post) =>
    post.comments.length > max.comments.length ? post : max
  )

  return {
    title: top.title,
    commentCount: top.comments.length,
  }
})

const postsSortedByLikes = computed(() =>
  [...authorPosts.value].sort((a, b) => b.likes - a.likes)
)

const postsSortedByComments = computed(() =>
  [...authorPosts.value].sort((a, b) => b.comments.length - a.comments.length)
)

const recentComments = computed(() => {
  const flattened = authorPosts.value.flatMap((post) =>
    post.comments.map((comment, index) => ({
      id: `${post.id}-${index}-${comment.createdAt}`,
      postTitle: post.title,
      author: comment.author,
      text: comment.text,
      createdAt: comment.createdAt,
      initials: toInitials(comment.author),
    }))
  )

  return flattened
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

const toInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U'

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime())
    ? isoDate
    : date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

/**
 * Backend-capability note:
 * Likes are fetched from `/api/v1/posts/likeinfo/<postId>` for each logged-in user's post.
 * Comments are fetched from `/api/v1/posts/commentlist/<postId>` for each logged-in user's post.
 * Both are fetched in parallel for performance.
 */
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:global(:root) {
  --dash-page-bg: transparent;
  --dash-surface: #ffffff;
  --dash-surface-alt: #fafafa;
  --dash-surface-soft: #f1f5f9;
  --dash-border: rgba(24, 24, 27, 0.4);
  --dash-border-strong: rgba(24, 24, 27, 0.4);
  --dash-stroke: rgba(24, 24, 27, 0.4);
  --dash-text: #18181b;
  --dash-text-muted: #71717a;
  --dash-text-soft: #52525b;
  --dash-text-inverse: #fafafa;
  --dash-accent: #18181b;
  --dash-accent-soft: rgba(24, 24, 27, 0.08);
  --dash-hover-bg: rgba(24, 24, 27, 0.06);
  --dash-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  --dash-shadow-hover: 0 14px 34px rgba(15, 23, 42, 0.12);
}

:global(html.dark) {
  --dash-page-bg: transparent;
  --dash-surface: #19191d;
  --dash-surface-alt: #111114;
  --dash-surface-soft: #18181b;
  --dash-border: rgba(255, 255, 255, 0.4);
  --dash-border-strong: rgba(255, 255, 255, 0.4);
  --dash-stroke: rgba(255, 255, 255, 0.4);
  --dash-text: #fafafa;
  --dash-text-muted: #a1a1aa;
  --dash-text-soft: #d4d4d8;
  --dash-text-inverse: #09090b;
  --dash-accent: #f4f4f5;
  --dash-accent-soft: rgba(255, 255, 255, 0.08);
  --dash-hover-bg: rgba(255, 255, 255, 0.08);
  --dash-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  --dash-shadow-hover: 0 20px 48px rgba(0, 0, 0, 0.58);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard {
  font-family: 'Sora', sans-serif;
  width: 90%;
  max-width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
  background: transparent;
  padding: calc(76px + env(safe-area-inset-top, 0px)) 24px 24px;
  display: grid;
  gap: 20px;
  color: var(--dash-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.metricsGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metricCard {
  border: none;
  border-radius: 10px;
  padding: 14px;
  background: var(--dash-surface);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.28);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.metricCard:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 20px 34px rgba(15, 23, 42, 0.36);
}

.metricLabel {
  margin: 0;
  font-size: 12px;
  color: var(--dash-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: 'DM Mono', monospace;
}

.metricValue {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--dash-text);
}

.metricTitle {
  font-size: 16px;
  font-weight: 600;
}

.metricSub {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--dash-text-muted);
}

.contentGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.panel {
  border: none;
  border-radius: 10px;
  background: var(--dash-surface);
  padding: 14px;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.28);
}

.panelTitle {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--dash-text);
}

.tableWrap {
  overflow-x: auto;
  border: none;
  border-radius: 8px;
  background: var(--dash-surface-alt);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.2), 0 10px 22px rgba(15, 23, 42, 0.24);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--dash-stroke) 35%, transparent);
  text-align: left;
  font-size: 14px;
  color: var(--dash-text-soft);
}

.table th {
  color: var(--dash-text-muted);
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: 'DM Mono', monospace;
}

.table tbody tr:hover {
  background: transparent;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.tableNum {
  text-align: right !important;
}

.commentFeed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.commentItem {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: var(--dash-surface-alt);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.26);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.commentItem:hover {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.34);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--dash-accent);
  color: var(--dash-text-inverse);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.commentBody {
  min-width: 0;
}

.commentMeta {
  margin: 0;
  font-size: 13px;
  color: var(--dash-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.commentMeta strong,
.commentMeta em {
  font-style: normal;
  color: var(--dash-text);
}

.commentMeta time {
  color: var(--dash-text-muted);
}

.commentText {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--dash-text-soft);
  word-break: break-word;
}

@media (max-width: 1024px) {
  .metricsGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .contentGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: calc(68px + env(safe-area-inset-top, 0px)) 14px 14px;
  }

  .metricsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
