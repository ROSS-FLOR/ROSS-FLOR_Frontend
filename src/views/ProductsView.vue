<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductsStore } from '@/stores/products';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import ProductModal from '@/components/ProductModal.vue';

const productsStore = useProductsStore();
const search = ref('');
const selectedCategory = ref('');
const showProductModal = ref(false);
const selectedProduct = ref(null);

const normalizeStr = (str) => {
    return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const filteredProducts = computed(() => {
    // Si el backend devuelve datos pero queremos asegurar un filtrado estricto en el lado de la vista
    // o si el backend devuelve resultados mixtos.
    if (selectedCategory.value) {
        const normalizedSelected = normalizeStr(selectedCategory.value);
        return productsStore.products.filter(p => {
             return normalizeStr(p.categoria) === normalizedSelected;
        });
    }
    return productsStore.products;
});

const categories = [
  'Librería y Escolar',
  'Oficina y Papelería',
  'Arte y Diseño',
  'Regalos y Detalles',
  'Juguetería',
  'Piñatería y Fiestas',
  'Bazar y Hogar',
  'Otros'
];

// La lógica de Debounce podría añadirse aquí, actualmente depende de enter o un watch reactivo simple si se implementa
let debounceTimeout;
watch([search, selectedCategory], ([newSearch, newCategory]) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    productsStore.fetchProducts(0, newSearch, newCategory);
  }, 500);
});

onMounted(() => {
  productsStore.fetchProducts();
});

const openCreateModal = () => {
  selectedProduct.value = null;
  showProductModal.value = true;
};

const openEditModal = (product) => {
  selectedProduct.value = { ...product }; // Copiar para evitar mutación
  showProductModal.value = true;
};

const changePage = (page) => {
  if (page >= 0 && page < productsStore.totalPages) {
    productsStore.fetchProducts(page, search.value, selectedCategory.value);
  }
};
const getStockClass = (stock) => {
  if (stock < 10) return 'stock-red';
  if (stock <= 25) return 'stock-yellow';
  return 'stock-green';
};
</script>

<template>
  <div class="products-container">
    <div class="top-bar">
      <h1>Inventario</h1>
      <BaseButton @click="openCreateModal">
        + Registrar Producto
      </BaseButton>
    </div>

    <div class="controls">
      <div class="search-box">
        <BaseInput 
            v-model="search" 
            placeholder="Buscar por nombre..." 
            class="search-input"
        />
      </div>
      
      <div class="filter-box">
          <select v-model="selectedCategory" class="category-select">
              <option value="">Todas las Categorías</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Precio Unit.</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="productsStore.loading">
            <td colspan="5" class="text-center">Cargando...</td>
          </tr>
          <tr v-else-if="filteredProducts.length === 0">
             <td colspan="5" class="text-center">No se encontraron productos.</td>
          </tr>
          <tr v-else v-for="product in filteredProducts" :key="product.id">
            <td>
              {{ product.nombre }}
            </td>
            <td>
              {{ product.categoria || '-' }}
            </td>
            <td>
              <span class="stock-badge" :class="getStockClass(product.stockActual)">
                {{ product.stockActual }}
              </span>
            </td>
            <td>S/.{{ product.precioUnitario.toFixed(2) }}</td>
            <td class="actions-cell">
              <BaseButton variant="secondary" @click="openEditModal(product)" class="sm-btn">Editar</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="productsStore.totalPages > 1">
      <button 
        :disabled="productsStore.currentPage === 0"
        @click="changePage(productsStore.currentPage - 1)"
      >Anterior</button>
      <span>Página {{ productsStore.currentPage + 1 }} de {{ productsStore.totalPages }}</span>
      <button 
        :disabled="productsStore.currentPage >= productsStore.totalPages - 1"
        @click="changePage(productsStore.currentPage + 1)"
      >Siguiente</button>
    </div>

    <ProductModal 
      :show="showProductModal" 
      :productToEdit="selectedProduct"
      @close="showProductModal = false" 
    />
  </div>
</template>

<style scoped>
.products-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
    flex: 1;
    min-width: 250px;
}

.search-input {
  width: 100%;
  margin-bottom: 0 !important;
}

.filter-box {
    min-width: 200px;
}

.category-select {
    width: 100%;
    padding: 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}

.category-select:focus {
    border-color: var(--color-primary);
}

.table-container {

  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  background-color: rgba(255,255,255,0.05);
  font-weight: 600;
  color: var(--color-text-muted);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}


.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.sm-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.stock-badge {
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.stock-red {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.stock-yellow {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.stock-green {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.alert-bell {
  margin-left: 0.5rem;
  cursor: help;
  filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.5));
  animation: bell-shake 2s infinite;
  display: inline-block;
  font-size: 1.1rem;
}

@keyframes bell-shake {
  0%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(15deg); }
  20%, 40% { transform: rotate(-15deg); }
  50% { transform: rotate(0); }
}

.text-center {
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  transition: all 0.2s;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
