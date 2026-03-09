<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

defineOptions({
  name: 'BlogCreatePage'
})

const title = ref('')
const slug = ref('')
const category = ref('Others')
const summary = ref('')
const imageUrl = ref('')
const isSubmitting = ref(false)

const categories = [
  'Zirna',
  'Gospel',
  'Hriselna',
  'Thiamna',
  'Beauty & Fashion',
  'Story',
  'Politics',
  'Infiamna',
  'Others'
]

const editor = useEditor({
  content: '<p>Start writing your blog post...</p>',
  extensions: [
    StarterKit,
    Image.configure({
      inline: false,
      allowBase64: true
    })
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert max-w-none min-h-[280px] focus:outline-none'
    }
  }
})

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const handleTitleInput = () => {
  slug.value = toSlug(title.value)
}

const addImageByUrl = () => {
  if (!imageUrl.value.trim() || !editor.value) {
    return
  }

  editor.value.chain().focus().setImage({ src: imageUrl.value.trim() }).run()
  imageUrl.value = ''
}

const addImageByFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !editor.value) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result
    if (typeof result === 'string') {
      editor.value?.chain().focus().setImage({ src: result, alt: file.name }).run()
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const submitPost = async () => {
  isSubmitting.value = true

  try {
    const payload = {
      title: title.value,
      slug: slug.value,
      category: category.value,
      summary: summary.value,
      content: editor.value?.getHTML() ?? ''
    }

    console.log('Blog payload:', payload)
    await new Promise((resolve) => setTimeout(resolve, 500))
  } finally {
    isSubmitting.value = false
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <main class="pt-24 min-h-screen bg-zinc-700 text-white px-6 lg:px-12 pb-16">
    <section class="max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="font-black tracking-tighter leading-[1] uppercase text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]">
          Create <span class="text-zinc-200">Blog</span>
        </h1>
        <div class="w-24 h-1 bg-zinc-200 mt-4" />
        <p class="text-zinc-200 mt-4 text-sm sm:text-base">
          Write and publish with the same Mizomade style.
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="submitPost">
        <div class="grid md:grid-cols-2 gap-6">
          <label class="space-y-2">
            <span class="text-zinc-200 uppercase tracking-wide text-xs">Title</span>
            <input
              v-model="title"
              type="text"
              placeholder="Enter blog title"
              class="w-full bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:border-white/40"
              @input="handleTitleInput"
            >
          </label>

          <label class="space-y-2">
            <span class="text-zinc-200 uppercase tracking-wide text-xs">Slug</span>
            <input
              v-model="slug"
              type="text"
              placeholder="blog-title-slug"
              class="w-full bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:border-white/40"
            >
          </label>
        </div>

        <div class="grid md:grid-cols-[2fr_1fr] gap-6">
          <label class="space-y-2">
            <span class="text-zinc-200 uppercase tracking-wide text-xs">Summary</span>
            <textarea
              v-model="summary"
              rows="4"
              placeholder="Short summary for preview cards"
              class="w-full bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:border-white/40"
            />
          </label>

          <label class="space-y-2">
            <span class="text-zinc-200 uppercase tracking-wide text-xs">Category</span>
            <select
              v-model="category"
              class="w-full bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:border-white/40"
            >
              <option v-for="item in categories" :key="item" :value="item" class="text-black">
                {{ item }}
              </option>
            </select>
          </label>
        </div>

        <div class="bg-zinc-900 border border-white/10 p-4 space-y-4">
          <div class="flex flex-wrap gap-2 border-b border-white/10 pb-4">
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().toggleBold().run()">Bold</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().toggleItalic().run()">Italic</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().toggleStrike().run()">Strike</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().toggleBulletList().run()">Bullet</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().toggleOrderedList().run()">Numbered</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().toggleBlockquote().run()">Quote</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().setHorizontalRule().run()">Divider</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().undo().run()">Undo</button>
            <button type="button" class="toolbar-btn" @click="editor?.chain().focus().redo().run()">Redo</button>
          </div>

          <div class="grid sm:grid-cols-[1fr_auto] gap-3 items-center">
            <input
              v-model="imageUrl"
              type="url"
              placeholder="Paste image URL and click Add"
              class="w-full bg-white/10 border border-white/15 text-white px-4 py-2.5 focus:outline-none focus:border-white/40"
            >
            <button type="button" class="action-btn" @click="addImageByUrl">
              Add image URL
            </button>
          </div>

          <label class="inline-flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
            <span class="action-btn">Upload image</span>
            <input type="file" accept="image/*" class="hidden" @change="addImageByFile">
            <span>Insert image from your device</span>
          </label>

          <EditorContent :editor="editor" class="editor-shell" />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 text-sm font-bold text-black bg-white hover:bg-zinc-200 uppercase tracking-wide transition-all duration-300 disabled:opacity-50"
          >
            {{ isSubmitting ? 'Publishing...' : 'Publish post' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.toolbar-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
}

.action-btn {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 0.65rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.45);
}

.editor-shell {
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1rem;
  min-height: 320px;
  background: rgba(24, 24, 27, 0.8);
}

.editor-shell :deep(.ProseMirror) {
  min-height: 280px;
}

.editor-shell :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: 'Write your story...';
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
  float: left;
  height: 0;
}

.editor-shell :deep(img) {
  max-width: 100%;
  height: auto;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin: 1rem 0;
}

.editor-shell :deep(blockquote) {
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  margin: 1rem 0;
  padding-left: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.editor-shell :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 1rem 0;
}
</style>
