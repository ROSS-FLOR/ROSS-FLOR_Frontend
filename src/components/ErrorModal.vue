<script setup>
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

defineProps({
  show: Boolean,
  message: {
    type: String,
    default: 'Ha ocurrido un error.'
  },
  title: {
    type: String,
    default: 'Atención'
  }
});

defineEmits(['close']);
</script>

<template>
  <BaseModal :show="show" :title="title" @close="$emit('close')">
    <div class="error-content">
      <div class="icon-container">
        <i class="fas fa-exclamation-circle error-icon"></i>
      </div>
      <p class="error-message">{{ message }}</p>
      
      <div class="actions">
        <BaseButton variant="primary" @click="$emit('close')">Entendido</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  text-align: center;
}

.icon-container {
  font-size: 3rem;
  color: var(--color-danger, #ef4444);
}

.error-message {
  font-size: 1.1rem;
  color: var(--color-text);
  line-height: 1.5;
}

.actions {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
