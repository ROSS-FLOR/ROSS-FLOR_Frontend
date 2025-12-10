<script setup>
import BaseButton from '@/components/BaseButton.vue';
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  total: Number
});

const emit = defineEmits(['close', 'confirm']);

const selectedMethod = ref('EFECTIVO');

const methods = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape / Plin' }
  // { value: 'TARJETA', label: 'Tarjeta' } // Temporarily removed
];

const confirm = () => {
    emit('confirm', selectedMethod.value);
};
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Confirmar Pago</h2>
      
      <div class="summary">
          <p>Total a Pagar:</p>
          <div class="total-amount">S/. {{ total.toFixed(2) }}</div>
      </div>

      <div class="form-group">
          <label>Modo de Pago:</label>
          <div class="payment-methods">
              <label 
                v-for="method in methods" 
                :key="method.value" 
                class="method-card"
                :class="{ active: selectedMethod === method.value }"
            >
                  <input type="radio" v-model="selectedMethod" :value="method.value" style="display:none">
                  {{ method.label }}
              </label>
          </div>
      </div>

      <div class="actions">
        <BaseButton variant="secondary" @click="$emit('close')">Cancelar</BaseButton>
        <BaseButton variant="success" @click="confirm">Confirmar Boleta</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--color-primary);
}

.summary {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
}

.total-amount {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text);
}

.payment-methods {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.method-card {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    font-weight: 500;
}

.method-card:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-hover);
}

.method-card.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
