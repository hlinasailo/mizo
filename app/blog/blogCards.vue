<script setup lang="ts">
import { fakePosts } from './useFakePosts'

defineOptions({ name: 'BlogCardsPage' })

const router = useRouter()
const route  = useRoute()

// ── Theme (reads from <html class="dark"> set by your navbar toggle) ──
const isDark = computed(() => {
  if (import.meta.client) {
    return document.documentElement.classList.contains('dark')
  }
  return true
})

// ── Categories ────────────────────────────────────────────────
const activeCategory = computed(() => (route.query.category as string) || 'All')

// ── Pagination ────────────────────────────────────────────────
const currentPage = ref(1)
const PAGE_SIZE   = 12   // 3-column grid fits multiples of 3

const filteredPosts = computed(() =>
  activeCategory.value === 'All'
    ? fakePosts
    : fakePosts.filter(p => p.category === activeCategory.value)
)

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / PAGE_SIZE))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredPosts.value.slice(start, start + PAGE_SIZE)
})

watch(activeCategory, () => { currentPage.value = 1 })

const visiblePages = computed((): (number | '...')[] => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const cur   = currentPage.value
  const pages: (number | '...')[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const categoryGradient: Record<string, string> = {
  'Zirna':            'from-zinc-500  to-zinc-700',
  'Gospel':           'from-slate-500 to-slate-700',
  'Hriselna':         'from-zinc-600  to-zinc-800',
  'Thiamna':          'from-stone-500 to-stone-700',
  'Beauty & Fashion': 'from-zinc-400  to-zinc-600',
  'Story':            'from-neutral-500 to-neutral-700',
  'Politics':         'from-zinc-600  to-zinc-900',
  'Infiamna':         'from-slate-400 to-slate-700',
  'Others':           'from-zinc-500  to-zinc-800',
}

const getGradient = (category: string) =>
  categoryGradient[category] ?? 'from-zinc-500 to-zinc-700'
</script>

<template>
  <main :class="$style.page">
    <section :class="$style.inner">

      <!-- ── Page Header ────────────────────────────────────── -->
      <div :class="$style.header">
        <h1 :class="$style.heading">
          <template v-if="activeCategory !== 'All'">
            {{ activeCategory }}
          </template>
          <template v-else>
            Blog <span :class="$style.headingMuted">Posts</span>
          </template>
        </h1>
        <div :class="$style.headingBar" />
        <p :class="$style.headingMeta">
          <template v-if="activeCategory !== 'All'">
            Showing posts in
            <span :class="$style.headingMetaStrong">{{ activeCategory }}</span> —
            <NuxtLink to="/blogs" :class="$style.headingMetaLink">view all</NuxtLink>
          </template>
          <template v-else>
            Discover stories, ideas and perspectives from the Mizomade community.
          </template>
        </p>
      </div>

      <!-- ── Post Count ─────────────────────────────────────── -->
      <p :class="$style.postCount">
        {{ filteredPosts.length }} post{{ filteredPosts.length !== 1 ? 's' : '' }}
        <span v-if="activeCategory !== 'All'">· {{ activeCategory }}</span>
      </p>

      <!-- ── Cards Grid ─────────────────────────────────────── -->
      <div v-if="paginatedPosts.length > 0" :class="$style.grid">
        <article
          v-for="post in paginatedPosts"
          :key="post.id"
          :class="$style.card"
          @click="router.push(`/blog/${post.slug}`)"
        >
          <!-- Thumbnail -->
          <div :class="$style.thumb">
            <img
              v-if="post.thumbnail"
              :src="post.thumbnail"
              :alt="post.title"
              :class="$style.thumbImg"
            >
            <div
              v-else
              :class="[$style.thumbFallback, `bg-gradient-to-br`, getGradient(post.category)]"
            >
              <span :class="$style.thumbFallbackLabel">{{ post.category }}</span>
            </div>

            <!-- Category pill overlaid on thumbnail -->
            <span :class="$style.categoryBadge">{{ post.category }}</span>
          </div>

          <!-- Card Body -->
          <div :class="$style.body">
            <!-- Title -->
            <h2 :class="$style.title">{{ post.title }}</h2>

            <!-- Author row -->
            <div :class="$style.authorRow">
              <!-- Avatar -->
              <div :class="$style.avatar">
                <img
                  v-if="post.authorAvatar"
                  :src="post.authorAvatar"
                  :alt="post.author"
                  :class="$style.avatarImg"
                >
                <svg v-else :class="$style.avatarIcon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>

              <div :class="$style.authorMeta">
                <span :class="$style.authorName">@{{ post.author }}</span>
                <span :class="$style.authorDate">{{ formatDate(post.date) }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- ── Empty State ────────────────────────────────────── -->
      <div v-else :class="$style.empty">
        <p :class="$style.emptyTitle">No posts found</p>
        <p :class="$style.emptySubtitle">Try selecting a different category.</p>
      </div>

      <!-- ── Pagination ─────────────────────────────────────── -->
      <div v-if="totalPages > 1" :class="$style.pagination">
        <button
          :class="[$style.pageBtn, $style.pageBtnNav]"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ← Prev
        </button>

        <template v-for="page in visiblePages" :key="String(page)">
          <span v-if="page === '...'" :class="$style.pageDots">…</span>
          <button
            v-else
            :class="[$style.pageBtn, currentPage === page ? $style.pageBtnActive : $style.pageBtnIdle]"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
        </template>

        <button
          :class="[$style.pageBtn, $style.pageBtnNav]"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next →
        </button>
      </div>

    </section>
  </main>

  <AppFooter />
  <ButtomFooter />
</template>

<style module>
/* ── CSS tokens ─────────────────────────────────────────────
   These mirror what your navbar toggle sets on <html>.
   Light = default  |  Dark = html.dark                     */
:global(:root) {
  --pg-bg:          #cbcbcb;
  --pg-surface:     #e3e3e3;
  --pg-border:      rgba(0, 0, 0, 0.216);
  --pg-fg:          #111110;
  --pg-fg-muted:    #555555;
  --pg-fg-soft:     rgba(17,17,16,0.40);
  --pg-badge-bg:    rgba(0,0,0,0.07);
  --pg-badge-fg:    #444441;
  --pg-thumb-over:  rgba(0,0,0,0.02);
  --pg-page-active-bg:  #111110;
  --pg-page-active-fg:  #ffffff;
  --pg-page-idle-border: rgba(0,0,0,0.18);
  --pg-page-idle-fg:     #6b6b67;
  --pg-empty-bg:    rgba(0,0,0,0.04);
  --pg-link:        #111110;
}
:global(html.dark) {
  --pg-bg:          #0a0a0a;
  --pg-surface:     #161616;
  --pg-border:      rgba(255, 255, 255, 0.162);
  --pg-fg:          #f0ede8;
  --pg-fg-muted:    rgba(240,237,232,0.55);
  --pg-fg-soft:     rgba(240,237,232,0.30);
  --pg-badge-bg:    rgba(255,255,255,0.10);
  --pg-badge-fg:    rgba(240,237,232,0.70);
  --pg-thumb-over:  rgba(0,0,0,0.15);
  --pg-page-active-bg:  #f0ede8;
  --pg-page-active-fg:  #0a0a0a;
  --pg-page-idle-border: rgba(255,255,255,0.15);
  --pg-page-idle-fg:     rgba(240,237,232,0.45);
  --pg-empty-bg:    rgba(255,255,255,0.04);
  --pg-link:        #f0ede8;
}

/* ── Smooth theme transition ────────────────────────────── */
:global(*) {
  transition:
    background-color 0.35s ease,
    border-color     0.35s ease,
    color            0.35s ease,
    box-shadow       0.35s ease;
}

/* ── Page shell ─────────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: var(--pg-bg);
  padding: 6rem 1rem 5rem;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: min(40vh, 22rem);
  pointer-events: none;
  background-image:
    linear-gradient(to bottom, var(--pg-border) 1px, transparent 1px),
    linear-gradient(to right, var(--pg-border) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.55;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0));
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0));
}
:global(html.dark) .page::before {
  opacity: 0.35;
}
@media (min-width: 640px)  { .page { padding-left: 2rem;  padding-right: 2rem;  } }
@media (min-width: 1024px) { .page { padding-left: 3.5rem; padding-right: 3.5rem; } }

.inner {
  max-width: 72rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ── Header ─────────────────────────────────────────────── */
.header    { margin-bottom: 2.5rem; }
.heading   {
  font-family: 'Bebas Neue', 'Arial Black', sans-serif;
  font-size: clamp(3rem, 8vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--pg-fg);
  margin-bottom: 0.75rem;
}
.headingMuted  { color: var(--pg-fg-muted); }
.headingBar    { width: 3.5rem; height: 3px; background: var(--pg-fg); margin-bottom: 1rem; opacity: 0.8; }
.headingMeta   { color: var(--pg-fg-muted); font-size: 0.875rem; }
.headingMetaStrong { color: var(--pg-fg); font-weight: 600; }
.headingMetaLink   {
  color: var(--pg-link);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.headingMetaLink:hover { opacity: 0.7; }

/* ── Post count ─────────────────────────────────────────── */
.postCount {
  color: var(--pg-fg-soft);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 1.75rem;
}

/* ── Grid ───────────────────────────────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}
@media (min-width: 640px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }

/* ── Card ───────────────────────────────────────────────── */
.card {
  background: var(--pg-surface);
  border: 1px solid var(--pg-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  /* override the global * transition for transform */
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background-color 0.35s ease,
    border-color 0.35s ease !important;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.14);
}
:global(html.dark) .card:hover {
  box-shadow: 0 12px 32px rgba(0,0,0,0.55);
}

/* ── Thumbnail ──────────────────────────────────────────── */
.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--pg-empty-bg);
}
.thumbImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease !important;
}
.card:hover .thumbImg { transform: scale(1.06); }

.thumbFallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumbFallbackLabel {
  color: rgba(255,255,255,0.35);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-align: center;
  padding: 0 0.5rem;
}

/* Category badge overlaid on thumbnail */
.categoryBadge {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  background: var(--pg-badge-bg);
  color: var(--pg-badge-fg);
  font-size: 0.55rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid var(--pg-border);
}

/* ── Card body ──────────────────────────────────────────── */
.body {
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1;
}

/* ── Title ──────────────────────────────────────────────── */
.title {
  font-size: 0.975rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--pg-fg);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* pull title to top, push author to bottom */
  flex: 1;
}
.card:hover .title { color: var(--pg-fg-muted); }

/* ── Author row ─────────────────────────────────────────── */
.authorRow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: auto;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--pg-border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--pg-border);
}
.avatarImg  { width: 100%; height: 100%; object-fit: cover; }
.avatarIcon { width: 1rem; height: 1rem; color: var(--pg-fg-muted); }

.authorMeta   { display: flex; flex-direction: column; gap: 0.1rem; }
.authorName   { font-size: 0.72rem; font-weight: 600; color: var(--pg-fg); }
.authorDate   { font-size: 0.65rem; color: var(--pg-fg-muted); }

/* ── Empty state ────────────────────────────────────────── */
.empty {
  text-align: center;
  padding: 5rem 2rem;
  background: var(--pg-empty-bg);
  border: 1px solid var(--pg-border);
  border-radius: 12px;
}
.emptyTitle    { color: var(--pg-fg-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; }
.emptySubtitle { color: var(--pg-fg-soft);  font-size: 0.7rem;  margin-top: 0.4rem; }

/* ── Pagination ─────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pageBtn {
  height: 2rem;
  min-width: 2rem;
  padding: 0 0.6rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.2s ease !important;
}
.pageBtn:disabled { opacity: 0.2; cursor: not-allowed; }

.pageBtnActive {
  background: var(--pg-page-active-bg);
  color:      var(--pg-page-active-fg);
}

.pageBtnIdle {
  border: 1px solid var(--pg-page-idle-border);
  color:  var(--pg-page-idle-fg);
}
.pageBtnIdle:hover:not(:disabled) {
  border-color: var(--pg-fg);
  color: var(--pg-fg);
}

.pageBtnNav {
  border: 1px solid var(--pg-page-idle-border);
  color:  var(--pg-page-idle-fg);
  padding: 0 0.75rem;
}
.pageBtnNav:hover:not(:disabled) {
  border-color: var(--pg-fg);
  color: var(--pg-fg);
}

.pageDots {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pg-fg-soft);
  font-size: 0.75rem;
}
</style>