<script setup lang="ts">
import { fakePosts } from './useFakePosts'

defineOptions({ name: 'BlogCardsPage' })

const router = useRouter()
const route = useRoute()

// ── Categories ──────────────────────────────────────────────
const activeCategory = computed(() => (route.query.category as string) || 'All')

// ── Pagination ───────────────────────────────────────────────
const currentPage = ref(1)
const PAGE_SIZE = 10

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
  const cur = currentPage.value
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

// ── Helpers ──────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

const categoryGradient: Record<string, string> = {
  'Zirna':            'from-zinc-500 to-zinc-700',
  'Gospel':           'from-slate-500 to-slate-700',
  'Hriselna':         'from-zinc-600 to-zinc-800',
  'Thiamna':          'from-stone-500 to-stone-700',
  'Beauty & Fashion': 'from-zinc-400 to-zinc-600',
  'Story':            'from-neutral-500 to-neutral-700',
  'Politics':         'from-zinc-600 to-zinc-900',
  'Infiamna':         'from-slate-400 to-slate-700',
  'Others':           'from-zinc-500 to-zinc-800',
}

const getGradient = (category: string) =>
  categoryGradient[category] ?? 'from-zinc-500 to-zinc-700'
</script>

<template>
  <main class="pt-24 min-h-screen bg-zinc-900 px-4 sm:px-8 lg:px-14 pb-20">
    <section class="max-w-5xl mx-auto">

      <!-- ── Page Header ── -->
      <div class="mb-10">
        <h1 class="text-white font-black uppercase tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-none mb-3">
          <template v-if="activeCategory !== 'All'">
            {{ activeCategory }}
          </template>
          <template v-else>
            Blog <span class="text-zinc-500">Posts</span>
          </template>
        </h1>
        <div class="w-16 h-[3px] bg-white mb-4" />
        <p class="text-zinc-500 text-sm">
          <template v-if="activeCategory !== 'All'">
            Showing posts in <span class="text-zinc-300 font-semibold">{{ activeCategory }}</span> —
            <NuxtLink to="/blogs" class="underline underline-offset-2 hover:text-white transition-colors">view all</NuxtLink>
          </template>
          <template v-else>
            Discover stories, ideas and perspectives from the Mizomade community.
          </template>
        </p>
      </div>

      <!-- ── Post Count ── -->
      <p class="text-zinc-600 text-[10px] uppercase tracking-[0.2em] mb-6">
        {{ filteredPosts.length }} post{{ filteredPosts.length !== 1 ? 's' : '' }}
        <span v-if="activeCategory !== 'All'">· {{ activeCategory }}</span>
      </p>

      <!-- ── Cards List ── -->
      <div v-if="paginatedPosts.length > 0" class="flex flex-col gap-3 mb-10">
        <article
          v-for="post in paginatedPosts"
          :key="post.id"
          class="post-card group cursor-pointer flex flex-row items-stretch rounded-lg overflow-hidden"
          @click="router.push(`/blog/${post.slug}`)"
        >
          <!-- Left: Content -->
          <div class="flex flex-col justify-between px-5 py-4 flex-1 min-w-0">

            <!-- Top row: category pill -->
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 px-2 py-0.5">
                {{ post.category }}
              </span>
            </div>

            <!-- Title -->
            <h2 class="text-zinc-900 font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-zinc-600 transition-colors duration-200 mb-3">
              {{ post.title }}
            </h2>

            <!-- Bottom: author + date -->
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <span class="text-zinc-500 text-[11px] font-semibold">@{{ post.author }}</span>
              <span class="text-zinc-300 text-[11px]">·</span>
              <span class="text-zinc-400 text-[11px]">{{ formatDate(post.date) }}</span>
            </div>
          </div>

          <!-- Right: Thumbnail -->
          <div class="w-36 sm:w-44 shrink-0 relative overflow-hidden">
            <img
              v-if="post.thumbnail"
              :src="post.thumbnail"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            >
            <div
              v-else
              :class="`w-full h-full bg-gradient-to-br ${getGradient(post.category)} flex items-center justify-center`"
            >
              <span class="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold select-none px-2 text-center">
                {{ post.category }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- ── Empty State ── -->
      <div v-else class="text-center py-20 bg-zinc-800 rounded-lg border border-zinc-700">
        <p class="text-zinc-500 text-sm uppercase tracking-widest font-bold">No posts found</p>
        <p class="text-zinc-600 text-xs mt-2">Try selecting a different category.</p>
      </div>

      <!-- ── Pagination ── -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5">
        <!-- Prev -->
        <button
          :disabled="currentPage === 1"
          class="px-3 h-8 text-xs font-bold border border-zinc-600 text-zinc-400 hover:border-zinc-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 rounded"
          @click="goToPage(currentPage - 1)"
        >
          ← Prev
        </button>

        <!-- Page numbers -->
        <template v-for="page in visiblePages" :key="String(page)">
          <span
            v-if="page === '...'"
            class="w-8 h-8 flex items-center justify-center text-zinc-600 text-xs"
          >…</span>
          <button
            v-else
            :class="[
              'w-8 h-8 text-[11px] font-bold transition-all duration-200 rounded',
              currentPage === page
                ? 'bg-white text-zinc-900'
                : 'border border-zinc-700 text-zinc-400 hover:border-zinc-400 hover:text-white'
            ]"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
        </template>

        <!-- Next -->
        <button
          :disabled="currentPage === totalPages"
          class="px-3 h-8 text-xs font-bold border border-zinc-600 text-zinc-400 hover:border-zinc-300 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 rounded"
          @click="goToPage(currentPage + 1)"
        >
          Next →
        </button>
      </div>

    </section>
  </main>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card {
  min-height: 100px;
  max-height: 120px;
  background-color: rgba(115, 115, 115, 0.638);
  backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}
</style>