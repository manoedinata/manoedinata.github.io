<script setup>
// Single post: title block, sticky meta + contents on the left, prose on the right,
// footer band with older / newer posts (DESIGN.md §5.6).
import { ref, computed, watchEffect } from 'vue'
import BracketLink from '../components/BracketLink.vue'
import NotFound from './NotFound.vue'
import { HUES, site } from '../data.js'
import { posts, findPost, loadPost, formatDate } from '../posts.js'
import { indexGrid, muted } from '../ui.js'

const props = defineProps({ slug: { type: String, required: true } })

const meta = computed(() => findPost(props.slug))
const hue = computed(() => HUES[meta.value?.hue] ?? HUES.blue)
const body = ref(null)

// posts is newest first: the next index is the older post.
const index = computed(() => posts.findIndex((p) => p.slug === props.slug))
const older = computed(() => posts[index.value + 1])
const newer = computed(() => (index.value > 0 ? posts[index.value - 1] : undefined))

watchEffect(async () => {
  const slug = props.slug
  if (!meta.value) return
  document.title = `${meta.value.title} · ${site.title}`
  const loaded = await loadPost(slug)
  if (slug === props.slug) body.value = loaded
})

const band = 'inline-flex items-center gap-1 p-[3px] max-w-[40%] text-fuchsia-700 dark:text-fuchsia-300'
</script>

<template>
  <NotFound v-if="!meta" />

  <template v-else>
    <header class="flex flex-col gap-4">
      <span class="text-5xl leading-none" aria-hidden="true">{{ meta.emoji }}</span>
      <h1
        class="text-5xl sm:text-6xl print:text-5xl tracking-tighter font-bold font-heading text-neutral-950 dark:text-neutral-50 text-balance"
      >
        {{ meta.title }}
      </h1>
      <p v-if="meta.description" class="text-lg opacity-90 max-w-2xl">{{ meta.description }}</p>
    </header>

    <div :class="indexGrid">
      <!-- Left: meta + contents. Sticky on wide screens, stacked above the post on phones. -->
      <aside class="print:mb-4">
        <div class="sm:sticky sm:top-6 flex flex-col gap-4">
          <dl class="flex flex-col gap-1">
            <div class="flex gap-2">
              <dt class="sr-only">Published</dt>
              <dd><time :datetime="meta.date" class="tabular-nums font-medium">{{ formatDate(meta.date) }}</time></dd>
              <dd class="opacity-60">· {{ meta.minutes }} min read</dd>
              <dd v-if="meta.draft" class="opacity-60">· draft</dd>
            </div>
            <div v-if="meta.tags.length" class="flex flex-wrap gap-2 pt-1">
              <dt class="sr-only">Tags</dt>
              <dd v-for="t in meta.tags" :key="t" class="text-sm px-2 py-0.5" :class="hue.strong">{{ t }}</dd>
            </div>
          </dl>

          <nav v-if="body?.headings.length" aria-label="Contents" class="hidden sm:flex flex-col gap-2 p-4 print:hidden" :class="hue.soft">
            <p class="text-sm font-semibold opacity-70">On this page</p>
            <BracketLink
              v-for="h in body.headings"
              :key="h.id"
              :href="`#${h.id}`"
              :light="hue.light"
              :dark="hue.dark"
              class="self-start leading-snug"
              :class="h.depth === 3 ? 'ms-4 text-sm opacity-80' : ''"
            >
              {{ h.text }}
            </BracketLink>
          </nav>
        </div>
      </aside>

      <!-- Right: the post -->
      <article
        class="prose mb-8 sm:mb-20 print:mb-6 min-w-0"
        :style="{ '--accent-light': hue.light, '--accent-dark': hue.dark }"
      >
        <div v-if="body" v-html="body.html" />
        <p v-else :class="muted">Loading…</p>
      </article>
    </div>

    <!-- Older / newer -->
    <nav
      aria-label="More writings"
      class="flex self-center items-center justify-between gap-2 h-24 max-w-2xl w-full bg-zinc-100 dark:bg-zinc-800 -mb-10 sm:-mb-18 px-3 sm:px-5 print:hidden"
    >
      <BracketLink v-if="older" :href="`/writings/${older.slug}/`" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" :class="band">
        <span aria-hidden="true">‹</span><span class="truncate"><span class="sr-only">Older: </span>{{ older.title }}</span>
      </BracketLink>
      <span v-else class="max-w-[40%]" />
      <div class="flex-1 text-center">
        <BracketLink href="/writings/" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" class="p-[3px] text-fuchsia-700 dark:text-fuchsia-300">
          all writings
        </BracketLink>
      </div>
      <BracketLink v-if="newer" :href="`/writings/${newer.slug}/`" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" :class="band">
        <span class="truncate"><span class="sr-only">Newer: </span>{{ newer.title }}</span><span aria-hidden="true">›</span>
      </BracketLink>
      <span v-else class="max-w-[40%]" />
    </nav>
  </template>
</template>
