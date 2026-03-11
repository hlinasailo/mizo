<script setup lang="ts">
import { fakePosts } from './useFakePosts'

defineOptions({ name: 'BlogPostPage' })

const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)
const post = computed(() => fakePosts.find(p => p.slug === slug.value) ?? null)

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const categoryGradient: Record<string, string> = {
  'Zirna':            'from-zinc-600 to-zinc-950',
  'Gospel':           'from-zinc-500 to-zinc-900',
  'Hriselna':         'from-zinc-700 to-zinc-950',
  'Thiamna':          'from-zinc-600 to-zinc-900',
  'Beauty & Fashion': 'from-zinc-500 to-zinc-800',
  'Story':            'from-zinc-700 to-zinc-950',
  'Politics':         'from-zinc-600 to-zinc-950',
  'Infiamna':         'from-zinc-500 to-zinc-900',
  'Others':           'from-zinc-700 to-zinc-900',
}

const getGradient = (category: string) =>
  categoryGradient[category] ?? 'from-zinc-700 to-zinc-950'
</script>

<template>
  <main class="pt-24 min-h-screen bg-zinc-800 text-white px-6 lg:px-12 pb-16">
    <section class="max-w-4xl mx-auto">

      <!-- ─── Not Found ─── -->
      <div v-if="!post" class="text-center py-24 border border-zinc-800 bg-zinc-950">
        <p class="text-zinc-500 text-sm uppercase tracking-widest font-bold mb-6">Post not found</p>
        <button
          class="text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2 mx-auto"
          @click="router.back()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>
      </div>

      <!-- ─── Post ─── -->
      <template v-else>

        <!-- Header -->
        <div class="mb-10">
          <div class="flex items-start justify-between gap-6 mb-6">
            <!-- Title block -->
            <div class="flex-1 min-w-0">
              <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3 block">
                {{ post.category }}
              </span>
              <h1 class="font-black tracking-tighter leading-[1.05] uppercase text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-white">
                {{ post.title }}
              </h1>
            </div>
            <!-- ← Back button -->
            <button
              class="text-zinc-400 hover:text-white transition-colors duration-200 mt-1 cursor-pointer bg-transparent border-none p-0 shrink-0"
              title="Go back"
              @click="router.back()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          <div class="w-24 h-1 bg-zinc-400 mb-6" />

          <!-- Meta row -->
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <span class="text-zinc-300 font-medium">@{{ post.author }}</span>
            <span class="text-zinc-700">•</span>
            <span class="text-zinc-500">{{ formatDate(post.date) }}</span>
            <span class="text-zinc-700">•</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-700 px-2 py-0.5">
              {{ post.category }}
            </span>
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="aspect-video w-full overflow-hidden mb-12 border border-zinc-700">
          <img
            v-if="post.thumbnail"
            :src="post.thumbnail"
            :alt="post.title"
            class="w-full h-full object-cover"
          >
          <div
            v-else
            :class="`w-full h-full bg-gradient-to-br ${getGradient(post.category)} flex items-center justify-center`"
          >
            <span class="text-zinc-600 text-xs uppercase tracking-[0.25em] font-bold select-none">
              {{ post.category }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="prose-content" v-html="post.content" />

        <!-- Bottom back link -->
        <div class="border-t border-zinc-700 mt-16 pt-8">
          <button
            class="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 text-xs uppercase tracking-widest font-bold"
            @click="router.back()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Posts
          </button>
        </div>

      </template>
    </section>
  </main>
</template>

<style scoped>
.prose-content :deep(h2) {
  font-size: 1.375rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 2.25rem 0 1rem;
  line-height: 1.1;
}

.prose-content :deep(h3) {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #e4e4e7;
  margin: 1.75rem 0 0.75rem;
}

.prose-content :deep(p) {
  color: #a1a1aa;
  line-height: 1.85;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}

.prose-content :deep(blockquote) {
  border-left: 3px solid #52525b;
  padding: 0.5rem 0 0.5rem 1.25rem;
  color: #71717a;
  font-style: italic;
  margin: 2rem 0;
  font-size: 1rem;
  line-height: 1.7;
}

.prose-content :deep(ul) {
  list-style: none;
  padding-left: 0;
  margin-bottom: 1.25rem;
}

.prose-content :deep(ul li) {
  color: #a1a1aa;
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.625rem;
  font-size: 0.9375rem;
  line-height: 1.7;
}

.prose-content :deep(ul li::before) {
  content: '—';
  position: absolute;
  left: 0;
  color: #52525b;
}

.prose-content :deep(strong) {
  color: #d4d4d8;
  font-weight: 700;
}
</style>
