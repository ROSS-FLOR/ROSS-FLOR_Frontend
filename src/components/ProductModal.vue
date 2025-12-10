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
      categoria: '',
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
        categoria: '',
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

      <div class="form-group">
        <label class="label">Categoría</label>
        <select v-model="form.categoria" class="select-input" required>
          <option value="" disabled>Seleccione una categoría</option>
          <option value="Librería y Escolar">Librería y Escolar</option>
          <option value="Oficina y Papelería">Oficina y Papelería</option>
          <option value="Arte y Diseño">Arte y Diseño</option>
          <option value="Regalos y Detalles">Regalos y Detalles</option>
          <option value="Juguetería">Juguetería</option>
          <option value="Piñatería y Fiestas">Piñatería y Fiestas</option>
          <option value="Bazar y Hogar">Bazar y Hogar</option>
          <option value="Tecnología">Tecnología</option>
          <option value="Otros">Otros</option>
        </select>
      </div>
      
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.select-input {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.2s;
  width: 100%;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
</style>
