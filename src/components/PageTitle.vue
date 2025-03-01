<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  center: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <!-- Page Title -->
  <div class="page-title" data-aos="fade">
    <div class="heading">
      <div class="container">
        <div
          class="col-12 justify-content-center text-center mb-5"
          v-if="image"
        >
          <img :src="image" class="img-fluid" alt="" style="width: 60rem" />
        </div>

        <div
          :class="[
            'row',
            'd-flex',
            'justify-content-center',
            center ? 'text-center' : '',
          ]"
        >
          <div class="col-lg-8">
            <h1>{{ title }}</h1>
            <p class="mb-0">{{ description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Page Title -->
</template>
