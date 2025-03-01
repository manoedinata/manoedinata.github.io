<script setup lang="ts">
defineProps({
  interests: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <!-- Interests Section -->
  <section id="interests" class="interests section">
    <!-- Section Title -->
    <div class="container section-title" data-aos="fade-up">
      <h2>Interests</h2>
      <div>
        <span>I'm</span>
        <span class="description-title">interested in</span>
      </div>
    </div>
    <!-- End Section Title -->

    <div class="container">
      <div class="row gy-4">
        <div
          class="col-lg-3 col-md-4"
          data-aos="fade-up"
          v-for="(interest, index) in interests"
          :data-aos-delay="100 * index"
        >
          <div class="features-item">
            <i :class="interest.icon" style="color: #ffbb2c" />
            <h3>
              <a href="" class="stretched-link">{{ interest.name }} </a>
            </h3>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- /Interests Section -->
</template>
