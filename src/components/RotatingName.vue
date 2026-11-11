<script setup>
// Cycles through names with a fast swipe-up: old name exits upward, new one enters from below.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  names: { type: Array, required: true },
  interval: { type: Number, default: 2500 }, // ms each name stays on screen
})

const index = ref(0)
const current = computed(() => props.names[index.value % props.names.length])
let timer = 0

function tick() {
  index.value = (index.value + 1) % props.names.length
}
function start() {
  if (!timer && props.names.length > 1) timer = setInterval(tick, props.interval)
}
function stop() {
  clearInterval(timer)
  timer = 0
}
const onVisibility = () => (document.visibilityState === 'visible' ? start() : stop())

onMounted(() => {
  start()
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  stop()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <!-- Screen readers get every name once; the animation is visual only. -->
  <span class="sr-only">{{ names.join(', ') }}</span>
  <!-- One grid cell holds every name invisibly (reserves the widest width) plus the visible one,
       so the layout never jumps. Padding + negative margin keep descenders inside the clip. -->
  <span aria-hidden="true" class="inline-grid overflow-hidden align-bottom pb-[0.15em] -mb-[0.15em] print:hidden">
    <span v-for="n in names" :key="'size-' + n" class="invisible col-start-1 row-start-1 whitespace-nowrap">{{ n }}</span>
    <Transition name="swipe">
      <span :key="current" class="col-start-1 row-start-1 whitespace-nowrap">{{ current }}</span>
    </Transition>
  </span>
  <span aria-hidden="true" class="hidden print:inline">{{ names[0] }}</span>
</template>

<style scoped>
.swipe-enter-active,
.swipe-leave-active {
  transition:
    transform 0.32s cubic-bezier(0.7, 0, 0.2, 1),
    opacity 0.32s ease-out;
}
.swipe-enter-from {
  transform: translateY(120%); /* past the descender padding so it doesn't peek in early */
  opacity: 0;
}
.swipe-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .swipe-enter-active,
  .swipe-leave-active {
    transition: opacity 0.2s;
  }
  .swipe-enter-from,
  .swipe-leave-to {
    transform: none;
  }
}
</style>
