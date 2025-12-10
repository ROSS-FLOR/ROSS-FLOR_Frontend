<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main class="main-content">
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1024px; /* More confined width for better reading */
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
}
</style>
