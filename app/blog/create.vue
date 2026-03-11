<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { EditorContent, useEditor, Node, mergeAttributes } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

defineOptions({ name: 'BlogCreatePage' })

// ─── Resizable Image Node Extension ──────────────────────────────────────────
const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'inline',
  inline: true,
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src:    { default: null },
      alt:    { default: null },
      width:  { default: null },
      height: { default: 'auto' },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { class: 'resizable-img' })]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Wrapper
      const wrapper = document.createElement('span')
      wrapper.className = 'img-resize-wrapper'
      wrapper.contentEditable = 'false'

      // Image
      const img = document.createElement('img')
      img.src = node.attrs.src ?? ''
      img.alt = node.attrs.alt ?? ''
      img.style.width  = node.attrs.width  ? `${node.attrs.width}px`  : 'auto'
      img.style.height = (node.attrs.height && node.attrs.height !== 'auto') ? `${node.attrs.height}px` : 'auto'
      img.style.maxWidth = '100%'
      img.draggable = false

      // Live size tooltip
      const tooltip = document.createElement('span')
      tooltip.className = 'resize-tooltip'

      const refreshTooltip = () => {
        tooltip.textContent = `${Math.round(img.offsetWidth)} × ${Math.round(img.offsetHeight)} px`
      }

      // Select / deselect
      const select = () => { wrapper.classList.add('selected'); refreshTooltip() }
      const deselect = () => wrapper.classList.remove('selected')

      img.addEventListener('click', (e) => { e.stopPropagation(); select() })

      const globalClickHandler = (e: MouseEvent) => {
        if (e.target instanceof HTMLElement && !wrapper.contains(e.target)) deselect()
      }
      document.addEventListener('click', globalClickHandler)

      // Resize handle positions
      type HandlePos = 'nw'|'n'|'ne'|'w'|'e'|'sw'|'s'|'se'
      const handles: HandlePos[] = ['nw','n','ne','w','e','sw','s','se']
      const cursors: Record<HandlePos, string> = {
        nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
        w:  'w-resize',                  e: 'e-resize',
        sw: 'sw-resize', s: 's-resize', se: 'se-resize',
      }

      handles.forEach((pos) => {
        const handle = document.createElement('span')
        handle.className = `resize-handle resize-handle--${pos}`
        handle.style.cursor = cursors[pos]

        handle.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()

          const startX  = e.clientX
          const startY  = e.clientY
          const startW  = img.offsetWidth
          const startH  = img.offsetHeight
          const aspect  = startH / startW
          const isCorner = pos.length === 2

          const onMove = (ev: MouseEvent) => {
            const dx = ev.clientX - startX
            const dy = ev.clientY - startY
            let newW = startW
            let newH = startH

            if (pos.includes('e')) newW = Math.max(60, startW + dx)
            if (pos.includes('w')) newW = Math.max(60, startW - dx)
            if (pos.includes('s')) newH = Math.max(40, startH + dy)
            if (pos.includes('n')) newH = Math.max(40, startH - dy)

            // Lock aspect ratio on corners
            if (isCorner) newH = Math.round(newW * aspect)

            img.style.width  = `${newW}px`
            img.style.height = `${newH}px`
            refreshTooltip()
          }

          const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
            if (typeof getPos === 'function') {
              editor.chain()
                .setNodeSelection(getPos())
                .updateAttributes('resizableImage', {
                  width:  Math.round(img.offsetWidth),
                  height: Math.round(img.offsetHeight),
                })
                .run()
            }
          }

          document.addEventListener('mousemove', onMove)
          document.addEventListener('mouseup', onUp)
        })

        wrapper.appendChild(handle)
      })

      wrapper.appendChild(img)
      wrapper.appendChild(tooltip)

      return {
        dom: wrapper,
        update(updated) {
          if (updated.type.name !== 'resizableImage') return false
          img.src = updated.attrs.src ?? ''
          img.alt = updated.attrs.alt ?? ''
          if (updated.attrs.width)  img.style.width  = `${updated.attrs.width}px`
          if (updated.attrs.height && updated.attrs.height !== 'auto') {
            img.style.height = `${updated.attrs.height}px`
          }
          return true
        },
        destroy() {
          document.removeEventListener('click', globalClickHandler)
        }
      }
    }
  }
})

// ─── Page state ──────────────────────────
const title    = ref('')
const slug     = ref('')
const category = ref('Others')
const imageUrl = ref('')
const isSubmitting  = ref(false)
const isSavingDraft = ref(false)
const showImageUrl  = ref(false)

const categories = [
  'Zirna','Gospel','Hriselna','Thiamna',
  'Beauty & Fashion','Story','Politics','Infiamna','Others'
]

// ─── Editor ───────────────────────────────────
const editor = useEditor({
  content: '',
  extensions: [StarterKit, ResizableImage],
  editorProps: {
    attributes: { class: 'prosemirror-editor' }
  }
})

const toSlug = (v: string) =>
  v.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const handleTitleInput = () => { slug.value = toSlug(title.value) }

const insertImage = (src: string, alt = '') => {
  editor.value?.chain().focus().insertContent({
    type: 'resizableImage',
    attrs: { src, alt }
  }).run()
}

const addImageByUrl = () => {
  if (!imageUrl.value.trim() || !editor.value) return
  insertImage(imageUrl.value.trim())
  imageUrl.value = ''
  showImageUrl.value = false
}

const addImageByFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || !editor.value) return
  for (const file of Array.from(files)) {
    await new Promise<void>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') insertImage(reader.result, file.name)
        resolve()
      }
      reader.readAsDataURL(file)
    })
  }
  input.value = ''
}

const submitPost = async () => {
  isSubmitting.value = true
  try {
    const payload = {
      title: title.value,
      slug: slug.value,
      category: category.value,
      content: editor.value?.getHTML() ?? ''
    }
    console.log('Blog payload:', payload)
    await new Promise(r => setTimeout(r, 500))
  } finally {
    isSubmitting.value = false
  }
}

const saveDraft = async () => {
  isSavingDraft.value = true
  try {
    const draftPayload = {
      title: title.value,
      slug: slug.value,
      category: category.value,
      content: editor.value?.getHTML() ?? '',
      isDraft: true
    }
    console.log('Draft payload:', draftPayload)
    await new Promise(r => setTimeout(r, 500))
  } finally {
    isSavingDraft.value = false
  }
}

onBeforeUnmount(() => { editor.value?.destroy() })
</script>

<template>
  <main class="pt-24 min-h-screen bg-zinc-800 text-white px-6 lg:px-12 pb-16">
    <section class="max-w-5xl mx-auto">

      <div class="mb-10">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h1 class="font-black tracking-tighter leading-[1] uppercase text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]">
            Create <span class="text-zinc-400">Blog</span>
          </h1>
          <button class="text-zinc-400 hover:text-white transition-colors duration-200 mt-2 cursor-pointer bg-none border-none p-0" title="Go back" @click="$router.back()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
        <div class="w-24 h-1 bg-zinc-400" />
        <p class="text-zinc-400 mt-4 text-sm sm:text-base">Write and publish with the same Mizomade style.</p>
      </div>

      <form class="space-y-6" @submit.prevent="submitPost">

        <!-- Title + Slug -->
        <div class="grid md:grid-cols-2 gap-6">
          <label class="space-y-2 block">
            <span class="text-zinc-400 uppercase tracking-widest text-[10px] font-semibold">Title</span>
            <input v-model="title" type="text" placeholder="Enter blog title" class="field-input" @input="handleTitleInput">
          </label>
          <label class="space-y-2 block">
            <span class="text-zinc-400 uppercase tracking-widest text-[10px] font-semibold">Slug</span>
            <input v-model="slug" type="text" placeholder="blog-title-slug" class="field-input">
          </label>
        </div>

        <!-- Category -->
        <div>
          <label class="space-y-2 block">
            <span class="text-zinc-400 uppercase tracking-widest text-[10px] font-semibold">Category</span>
            <select v-model="category" class="field-input">
              <option v-for="item in categories" :key="item" :value="item" class="bg-white text-black">{{ item }}</option>
            </select>
          </label>
        </div>

        <!-- Editor block -->
        <div class="bg-zinc-900 border border-white/10 rounded-sm overflow-hidden">

          <!-- Toolbar -->
          <div class="toolbar-container border-b border-white/10 bg-zinc-950/60">
            <div class="toolbar-scroll">

            <!-- Format group -->
            <div class="flex items-center gap-1 pr-2 mr-1 border-r border-white/10">
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('bold') }]" title="Bold" @click="editor?.chain().focus().toggleBold().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
              </button>
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('italic') }]" title="Italic" @click="editor?.chain().focus().toggleItalic().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
              </button>
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('strike') }]" title="Strikethrough" @click="editor?.chain().focus().toggleStrike().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 6 3.9h.9"/><path d="M21 12H3"/><path d="M7 19.1c2 .5 3.9.9 5.5.8 2.6 0 5.4-.7 5.4-3.6 0-1.7-1.1-2.8-3.5-3.5"/></svg>
              </button>
            </div>

            <!-- Heading group -->
            <div class="flex items-center gap-1 pr-2 mr-1 border-r border-white/10">
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('heading', { level: 2 }) }]" title="Heading 2" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">
                <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="M21 18H17a2 2 0 0 1 0-4c.7 0 1.3.35 1.7.88L21 18z"/><path d="M17 10h4"/></svg>
              </button>
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('heading', { level: 3 }) }]" title="Heading 3" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">
                <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="M22 10h-4c0 4 4 3 4 6h-4"/></svg>
              </button>
            </div>

            <!-- List group -->
            <div class="flex items-center gap-1 pr-2 mr-1 border-r border-white/10">
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('bulletList') }]" title="Bullet List" @click="editor?.chain().focus().toggleBulletList().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
              </button>
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('orderedList') }]" title="Numbered List" @click="editor?.chain().focus().toggleOrderedList().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" stroke-width="2"/><path d="M4 10h2" stroke="currentColor" stroke-width="2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" stroke-width="2"/></svg>
              </button>
            </div>

            <!-- Block group -->
            <div class="flex items-center gap-1 pr-2 mr-1 border-r border-white/10">
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('blockquote') }]" title="Blockquote" @click="editor?.chain().focus().toggleBlockquote().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
              </button>
              <button type="button" class="toolbar-btn" title="Divider" @click="editor?.chain().focus().setHorizontalRule().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>
              </button>
              <button type="button" :class="['toolbar-btn', { 'is-active': editor?.isActive('code') }]" title="Code" @click="editor?.chain().focus().toggleCode().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </button>
            </div>

            <!-- Undo / Redo -->
            <div class="flex items-center gap-1 pr-2 mr-1 border-r border-white/10">
              <button type="button" class="toolbar-btn" title="Undo" @click="editor?.chain().focus().undo().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
              <button type="button" class="toolbar-btn" title="Redo" @click="editor?.chain().focus().redo().run()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
              </button>
            </div>

            <!-- Image tools -->
            <div class="flex items-center gap-1 ml-auto">
              <label class="toolbar-btn cursor-pointer" title="Upload image(s)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <input type="file" accept="image/*" multiple class="hidden" @change="addImageByFile">
              </label>
              <button type="button" :class="['toolbar-btn', { 'is-active': showImageUrl }]" title="Insert image URL" @click="showImageUrl = !showImageUrl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
            </div>
            </div>
          </div>

          <!-- Image URL panel -->
          <div v-if="showImageUrl" class="flex gap-2 px-3 py-2.5 bg-zinc-950/40 border-b border-white/10">
            <input
              v-model="imageUrl"
              type="url"
              placeholder="Paste image URL…"
              class="flex-1 bg-white/5 border border-white/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-white/40 placeholder:text-zinc-500"
              @keyup.enter="addImageByUrl"
            >
            <button type="button" class="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white/10 border border-white/20 hover:bg-white/20 transition-colors text-white" @click="addImageByUrl">
              Insert
            </button>
            <button type="button" class="px-3 py-2 text-zinc-500 hover:text-white transition-colors" @click="showImageUrl = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <EditorContent :editor="editor" class="editor-shell" />
        </div>

        <!-- Resize hint -->
        <!--<p class="text-zinc-500 text-xs">
           Click any image to reveal resize handles — drag corners to scale proportionally, edges to stretch freely.
        </p>-->

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            :disabled="isSavingDraft"
            class="draft-btn"
            @click="saveDraft"
          >
            <span class="relative z-10">{{ isSavingDraft ? 'Saving…' : 'Save Draft' }}</span>
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="publish-btn group"
          >
            <span class="relative z-10">{{ isSubmitting ? 'Publishing…' : 'Publish Post' }}</span>
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
/* ── Fields ── */
.field-input {
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #f4f4f5;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  display: block;
}
.field-input::placeholder { color: rgba(255,255,255,0.3); }
.field-input:focus { border-color: rgba(255,255,255,0.35); }

/* ── Toolbar ── */
.toolbar-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.toolbar-container::-webkit-scrollbar {
  height: 4px;
}

.toolbar-container::-webkit-scrollbar-track {
  background: transparent;
}

.toolbar-container::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

.toolbar-scroll {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.625rem 0.75rem;
  min-width: min-content;
}

@media (min-width: 768px) {
  .toolbar-scroll {
    flex-wrap: wrap;
  }
}

.toolbar-scroll > div {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.5rem;
  margin-right: 0.25rem;
  border-right: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.toolbar-scroll > div:last-child {
  margin-left: auto;
  border-right: none;
  padding-right: 0;
  margin-right: 0;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 3px;
  color: rgba(255,255,255,0.55);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.toolbar-btn:hover  { color: #fff; background: rgba(255,255,255,0.1);  border-color: rgba(255,255,255,0.15); }
.toolbar-btn.is-active { color: #fff; background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25); }

/* ── Editor shell ── */
.editor-shell { min-height: 360px; background: #ffffff; }

.editor-shell :deep(.ProseMirror) {
  min-height: 320px;
  padding: 1.25rem 1.5rem;
  color: #18181b;
  font-size: 0.9375rem;
  line-height: 1.75;
  outline: none;
  caret-color: #000;
}

.editor-shell :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: 'Write your story…';
  color: rgba(0,0,0,0.3);
  pointer-events: none;
  float: left;
  height: 0;
}

.editor-shell :deep(.ProseMirror h2) { font-size:1.5rem; font-weight:800; color:#000; margin:1.5rem 0 0.5rem; letter-spacing:-0.02em; }
.editor-shell :deep(.ProseMirror h3) { font-size:1.2rem; font-weight:700; color:#18181b; margin:1.25rem 0 0.4rem; }
.editor-shell :deep(.ProseMirror p)  { margin: 0.5rem 0; }

.editor-shell :deep(.ProseMirror ul),
.editor-shell :deep(.ProseMirror ol) { 
  padding-left: 1.5rem; 
  margin: 0.75rem 0; 
  color: #27272a;
  list-style-position: outside;
}

.editor-shell :deep(.ProseMirror ul) { 
  list-style-type: disc; 
}

.editor-shell :deep(.ProseMirror ol) { 
  list-style-type: decimal; 
}

.editor-shell :deep(.ProseMirror li) { 
  margin: 0.35rem 0; 
  display: list-item;
  color: #18181b;
}

.editor-shell :deep(.ProseMirror li p) { 
  margin: 0; 
}

.editor-shell :deep(.ProseMirror blockquote) { 
  border-left: 4px solid #27272a; 
  margin: 1rem 0; 
  padding: 0.75rem 1.25rem; 
  background: rgba(0,0,0,0.04);
  color: #3f3f46; 
  font-style: italic; 
  border-radius: 0 3px 3px 0;
}
.editor-shell :deep(.ProseMirror code) { background:rgba(0,0,0,0.08); padding:0.15em 0.4em; border-radius:3px; font-size:0.85em; color:#0891b2; }
.editor-shell :deep(.ProseMirror hr)  { border:none; border-top:1px solid rgba(0,0,0,0.15); margin:1.5rem 0; }
.editor-shell :deep(.ProseMirror strong) { color:#000; font-weight:700; }
.editor-shell :deep(.ProseMirror em)     { color:#3f3f46; }

/* Text selection */
.editor-shell :deep(.ProseMirror ::selection) {
  background: rgba(0,0,0,0.15);
  color: inherit;
}

.editor-shell :deep(.ProseMirror ::-moz-selection) {
  background: rgba(0,0,0,0.15);
  color: inherit;
}

/* ── Resizable image wrapper ── */
.editor-shell :deep(.img-resize-wrapper) {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin: 4px 2px;
  line-height: 0;
  user-select: none;
}

.editor-shell :deep(.img-resize-wrapper img) {
  display: block;
  max-width: 100%;
  border: 1.5px solid rgba(0,0,0,0.15);
  border-radius: 2px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.editor-shell :deep(.img-resize-wrapper:hover img) {
  border-color: rgba(0,0,0,0.3);
}

.editor-shell :deep(.img-resize-wrapper.selected img) {
  border-color: rgba(0,0,0,0.6);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
}

/* ── Resize handles (8 directions) ── */
.editor-shell :deep(.resize-handle) {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1.5px solid rgba(0,0,0,0.45);
  border-radius: 2px;
  z-index: 20;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;
}

.editor-shell :deep(.img-resize-wrapper.selected .resize-handle) {
  opacity: 1;
  pointer-events: all;
}

/* Corners */
.editor-shell :deep(.resize-handle--nw) { top: -5px;    left: -5px; }
.editor-shell :deep(.resize-handle--ne) { top: -5px;    right: -5px; }
.editor-shell :deep(.resize-handle--sw) { bottom: -5px; left: -5px; }
.editor-shell :deep(.resize-handle--se) { bottom: -5px; right: -5px; }

/* Edges */
.editor-shell :deep(.resize-handle--n) { top: -5px;    left: 50%; transform: translateX(-50%); }
.editor-shell :deep(.resize-handle--s) { bottom: -5px; left: 50%; transform: translateX(-50%); }
.editor-shell :deep(.resize-handle--w) { left: -5px;   top: 50%;  transform: translateY(-50%); }
.editor-shell :deep(.resize-handle--e) { right: -5px;  top: 50%;  transform: translateY(-50%); }

/* ── Size tooltip ── */
.editor-shell :deep(.resize-tooltip) {
  position: absolute;
  bottom: calc(100% + 7px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.82);
  color: #fff;
  font-size: 10px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  padding: 2px 7px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.1s;
  z-index: 30;
}

.editor-shell :deep(.img-resize-wrapper.selected .resize-tooltip) {
  opacity: 1;
}

/* ── Publish button ── */
.publish-btn {
  position: relative;
  padding: 1rem 2.5rem;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  background: transparent;
  border: 2px solid rgba(255,255,255,0.25);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.publish-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #fff;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.publish-btn:hover {
  border-color: rgba(255,255,255,0.9);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
}

.publish-btn:hover::before {
  left: 0;
}

.publish-btn:hover span {
  color: #18181b;
}

.publish-btn:active {
  transform: scale(0.98);
}

.publish-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Draft button ── */
.draft-btn {
  position: relative;
  padding: 1rem 2rem;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  background: transparent;
  border: 2px solid rgba(255,255,255,0.3);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.draft-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.1);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.draft-btn:hover {
  border-color: rgba(255,255,255,0.6);
  color: #fff;
}

.draft-btn:hover::before {
  left: 0;
}

.draft-btn:active {
  transform: scale(0.98);
}

.draft-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
</style>