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
  max-width: 1400px; /* Ancho equilibrado */
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
}
/* Escalado para Pantallas Ultra-Grandes */
@media (min-width: 2000px) and (min-height: 1600px) {
  :global(#app) {
    zoom: 1.5;
  }
  .main-content { max-width: 95vw; } /* Usar ancho completo */
}

/* Escalado para Resolución 3K */
@media (min-width: 3000px) and (min-height: 2000px) {
  :global(#app) {
    zoom: 2.0; /* Doble tamaño */
  }
}

/* Escalado para Resolución 4K+ */
@media (min-width: 4000px) and (min-height: 2500px) {
  :global(#app) {
    zoom: 2.5; /* Tamaño 2.5x */
  }
}
</style>
