<script setup>
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Confirmar Acción'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  variant: {
    type: String,
    default: 'primary' // primary, danger, success
  }
});

const emit = defineEmits(['close', 'confirm']);

const onConfirm = () => {
    emit('confirm');
    emit('close');
};
</script>

<template>
  <BaseModal :show="show" :title="title" @close="$emit('close')">
    <div class="confirm-content">
      <p class="message">{{ message }}</p>
      
      <div class="actions">
        <BaseButton variant="secondary" @click="$emit('close')">{{ cancelText }}</BaseButton>
        <BaseButton :variant="variant" @click="onConfirm">{{ confirmText }}</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message {
  color: var(--color-text);
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
