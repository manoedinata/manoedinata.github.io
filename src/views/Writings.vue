<script setup>
// Writings index: sticky year labels on the left, one tinted card per post on the right.
import BracketLink from '../components/BracketLink.vue'
import Emoji from '../components/Emoji.vue'
import { HUES } from '../data.js'
import { posts, byYear, formatDate } from '../posts.js'
import { pageTitle, label, cardTitle, column, indexGrid } from '../ui.js'

const years = byYear(posts)
</script>

<template>
  <header class="flex flex-col gap-4">
    <h1 :class="pageTitle">Writings.</h1>
    <p>Notes from taking things apart, and occasionally putting them back together.</p>
  </header>

  <div :class="indexGrid">
    <template v-for="[year, list] in years" :key="year">
      <div class="scroll-mt-6"><h2 :class="[label, 'tabular-nums']">{{ year }}</h2></div>
      <div :class="column">
        <BracketLink
          v-for="p in list"
          :key="p.slug"
          :href="`/writings/${p.slug}/`"
          :light="HUES[p.hue].light"
          :dark="HUES[p.hue].dark"
        >
          <article class="flex flex-col p-4 gap-1 print:break-inside-avoid" :class="HUES[p.hue].strong">
            <div class="flex flex-row justify-between items-start gap-4">
              <h3 :class="cardTitle">
                <Emoji :name="p.icon" />
                <span>{{ p.title }}<span v-if="p.draft" class="opacity-60"> · draft</span></span>
              </h3>
              <time :datetime="p.date" class="opacity-60 tabular-nums whitespace-nowrap pt-1">{{ formatDate(p.date) }}</time>
            </div>
            <p v-if="p.description">{{ p.description }}</p>
            <p class="text-sm opacity-60">
              {{ p.minutes }} min read<template v-if="p.tags.length"> · {{ p.tags.join(', ') }}</template>
            </p>
          </article>
        </BracketLink>
      </div>
    </template>

    <template v-if="!years.length">
      <div><h2 :class="label">Soon</h2></div>
      <div :class="column">
        <div class="flex flex-col p-4 gap-1" :class="HUES.blue.soft">
          <h3 :class="cardTitle">
            <Emoji name="jar" />
            <span>Nothing here yet</span>
          </h3>
          <p class="opacity-90">The first post is still in the oven.</p>
        </div>
      </div>
    </template>
  </div>
</template>
