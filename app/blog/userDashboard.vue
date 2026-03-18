<template>
  <div :class="$style.dashboard">
    <!-- Header -->
    <header :class="$style.header">
      <h1 :class="[$style.pageTitle, 'font-black tracking-tighter leading-[1] uppercase text-3xl sm:text-4xl md:text-5xl lg:text-4xl mb-6']">Blog Dashboard</h1>
      <div :class="$style.header__user">
        <NuxtLink to="/user-profile" :class="$style.header__identityLink">
          <div :class="$style.avatar">
            <img v-if="userStore.user?.profilePhoto" :src="userStore.user.profilePhoto" alt="Profile photo" :class="$style.avatarImage">
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div :class="$style.header__user_info">
            <span :class="$style.header__user_name">{{ userStore.user?.first_name || userStore.user?.username || 'User' }}</span>
            <span :class="$style.header__user_handle">@{{ userStore.user?.username || 'user' }}</span>
          </div>
        </NuxtLink>
        <button :class="$style.logoutBtn" @click="userStore.logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <section :class="$style.stats">
      <div v-for="stat in stats" :key="stat.label" :class="$style.stat_card">
        <div :class="$style.stat_card__icon">
          <component :is="stat.icon" />
        </div>
        <span :class="$style.stat_card__label">{{ stat.label }}</span>
        <div :class="$style.stat_card__value">{{ stat.value }}</div>
        <div :class="$style.stat_card__sub">{{ stat.sub }}</div>
      </div>
    </section>

    <!-- Tabs -->
    <nav :class="$style.tabs">
      <NuxtLink to="/create" :class="[$style.tabs__item, $style.tabs__item_link]">
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
    </nav>

    <!-- Tab Content -->
    <main :class="$style.content">

      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'">
        <h2 :class="$style.content__heading">My Posts</h2>
        <div :class="$style.post_list">
          <div v-for="post in publishedPosts" :key="post.id" :class="$style.post_card">
            <div :class="$style.post_card__main">
              <div :class="$style.post_card__meta">
                <h3 :class="$style.post_card__title">{{ post.title }}</h3>
                <div :class="$style.post_card__info">
                  <span :class="$style.post_card__date">{{ post.date }}</span>
                  <span :class="[$style.badge, $style['badge_' + post.status.toLowerCase()]]">{{ post.status }}</span>
                </div>
                <div :class="$style.post_card__stats">
                  <span :class="$style.stat_pill">
                    <IconEye /> {{ formatNum(post.views) }}
                  </span>
                  <span :class="$style.stat_pill">
                    <IconComment /> {{ post.comments }}
                  </span>
                  <span :class="$style.stat_pill">
                    <IconHeart /> {{ post.likes }}
                  </span>
                </div>
              </div>
              <div :class="$style.post_card__menu_wrap">
                <button :class="$style.post_card__menu" aria-label="Options" @click="togglePostMenu(post.id)">⋮</button>
                <div v-if="openPostMenuId === post.id" :class="$style.post_card__dropdown">
                  <button :class="$style.post_card__dropdown_item" @click="editPost(post.id)">Edit</button>
                  <button :class="[$style.post_card__dropdown_item, $style.post_card__dropdown_item_danger]" @click="deletePost(post.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bookmarks Tab -->
      <div v-if="activeTab === 'bookmarks'">
        <h2 :class="$style.content__heading">Bookmarks</h2>
        <div :class="$style.post_list">
          <div v-for="bm in bookmarks" :key="bm.id" :class="$style.post_card">
            <div :class="$style.post_card__main">
              <div :class="$style.post_card__meta">
                <h3 :class="$style.post_card__title">{{ bm.title }}</h3>
                <div :class="$style.post_card__info">
                  <span :class="$style.post_card__date">by {{ bm.author }}</span>
                  <span :class="$style.post_card__date">{{ bm.date }}</span>
                </div>
              </div>
              <button :class="$style.post_card__menu" aria-label="Remove bookmark">⋮</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Drafts Tab -->
      <div v-if="activeTab === 'drafts'">
        <h2 :class="$style.content__heading">Drafts</h2>
        <div :class="$style.post_list">
          <div v-for="draft in drafts" :key="draft.id" :class="$style.post_card">
            <div :class="$style.post_card__main">
              <div :class="$style.post_card__meta">
                <h3 :class="$style.post_card__title">{{ draft.title }}</h3>
                <div :class="$style.post_card__info">
                  <span :class="$style.post_card__date">Last edited {{ draft.lastEdited }}</span>
                  <span :class="[$style.badge, $style.badge_draft]">DRAFT</span>
                </div>
                <div :class="$style.draft_progress">
                  <div :class="$style.draft_progress__bar" :style="{ width: draft.progress + '%' }" />
                </div>
                <span :class="$style.draft_progress__label">{{ draft.progress }}% complete</span>
              </div>
              <div :class="$style.post_card__menu_wrap">
                <button :class="$style.post_card__menu" aria-label="Options" @click="toggleDraftMenu(draft.id)">⋮</button>
                <div v-if="openDraftMenuId === draft.id" :class="$style.post_card__dropdown">
                  <button :class="$style.post_card__dropdown_item" @click="editDraft(draft.id)">Edit</button>
                  <button :class="[$style.post_card__dropdown_item, $style.post_card__dropdown_item_danger]" @click="deleteDraft(draft.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>

import { useBlogApi } from '~/composables/useBlogApi'

const userStore = useUserStore()
const blogApi = useBlogApi()

const drafts = ref([])
const loadingDrafts = ref(false)

onMounted(async () => {
  if (userStore.isAuthenticated && !userStore.user) {
    await userStore.fetchUser()
  }
  // Fetch user drafts from backend
  loadingDrafts.value = true
  try {
    const fetchedDrafts = await blogApi.fetchUserDrafts()
    drafts.value = fetchedDrafts.map(draft => ({
      id: draft.id,
      title: draft.title || 'Untitled',
      lastEdited: draft.created_at ? new Date(draft.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }) : 'Unknown',
      progress: draft.content ? Math.min(Math.round((draft.content.length / 1000) * 100), 100) : 0,
    }))
  } catch {
    drafts.value = []
  } finally {
    loadingDrafts.value = false
  }
})

/* ─── Icon components ────────────────────────────────────────── */
const IconDoc = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 18, height: 18 }, [
    h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '9', y1: '13', x2: '15', y2: '13' }),
    h('line', { x1: '9', y1: '17', x2: '13', y2: '17' }),
  ])
}
const IconEye = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 15, height: 15 }, [
    h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    h('circle', { cx: '12', cy: '12', r: '3' }),
  ])
}
const IconComment = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 15, height: 15 }, [
    h('path', { d: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' }),
  ])
}
const IconHeart = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', width: 15, height: 15 }, [
    h('path', { d: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' }),
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

const tabs = [
  { id: 'posts',     label: 'Posts',     icon: IconDoc },
  { id: 'bookmarks', label: 'Bookmarks', icon: IconBookmark },
  { id: 'drafts',    label: 'Drafts',    icon: IconDraft },
]

const stats = [
  { label: 'TOTAL POSTS', value: '24',   sub: '+3 this month',    icon: IconDoc },
  { label: 'TOTAL VIEWS', value: '12.4K', sub: '+18.2% increase', icon: IconEye },
  { label: 'COMMENTS',    value: '342',  sub: '+24 today',        icon: IconComment },
]

const allPosts = ref([
  { id: 1, title: 'Getting Started with React Hooks',      date: 'Mar 8, 2026',  status: 'PUBLISHED', views: 2453, comments: 34, likes: 189 },
  { id: 2, title: 'Understanding TypeScript Generics',     date: 'Feb 22, 2026', status: 'PUBLISHED', views: 1872, comments: 21, likes: 143 },
  { id: 3, title: 'Building REST APIs with Node.js',       date: 'Jan 30, 2026', status: 'PUBLISHED', views: 3105, comments: 47, likes: 261 },
])

const bookmarks = ref([
  { id: 1, title: 'The Future of Web Components',  author: 'Alex Rivera', date: 'Mar 5, 2026'  },
  { id: 2, title: 'Mastering Tailwind CSS',         author: 'Priya Nair',  date: 'Feb 28, 2026' },
  { id: 3, title: 'Next.js 15: What\'s New',        author: 'Jordan Kim',  date: 'Feb 14, 2026' },
])

// drafts are now loaded from backend

const publishedPosts = computed(() => allPosts.value.filter(p => p.status === 'PUBLISHED'))

function formatNum(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n
}

function togglePostMenu(postId) {
  openPostMenuId.value = openPostMenuId.value === postId ? null : postId
}

function editPost(_postId) {
  openPostMenuId.value = null
  navigateTo('/create')
}

function deletePost(postId) {
  allPosts.value = allPosts.value.filter(post => post.id !== postId)
  openPostMenuId.value = null
}

function toggleDraftMenu(draftId) {
  openDraftMenuId.value = openDraftMenuId.value === draftId ? null : draftId
}

function editDraft(_draftId) {
  openDraftMenuId.value = null
  navigateTo('/create')
}

function deleteDraft(draftId) {
  drafts.value = drafts.value.filter(draft => draft.id !== draftId)
  openDraftMenuId.value = null
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
  padding: 110px 40px 32px;
  color: var(--dash-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.pageTitle {
  color: var(--dash-text);
}

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.header__user {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--dash-surface-alt);
  color: var(--dash-text);
  border: 1px solid var(--dash-border);
  padding: 10px 18px 10px 12px;
  border-radius: 14px;
  box-shadow: var(--dash-shadow);
}
.header__identityLink {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  border-radius: 10px;
  padding: 2px;
  transition: background-color 0.2s ease;
}
.header__identityLink:hover {
  background: var(--dash-hover-bg);
}
.avatar {
  width: 36px; height: 36px;
  background: var(--dash-surface-soft);
  border-radius: 50%;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.avatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar svg { width: 18px; height: 18px; color: var(--dash-text-muted); }
.header__user-info { display: flex; flex-direction: column; }
.header__user-name { font-size: 0.85rem; font-weight: 600; line-height: 1.2; color: var(--dash-text); }
.header__user-handle { font-size: 0.72rem; color: var(--dash-text-muted); font-family: 'DM Mono', monospace; }

.logoutBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--dash-danger);
  color: var(--dash-danger);
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background-color 0.18s ease, color 0.18s ease;
  font-family: 'Sora', sans-serif;
}
.logoutBtn:hover {
  background: var(--dash-danger);
  color: #fff;
}

/* ── Stats ── */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.stat_card {
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  border-radius: 0;
  padding: 24px 28px;
  color: var(--dash-text);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
}
.stat_card:hover {
  transform: translateY(-3px);
  box-shadow: var(--dash-shadow-hover);
}
.stat_card__icon {
  width: 36px; height: 36px;
  background: var(--dash-surface-soft);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.stat_card__icon svg { width: 18px; height: 18px; color: var(--dash-text); }
.stat_card__label {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: var(--dash-text-muted);
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  display: block;
  margin-bottom: 10px;
}
.stat_card__value {
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 10px;
}
.stat_card__sub {
  font-size: 0.75rem;
  color: var(--dash-text-soft);
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1.5px solid var(--dash-border-strong);
  margin-bottom: 28px;
}
.tabs__item {
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
.tabs__item_active {
  color: var(--dash-text);
  border-bottom-color: var(--dash-accent);
}
.tabs__icon { width: 15px; height: 15px; }
.tabs__item_link {
  text-decoration: none;
}

/* ── Content ── */
.content__heading {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

/* ── Post cards ── */
.post_list { display: flex; flex-direction: column; gap: 12px; }
.post_card {
  background: var(--dash-surface);
  border-radius: 14px;
  padding: 20px 24px;
  border: 1px solid var(--dash-border);
  transition: box-shadow 0.2s ease, transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
}
.post_card:hover {
  box-shadow: var(--dash-shadow);
  transform: translateY(-1px);
}
.post_card__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.post_card__menu_wrap {
  position: relative;
}
.post_card__meta { flex: 1; }
.post_card__title {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 8px;
  color: var(--dash-text);
}
.post_card__info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.post_card__date { font-size: 0.78rem; color: var(--dash-text-muted); }
.post_card__stats {
  display: flex;
  gap: 16px;
}
.stat_pill {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: var(--dash-text-soft);
}
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
.post_card__dropdown_item:hover {
  background: var(--dash-hover-bg);
}
.post_card__dropdown_item_danger {
  color: var(--dash-danger);
}
.post_card__dropdown_item_danger:hover {
  background: var(--dash-danger-soft);
}

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
.badge_draft     { background: var(--dash-surface-soft); color: var(--dash-text-soft); }

/* ── Draft progress ── */
.draft_progress {
  height: 4px;
  background: var(--dash-surface-soft);
  border-radius: 99px;
  margin-top: 12px;
  overflow: hidden;
}
.draft_progress__bar {
  height: 100%;
  background: var(--dash-accent);
  border-radius: 99px;
  transition: width 0.3s ease;
}
.draft_progress__label {
  font-size: 0.72rem;
  color: var(--dash-text-muted);
  margin-top: 5px;
  display: block;
  font-family: 'DM Mono', monospace;
}

/* ── Create form ── */
.create_panel { max-width: 680px; }
.create_form { display: flex; flex-direction: column; gap: 14px; }
.create_form__input,
.create_form__textarea {
  width: 100%;
  border: 1.5px solid var(--dash-border-strong);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  color: var(--dash-text);
  background: var(--dash-surface);
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
}
.create_form__input:focus,
.create_form__textarea:focus { border-color: var(--dash-accent); }
.create_form__input::placeholder,
.create_form__textarea::placeholder { color: var(--dash-text-muted); }
.create_form__actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn {
  padding: 10px 22px;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}
.btn_ghost {
  background: var(--dash-surface-soft);
  color: var(--dash-text-soft);
  border: 1.5px solid var(--dash-border-strong);
}
.btn_ghost:hover { background: var(--dash-hover-bg); }
.btn_primary { background: var(--dash-accent); color: var(--dash-text-inverse); }
.btn_primary:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .dashboard { padding: 96px 16px 20px; }
  .stats { grid-template-columns: 1fr; }
  .tabs__item { padding: 10px 16px; font-size: 0.8rem; }
}
</style>