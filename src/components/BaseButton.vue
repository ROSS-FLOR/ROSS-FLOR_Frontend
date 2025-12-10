<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button :class="['btn', `btn-${variant}`]" :type="type" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-text, #ffffff);
}
.btn-primary:not(:disabled):hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.btn-secondary:not(:disabled):hover {
  background-color: var(--color-surface-hover);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}
.btn-danger:not(:disabled):hover {
  filter: brightness(1.1);
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}
</style>
