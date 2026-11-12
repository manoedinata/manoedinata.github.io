<script setup>
import BracketLink from '../components/BracketLink.vue'
import { HUES } from '../data.js'
import { pageTitle } from '../ui.js'
</script>

<template>
  <header class="flex flex-col gap-4 min-h-[50vh]">
    <h1 :class="pageTitle">404.</h1>
    <p>Nothing here. The chomper probably ate it.</p>
    <BracketLink href="/" :light="HUES.fuchsia.light" :dark="HUES.fuchsia.dark" class="self-start p-[3px] text-fuchsia-700 dark:text-fuchsia-300">
      ‹ back home
    </BracketLink>
  </header>
</template>
