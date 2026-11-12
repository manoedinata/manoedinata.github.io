<script setup>
// Page shell shared by every route: maze background, corner links, footer (DESIGN.md §2).
// The maze lives here so it keeps running across navigation.
import { computed } from 'vue'
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
</script>

<template>
  <main class="flex flex-row justify-center">
    <div v-if="back" class="absolute top-0 left-0 py-2 px-3 print:hidden">
      <RouterLink :to="back.href" class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-400 transition-colors">
        ‹ {{ back.label }}
      </RouterLink>
    </div>
    <div class="absolute top-0 right-0 py-2 px-3 animate-gol print:hidden">
      <a
        href="https://en.wikipedia.org/wiki/Maze_game"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-400 transition-colors"
      >what's this?</a>
    </div>

    <MazeChase :spotlight="route.name !== 'post'" />

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
  </main>
</template>
