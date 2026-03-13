<script setup lang="ts">
import { fakePosts } from './useFakePosts'

defineOptions({ name: 'BlogPostPage' })

const route  = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)
const post = computed(() => fakePosts.find(p => p.slug === slug.value) ?? null)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
</script>

<template>
  <main :class="$style.page">
    <div :class="$style.gridOverlay" />

    <section :class="$style.section">
      <div :class="$style.card">

        <!-- ── Not Found ───────────────────────────────────── -->
        <div v-if="!post" :class="$style.notFound">
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
            <!-- Back arrow -->
            <button :class="$style.backArrow" title="Go back" @click="router.back()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <!-- Category + Title -->
            <div :class="$style.titleBlock">
              <span :class="$style.categoryLabel">{{ post.category }}</span>
              <h1 :class="$style.title">{{ post.title }}</h1>
            </div>

            <div :class="$style.titleBar" />

            <!-- Meta -->
            <div :class="$style.meta">
              <span :class="$style.metaAuthor">@{{ post.author }}</span>
              <span :class="$style.metaDot">•</span>
              <span :class="$style.metaDate">{{ formatDate(post.date) }}</span>
              <span :class="$style.metaDot">•</span>
              <span :class="$style.metaBadge">{{ post.category }}</span>
            </div>
          </div>

          <!-- Content -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div :class="$style.prose" v-html="post.content" />

          <!-- Bottom back -->
          <div :class="$style.footer">
            <button :class="$style.backBtn" @click="router.back()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Posts
            </button>
          </div>

        </template>
      </div>
    </section>
  </main>
</template>

<style module>
/* ── Tokens ──────────────────────────────────────────────────
   Navbar toggle sets/removes `dark` on <html>.
   Light = :root  |  Dark = html.dark                        */
:global(:root) {
  --bp-page-bg:       #b2b2b2;
  --bp-grid-color:    rgba(0,0,0,0.045);
  --bp-card-bg:       rgba(255,255,255,0.75);
  --bp-card-border:   rgba(0,0,0,0.08);
  --bp-card-shadow:   0 2px 24px rgba(0,0,0,0.07);

  --bp-back-fg:       #999895;
  --bp-back-hover:    #111110;

  --bp-cat-label:     #aaa9a5;
  --bp-title:         #111110;
  --bp-bar:           rgba(0,0,0,0.20);

  --bp-author:        #333331;
  --bp-dot:           #cccbc7;
  --bp-date:          #888884;
  --bp-badge-bg:      rgba(0,0,0,0.06);
  --bp-badge-border:  rgba(0,0,0,0.12);
  --bp-badge-fg:      #666663;

  --bp-h2:            #111110;
  --bp-h3:            #333331;
  --bp-p:             #55534f;
  --bp-bq-border:     #cccbc7;
  --bp-bq-fg:         #888884;
  --bp-li-marker:     #cccbc7;
  --bp-li-fg:         #55534f;
  --bp-strong:        #222220;

  --bp-footer-border: rgba(0,0,0,0.10);

  --bp-notfound-bg:   rgba(0,0,0,0.04);
  --bp-notfound-border: rgba(0,0,0,0.09);
  --bp-notfound-fg:   #888884;
}

:global(html.dark) {
  --bp-page-bg:       #0f0f11;
  --bp-grid-color:    rgba(255,255,255,0.04);
  --bp-card-bg:       rgba(255,255,255,0.04);
  --bp-card-border:   rgba(255,255,255,0.08);
  --bp-card-shadow:   0 2px 24px rgba(0,0,0,0.40);

  --bp-back-fg:       #52525b;
  --bp-back-hover:    #ffffff;

  --bp-cat-label:     #52525b;
  --bp-title:         #ffffff;
  --bp-bar:           #52525b;

  --bp-author:        #d4d4d8;
  --bp-dot:           #3f3f46;
  --bp-date:          #71717a;
  --bp-badge-bg:      transparent;
  --bp-badge-border:  #3f3f46;
  --bp-badge-fg:      #71717a;

  --bp-h2:            #ffffff;
  --bp-h3:            #e4e4e7;
  --bp-p:             #a1a1aa;
  --bp-bq-border:     #52525b;
  --bp-bq-fg:         #71717a;
  --bp-li-marker:     #52525b;
  --bp-li-fg:         #a1a1aa;
  --bp-strong:        #d4d4d8;

  --bp-footer-border: #3f3f46;

  --bp-notfound-bg:   #18181b;
  --bp-notfound-border: #27272a;
  --bp-notfound-fg:   #52525b;
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

/* Grid overlay */
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

.backArrow {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--bp-back-fg);
  display: inline-flex;
  margin-bottom: 1.25rem;
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

/* ── Back button (shared) ───────────────────────────────── */
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
}

/* ── Prose ───────────────────────────────────────────────── */
.prose :deep(h2) {
  font-size: 1.375rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--bp-h2);
  margin: 2.25rem 0 1rem;
  line-height: 1.1;
}
.prose :deep(h3) {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--bp-h3);
  margin: 1.75rem 0 0.75rem;
}
.prose :deep(p) {
  color: var(--bp-p);
  line-height: 1.85;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}
.prose :deep(blockquote) {
  border-left: 3px solid var(--bp-bq-border);
  padding: 0.5rem 0 0.5rem 1.25rem;
  color: var(--bp-bq-fg);
  font-style: italic;
  margin: 2rem 0;
  font-size: 1rem;
  line-height: 1.7;
}
.prose :deep(ul) {
  list-style: none;
  padding-left: 0;
  margin-bottom: 1.25rem;
}
.prose :deep(ul li) {
  color: var(--bp-li-fg);
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.625rem;
  font-size: 0.9375rem;
  line-height: 1.7;
}
.prose :deep(ul li::before) {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--bp-li-marker);
}
.prose :deep(strong) {
  color: var(--bp-strong);
  font-weight: 700;
}
</style>