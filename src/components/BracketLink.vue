<script setup>
// Link with animated L-shaped corner brackets (DESIGN.md §5.1).
// `light` / `dark` set the bracket colour; usually the 700 / 300 shade of the card's hue.
const props = defineProps({
  href: { type: String, required: true },
  light: { type: String, default: '#404040' },
  dark: { type: String, default: '#d4d4d4' },
})

const external = /^https?:\/\//.test(props.href)
</script>

<template>
  <a
    :href="href"
    class="bracket-link"
    :style="{ '--link-border-color-light': light, '--link-border-color-dark': dark }"
    v-bind="external ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
  >
    <slot />
  </a>
</template>

<style scoped>
.bracket-link {
  position: relative;
}

.bracket-link::before,
.bracket-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  opacity: 1;
  background-color: var(--link-border-color-light);
  transition: width 0.2s ease-out, height 0.2s ease-out;
  z-index: 1;
  animation: on-link-load 1.2s ease-out;
}

@media (prefers-color-scheme: dark) {
  .bracket-link::before,
  .bracket-link::after {
    background-color: var(--link-border-color-dark);
  }
}

/* top-left L */
.bracket-link::before {
  left: -2px;
  top: -2px;
  clip-path: polygon(0 0, 100% 0, 100% 2px, 2px 2px, 2px 100%, 0 100%);
}

/* bottom-right L */
.bracket-link::after {
  bottom: -2px;
  right: -2px;
  clip-path: polygon(0 100%, 100% 100%, 100% 0, calc(100% - 2px) 0, calc(100% - 2px) calc(100% - 2px), 0 calc(100% - 2px));
}

.bracket-link:hover::before,
.bracket-link:hover::after {
  width: calc(min(40%, 200px) + 4px);
  height: calc(min(40%, 200px) + 4px);
}

.bracket-link:focus-visible {
  outline: none;
}

.bracket-link:focus-visible::before,
.bracket-link:focus-visible::after {
  width: calc(min(40%, 200px) + 4px) !important;
  height: calc(min(40%, 200px) + 4px) !important;
  opacity: 1 !important;
}

/* Toggled briefly by JS to replay the load animation */
.bracket-link[data-restart-brackets]::before,
.bracket-link[data-restart-brackets]::after {
  animation: none;
}

@media print {
  .bracket-link::before,
  .bracket-link::after {
    display: none;
  }
}

@keyframes on-link-load {
  0% { width: 0; height: 0; opacity: 0; }
  35%, 36% { width: calc(min(40%, 200px) + 4px); height: calc(min(40%, 200px) + 4px); opacity: 1; }
  100% { width: calc(min(40%, 200px) + 4px); height: calc(min(40%, 200px) + 4px); opacity: 0; }
}
</style>
