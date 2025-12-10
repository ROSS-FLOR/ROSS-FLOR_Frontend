<script setup>
import { ref } from 'vue';
import { useSalesStore } from '@/stores/sales'; // Changed from products store
import BaseModal from './BaseModal.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const salesStore = useSalesStore(); // Use sales store
const productName = ref('');
const quantity = ref(1);
const price = ref(0);
const isLoading = ref(false);

const handleSubmit = async () => {
    if (!productName.value) {
        alert('Ingrese el nombre del producto');
        return;
    }
    
    if (quantity.value <= 0) {
        alert('Cantidad inválida');
        return;
    }
    
    if (price.value < 0) {
        alert('Precio inválido');
        return;
    }
    
    isLoading.value = true;
    try {
        const payload = {
            nombreProducto: productName.value,
            cantidad: quantity.value,
            precioUnitario: price.value
        };
        
        await salesStore.createManualSale(payload);
        alert('Venta registrada');
        emit('close');
        // Reset state
        productName.value = '';
        quantity.value = 1;
        price.value = 0;
    } catch (err) {
        alert('Error al registrar venta');
    } finally {
        isLoading.value = false;
    }
};

const close = () => {
    emit('close');
    productName.value = '';
    quantity.value = 1;
    price.value = 0;
};
</script>

<template>
  <BaseModal :show="show" title="Registrar Venta Manual" @close="close">
      <form @submit.prevent="handleSubmit">
        <BaseInput 
            v-model="productName" 
            label="Producto / Concepto" 
            placeholder="Ej. Libro Usado..."
            required
        />

        <BaseInput 
            type="number" 
            v-model.number="quantity" 
            label="Cantidad"
            min="1"
            required
        />
        
        <BaseInput 
            type="number" 
            v-model.number="price" 
            label="Precio Unitario"
            min="0"
            step="0.01"
            required
        />
        
        <div class="actions">
            <BaseButton variant="secondary" @click="close" type="button">Cancelar</BaseButton>
            <BaseButton variant="success" type="submit" :disabled="isLoading">
                {{ isLoading ? 'Procesando...' : 'Confirmar Venta' }}
            </BaseButton>
        </div>
      </form>
  </BaseModal>
</template>

<style scoped>
.actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}
</style>
