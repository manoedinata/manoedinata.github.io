<script setup>
// Colour icon from src/emoji.js. Decorative: the title next to it carries the meaning.
import { EMOJI } from '../emoji.js'

defineProps({ name: { type: String, required: true }, size: { type: Number, default: 28 } })
</script>

<template>
  <img :src="EMOJI[name]" :width="size" :height="size" alt="" aria-hidden="true" class="shrink-0" draggable="false" />
</template>
