<script setup>
import { ref, watch, computed } from 'vue';
import { useSalesStore } from '@/stores/sales';
import BaseModal from './BaseModal.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  show: Boolean,
  saleToEdit: Object
});

const emit = defineEmits(['close']);

const salesStore = useSalesStore();
const form = ref({
  cantidad: 0
});

const isLoading = ref(false);

watch(() => props.saleToEdit, (newVal) => {
  if (newVal) {
    // Assuming backend expects { cantidad: number } or similar
    // Mapping from local sale object to form
    form.value = {
      cantidad: newVal.cantidadVendida,
    };
  } else {
    form.value = { cantidad: 0 };
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (form.value.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
  }
  
  isLoading.value = true;
  try {
    await salesStore.updateSale(props.saleToEdit.id, form.value);
    emit('close');
    alert('Venta actualizada con éxito');
  } catch (error) {
    alert('Error al actualizar la venta');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseModal 
    :show="show" 
    title="Editar Venta"
    @close="$emit('close')"
  >
    <div v-if="saleToEdit">
      <p class="sale-info">Producto: <strong>{{ saleToEdit.nombreProducto }}</strong></p>
      
      <form @submit.prevent="handleSubmit">
        <BaseInput 
          label="Nueva Cantidad" 
          v-model.number="form.cantidad" 
          type="number" 
          min="1"
          required 
        />
        
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="$emit('close')" type="button">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isLoading">
            {{ isLoading ? 'Guardando...' : 'Actualizar' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<style scoped>
.sale-info {
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}
.sale-info strong {
  color: var(--color-text);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
