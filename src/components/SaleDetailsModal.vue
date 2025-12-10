<script setup>
import { ref, watch, computed } from 'vue';
import { useSalesStore } from '@/stores/sales';
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps({
  show: Boolean,
  saleId: Number
});

const emit = defineEmits(['close']);
const salesStore = useSalesStore();
const details = ref([]);
const loading = ref(false);

watch(() => props.show, async (newVal) => {
    if (newVal && props.saleId) {
        loading.value = true;
        details.value = [];
        try {
            details.value = await salesStore.fetchSaleDetails(props.saleId);
        } catch (error) {
            console.error(error);
            alert('Error al cargar detalles');
        } finally {
            loading.value = false;
        }
    }
});

const totalSum = computed(() => {
    return details.value.reduce((acc, item) => acc + (item.subtotal || 0), 0);
});
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
          <h2>Detalles de Venta #{{ saleId }}</h2>
          <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
          <div v-if="loading" class="text-center">Cargando detalles...</div>
          <table v-else class="details-table">
              <thead>
                  <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>P. Unit</th>
                      <th>Subtotal</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="item in details" :key="item.id">
                      <td>{{ item.producto?.nombre || 'Producto eliminado' }}</td>
                      <td>{{ item.cantidad }}</td>
                      <td>S/. {{ item.precioUnitario.toFixed(2) }}</td>
                      <td>S/. {{ item.subtotal.toFixed(2) }}</td>
                  </tr>
              </tbody>
          </table>
          <div v-if="!loading && details.length > 0" class="total-row">
              <span>Total:</span>
              <span class="total-amount">S/. {{ totalSum.toFixed(2) }}</span>
          </div>
      </div>

      <div class="modal-footer">
        <BaseButton variant="secondary" @click="$emit('close')">Cerrar</BaseButton>
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
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    color: var(--color-primary);
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--color-text-muted);
    cursor: pointer;
    line-height: 1;
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
}

.details-table {
    width: 100%;
    border-collapse: collapse;
}

.details-table th, .details-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
}

.details-table th {
    font-weight: 600;
    color: var(--color-text-muted);
}

.text-center { text-align: center; padding: 2rem; }

.modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: flex-end;
}

.total-row {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
}

.total-amount {
    color: var(--color-primary);
    font-size: 1.25rem;
}
</style>
