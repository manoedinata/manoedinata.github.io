<script setup lang="ts">
defineProps({
  links: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section id="hero" class="hero section dark-background">
    <img src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" />

    <div class="container" data-aos="zoom-out" data-aos-delay="100">
      <h2>
        <span
          class="typed"
          data-typed-items="Hendra Manudinata, Hendra, <i>manoedinata.</i>"
          >Hendra Manudinata</span
        >
        <span class="typed-cursor typed-cursor--blink"></span>
      </h2>
      <p>Student by day, <span>ambitious developer by night.</span></p>
      <div class="social-links">
        <a
          :href="link.url"
          target="_blank"
          v-for="link in links"
          :key="link.url"
        >
          <i :class="link.icon" />
        </a>
      </div>
    </div>
  </section>
</template>
