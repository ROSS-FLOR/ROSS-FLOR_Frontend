<script setup>
import { ref } from 'vue';
import { useProductsStore } from '@/stores/products';
import BaseModal from './BaseModal.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  show: Boolean,
  product: Object
});

const emit = defineEmits(['close']);

const productsStore = useProductsStore();
const quantity = ref(1);
const isLoading = ref(false);

const handleSubmit = async () => {
  if (quantity.value <= 0) {
    alert('La cantidad debe ser mayor a 0');
    return;
  }
  
  if (props.product.stockActual < quantity.value) {
    alert('No hay suficiente stock');
    return;
  }

  isLoading.value = true;
  try {
    await productsStore.sellProduct(props.product.id, quantity.value);
    quantity.value = 1;
    emit('close');
    alert('Venta registrada con éxito');
  } catch (error) {
    alert('Error al registrar la venta');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="'Registrar Venta: ' + (product ? product.nombre : '')"
    @close="$emit('close')"
  >
    <div v-if="product">
      <p class="stock-info">Stock Disponible: <strong>{{ product.stockActual }}</strong></p>
      
      <form @submit.prevent="handleSubmit">
        <BaseInput 
          label="Cantidad a Vender" 
          v-model.number="quantity" 
          type="number" 
          min="1"
          :max="product.stockActual"
          required 
        />
        
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="$emit('close')" type="button">Cancelar</BaseButton>
          <BaseButton variant="success" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Procesando...' : 'Confirmar Venta' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<style scoped>
.stock-info {
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}
.stock-info strong {
  color: var(--color-text);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
