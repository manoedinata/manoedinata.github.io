<script setup>
// Page shell shared by every route: maze background, corner links, footer (DESIGN.md §2).
// The maze lives here so it keeps running across navigation.
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import MazeChase from './components/MazeChase.vue'
import BracketLink from './components/BracketLink.vue'
import { profile, footerLinks } from './data.js'
import { muted } from './ui.js'

const route = useRoute()
const back = computed(() => {
  if (route.name === 'post') return { href: '/writings/', label: 'writings' }
  if (route.name && route.name !== 'home') return { href: '/', label: 'home' }
  return null
})

// Maze mode: "v" hides the whole UI and shows the maze at full opacity; "v" or Esc brings it back.
// Not on writings pages: reading comes first there.
const mazeAllowed = computed(() => route.name !== 'writings' && route.name !== 'post')
const mazeOnly = ref(false)
const playing = ref(false) // a player is steering the chomper (MazeChase @playing)
watch(mazeAllowed, (ok) => ok || (mazeOnly.value = false))
// Lock page scroll while the UI is hidden.
watch(mazeOnly, (on) => (document.documentElement.style.overflow = on ? 'hidden' : ''))
const toggleMaze = () => (mazeOnly.value = !mazeOnly.value)
function onKey(e) {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
  if ((e.key === 'v' || e.key === 'V') && mazeAllowed.value) toggleMaze()
  else if (e.key === 'Escape' && mazeOnly.value) mazeOnly.value = false
}
onMounted(() => addEventListener('keydown', onKey))
onBeforeUnmount(() => removeEventListener('keydown', onKey))

const corner = 'text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-400 transition-colors'
</script>

<template>
  <main class="flex flex-row justify-center">
    <MazeChase :spotlight="route.name !== 'post' && !mazeOnly" :full="mazeOnly" @playing="playing = $event" />

    <!-- Maze mode controls hint -->
    <Transition
      enter-active-class="transition-opacity duration-500 delay-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <p v-if="mazeOnly" class="fixed bottom-3 inset-x-0 px-4 text-center select-none">
        <span class="inline-block px-3 py-1.5 text-sm bg-[#fefefe] dark:bg-[#151515] text-neutral-600 dark:text-neutral-300">
          <template v-if="playing"><kbd class="font-sans font-semibold">space</kbd> for autoplay ·</template>
          <template v-else><kbd class="font-sans font-semibold">arrow keys</kbd> or <kbd class="font-sans font-semibold">WASD</kbd> to play ·</template>
          <kbd class="font-sans font-semibold">v</kbd> or <kbd class="font-sans font-semibold">esc</kbd> to exit
        </span>
      </p>
    </Transition>

    <!-- Everything but the maze; faded out and inert in maze mode. -->
    <div
      class="w-full flex flex-row justify-center transition-opacity duration-500"
      :class="mazeOnly ? 'opacity-0 pointer-events-none' : ''"
      :inert="mazeOnly"
    >
      <div v-if="back" class="absolute top-0 left-0 py-2 px-3 print:hidden">
        <RouterLink :to="back.href" :class="corner">
          ‹ {{ back.label }}
        </RouterLink>
      </div>
      <div class="absolute top-0 right-0 py-2 px-3 animate-gol print:hidden">
        <!-- Keyboard hint: only where there's a mouse/trackpad (and so, most likely, a keyboard). -->
        <span v-if="mazeAllowed" class="hidden [@media(hover:hover)_and_(pointer:fine)]:inline text-sm text-neutral-500">
          <button type="button" :class="[corner, 'cursor-pointer']" @click="toggleMaze">
            press <kbd class="font-sans font-semibold">v</kbd> to watch the maze
          </button>
          ·
        </span>
        <a
          href="https://en.wikipedia.org/wiki/Maze_game"
          target="_blank"
          rel="noopener noreferrer"
          :class="corner"
        >what's this?</a>
      </div>

      <div
        class="flex flex-col gap-16 sm:gap-24 print:gap-8 px-4 py-8 w-full max-w-screen-xl sm:px-16 sm:py-20 print:p-0"
        :class="{ 'pt-14': back }"
      >
        <RouterView v-slot="{ Component, route: r }">
          <component :is="Component" :key="r.path" />
        </RouterView>

        <footer class="flex self-center items-center flex-col gap-2 w-full print:hidden">
          <!-- <nav
            aria-label="Footer"
            class="flex items-center justify-between gap-2 h-24 max-w-2xl w-full bg-zinc-100 dark:bg-zinc-800 mb-6 px-3 sm:px-5"
          >
            <BracketLink href="#" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" class="inline-flex items-center gap-1 p-[3px] text-fuchsia-700 dark:text-fuchsia-300">
              <span aria-hidden="true">‹</span><span class="hidden sm:inline">prev</span>
            </BracketLink>
            <div class="flex-1 text-center">
              <p class="mb-2.5">ndraa @ somewhere on the web</p>
              <div class="flex justify-center gap-3.5">
                <BracketLink href="#" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" class="p-[3px] text-fuchsia-700 dark:text-fuchsia-300">list</BracketLink>
                <BracketLink href="#" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" class="p-[3px] text-fuchsia-700 dark:text-fuchsia-300">rand</BracketLink>
              </div>
            </div>
            <BracketLink href="#" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" class="inline-flex items-center gap-1 p-[3px] text-fuchsia-700 dark:text-fuchsia-300">
              <span class="hidden sm:inline">next</span><span aria-hidden="true">›</span>
            </BracketLink>
          </nav> -->
          <span :class="muted">
            <template v-for="(l, i) in footerLinks" :key="l.label">
              <span v-if="i"> · </span><BracketLink :href="l.href">{{ l.label }}</BracketLink>
            </template>
          </span>
          <p :class="muted">© {{ profile.year }} {{ profile.name }}</p>
        </footer>
      </div>
    </div>
  </main>
</template>
