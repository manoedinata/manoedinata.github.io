<script setup lang="ts">
import PageTitle from "../components/PageTitle.vue";
import Layout from "./Layout.vue";

defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <Layout>
    <PageTitle
      :title="frontmatter.title"
      :description="frontmatter.description"
      :image="frontmatter.image"
    />

    <section id="posts" class="section">
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row gy-4 justify-content-center">
          <div class="col-lg-8 content">
            <slot />
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>
