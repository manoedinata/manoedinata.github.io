<script setup>
import { ref } from 'vue'
import MazeChase from './components/MazeChase.vue'
import BracketLink from './components/BracketLink.vue'
import Icon from './components/Icon.vue'
import RotatingName from './components/RotatingName.vue'
import { HUES, profile, features, contacts, projects, footerLinks } from './data.js'

const sayHi = ref(null)
const contactGrid = ref(null)
let cancelScroll

// "Work with me?" → critically-damped spring scroll to the contact tiles,
// then replay their corner brackets (DESIGN.md §6).
function onFeatureClick(e, feature) {
  if (feature.href !== '#say-hi') return
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const label = sayHi.value
  const grid = contactGrid.value
  if (!label || !grid) return
  e.preventDefault()
  cancelScroll?.()
  if (location.hash !== '#say-hi') history.pushState(null, '', '#say-hi')

  const top = Math.min(label.getBoundingClientRect().top, grid.getBoundingClientRect().top)
  const bottom = grid.getBoundingClientRect().bottom
  const from = scrollY
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight)
  const to = Math.max(0, Math.min(maxScroll, from + (top + bottom - innerHeight) / 2))
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const t0 = performance.now()
  const abort = new AbortController()
  let frame

  const cancel = () => {
    cancelAnimationFrame(frame)
    abort.abort()
    cancelScroll = undefined
  }
  cancelScroll = cancel
  for (const ev of ['wheel', 'touchstart', 'pointerdown', 'keydown', 'popstate', 'resize'])
    window.addEventListener(ev, cancel, { passive: true, signal: abort.signal })

  const finish = () => {
    cancel()
    window.scrollTo({ top: to, behavior: 'instant' })
    label.focus({ preventScroll: true })
    const links = grid.querySelectorAll('a')
    links.forEach((a) => a.setAttribute('data-restart-brackets', ''))
    grid.getBoundingClientRect() // force reflow so the animation restarts
    links.forEach((a) => a.removeAttribute('data-restart-brackets'))
  }

  if (reduced) return finish()

  const omega = Math.sqrt(180)
  const step = (now) => {
    const t = (now - t0) / 1000
    const k = (1 + omega * t) * Math.exp(-omega * t)
    window.scrollTo({ top: to + (from - to) * k, behavior: 'instant' })
    if (t < 1) frame = requestAnimationFrame(step)
    else finish()
  }
  frame = requestAnimationFrame(step)
}

const label =
  'sticky top-6 mb-20 max-h-20 inline text-2xl sm:text-3xl tracking-tight font-semibold font-heading text-neutral-950 dark:text-neutral-50'
const cardTitle = 'text-2xl tracking-tight font-semibold text-neutral-950 dark:text-neutral-50 flex items-center gap-2'
const column = 'flex flex-col gap-4 mb-8 sm:mb-20 print:mb-6'
</script>

<template>
  <main class="flex flex-row justify-center">
    <div class="absolute top-0 right-0 py-2 px-3 animate-gol print:hidden">
      <a
        href="https://en.wikipedia.org/wiki/Maze_game"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-400 transition-colors"
      >what's this?</a>
    </div>

    <MazeChase />

    <div class="flex flex-col gap-16 sm:gap-24 print:gap-8 px-4 py-8 w-full max-w-screen-xl sm:px-16 sm:py-20 print:p-0">
      <!-- Intro -->
      <header class="flex flex-col gap-4">
        <h1 class="text-6xl sm:text-7xl print:text-6xl tracking-tighter font-bold font-heading text-neutral-950 dark:text-neutral-50">
          <RotatingName :names="profile.names" :interval="profile.name_interval" />
        </h1>
        <p v-for="line in profile.lines" :key="line">{{ line }}</p>
      </header>

      <div class="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-[2fr_3fr] print:grid-cols-1">
        <!-- What I do -->
        <div class="scroll-mt-6"><h2 :class="label">What I do</h2></div>
        <div :class="column">
          <BracketLink
            v-for="f in features"
            :key="f.title"
            :id="f.id"
            :href="f.href"
            :light="HUES[f.hue].light"
            :dark="HUES[f.hue].dark"
            @click="onFeatureClick($event, f)"
          >
            <div class="flex flex-col p-4 gap-1" :class="HUES[f.hue].strong">
              <h3 :class="cardTitle">
                <span class="text-[28px] leading-none" aria-hidden="true">{{ f.emoji }}</span>
                <span>{{ f.title }}<span v-if="f.role" class="opacity-70"> · {{ f.role }}</span></span>
              </h3>
              <p>{{ f.description }}</p>
            </div>
          </BracketLink>
        </div>

        <!-- Say hi -->
        <div id="say-hi" ref="sayHi" tabindex="-1" class="scroll-mt-6 focus:outline-none">
          <h2 :class="label">Say hi!</h2>
        </div>
        <div :class="column">
          <div
            ref="contactGrid"
            class="grid gap-2 sm:gap-4 grid-flow-col-dense auto-cols-fr auto-rows-fr print:grid-cols-2 print:grid-flow-row"
          >
            <BracketLink v-for="c in contacts" :key="c.label" :href="c.href" :light="HUES[c.hue].light" :dark="HUES[c.hue].dark">
              <div
                class="flex flex-col print:flex-row aspect-square print:aspect-auto p-2 print:p-3 gap-1 md:gap-2 justify-center items-center print:justify-start leading-tight"
                :class="HUES[c.hue].strong"
              >
                <Icon :name="c.icon" :class="HUES[c.hue].icon" />
                <div class="flex flex-col print:ms-3">
                  <span class="text-center print:font-semibold">{{ c.label }}</span>
                  <span v-if="c.handle" class="hidden print:block opacity-90 text-center">{{ c.handle }}</span>
                </div>
              </div>
            </BracketLink>
          </div>
        </div>

        <!-- Other doings -->
        <div class="scroll-mt-6"><h2 :class="label">Other doings</h2></div>
        <div :class="column">
          <section
            v-for="g in projects"
            :key="g.title"
            class="flex flex-col p-4 gap-3 print:break-inside-avoid"
            :class="HUES[g.hue].soft"
          >
            <h3 :class="cardTitle">
              <span class="text-[28px] leading-none" aria-hidden="true">{{ g.emoji }}</span>
              <span>{{ g.title }}</span>
            </h3>
            <BracketLink
              v-for="item in g.items"
              :key="item.title"
              :href="item.href"
              :light="HUES[g.hue].light"
              :dark="HUES[g.hue].dark"
              class="flex flex-col print:break-inside-avoid"
            >
              <div class="flex flex-row justify-between items-start gap-4">
                <h4 class="text-lg leading-snug font-medium">{{ item.title }}</h4>
                <span class="opacity-60 tabular-nums">{{ item.year }}</span>
              </div>
              <span class="opacity-90">{{ item.description }}</span>
            </BracketLink>
          </section>
        </div>
      </div>

      <!-- Footer -->
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
        <span class="text-sm text-neutral-500 dark:text-neutral-400">
          <template v-for="(l, i) in footerLinks" :key="l.label">
            <span v-if="i"> · </span><BracketLink :href="l.href">{{ l.label }}</BracketLink>
          </template>
        </span>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">© {{ profile.year }} {{ profile.name }}</p>
      </footer>
    </div>
  </main>
</template>
