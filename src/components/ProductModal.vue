<script setup>
import { ref, watch, computed } from 'vue';
import { useProductsStore } from '@/stores/products';
import BaseModal from './BaseModal.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps({
  show: Boolean,
  productToEdit: Object
});

const emit = defineEmits(['close']);

const productsStore = useProductsStore();
const form = ref({
  nombre: '',
  stockActual: 0,
  precioUnitario: 0
});

const isEditing = computed(() => !!props.productToEdit);
const isLoading = ref(false);

watch(() => props.productToEdit, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  } else {
    form.value = {
      nombre: '',
      stockActual: 0,
      precioUnitario: 0
    };
  }
}, { immediate: true });

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    if (isEditing.value) {
      await productsStore.updateProduct(props.productToEdit.id, form.value);
    } else {
      await productsStore.createProduct(form.value);
    }
    if (!isEditing.value) {
      form.value = {
        nombre: '',
        stockActual: 0,
        precioUnitario: 0
      };
    }
    emit('close');
  } catch (error) {
    alert('Error al guardar el producto');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="isEditing ? 'Editar Producto' : 'Registrar Producto'"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit">
      <BaseInput 
        label="Nombre del Producto" 
        v-model="form.nombre" 
        required 
        placeholder="Ej. Libro de Vue.js"
      />
      
      <BaseInput 
        label="Stock Actual" 
        v-model.number="form.stockActual" 
        type="number" 
        required 
        placeholder="0"
      />
      
      <BaseInput 
        label="Precio Unitario" 
        v-model.number="form.precioUnitario" 
        type="number" 
        step="0.01" 
        required 
        placeholder="0.00"
      />
      
      <div class="modal-actions">
        <BaseButton variant="secondary" @click="$emit('close')" type="button">Cancelar</BaseButton>
        <BaseButton type="submit" :disabled="isLoading">
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
