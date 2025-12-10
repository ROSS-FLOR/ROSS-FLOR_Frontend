<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSalesStore } from '@/stores/sales';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
// import ManualSaleModal from '@/components/ManualSaleModal.vue';
import SaleDetailsModal from '@/components/SaleDetailsModal.vue';

const salesStore = useSalesStore();
// const showManualSaleModal = ref(false);
const showDetailsModal = ref(false);
const selectedSale = ref(null);

// Filter states
const startDate = ref('');
const endDate = ref('');

const applyFilters = (page = 0) => {
  const filters = {};
  if (startDate.value) filters.fechaInicio = startDate.value;
  if (endDate.value) filters.fechaFin = endDate.value;
  
  salesStore.fetchSales(page, filters);
};

watch([startDate, endDate], () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    applyFilters(0);
  }, 500);
});

onMounted(() => {
  salesStore.fetchSales();
});

const changePage = (page) => {
  if (page >= 0 && page < salesStore.totalPages) {
    applyFilters(page);
  }
};

const handleDownload = () => {
    // Requires formats like 2023-01-01T00:00:00. Note: Input type date returns YYYY-MM-DD
    const start = startDate.value ? startDate.value : null;
    const end = endDate.value ? endDate.value : null;
    salesStore.downloadReport(start, end);
};

const openDetailsModal = (sale) => {
  selectedSale.value = sale;
  showDetailsModal.value = true;
};
</script>

<template>
  <div class="sales-container">
    <div class="top-bar">
      <h1>Historial de Ventas</h1>
      <div class="top-actions">
        <BaseButton variant="secondary" @click="handleDownload">Descargar PDF</BaseButton>
      </div>
    </div>

    <div class="filters-bar">
      <div class="date-filters">
        <BaseInput 
          v-model="startDate" 
          type="datetime-local" 
          label="Desde"
          class="date-input"
        />
        <BaseInput 
          v-model="endDate" 
          type="datetime-local" 
          label="Hasta"
          class="date-input"
        />
      </div>
      
      <div class="total-summary">
        <span class="total-label">Vental Totales:</span>
        <span class="total-amount">S/.{{ salesStore.sales.reduce((acc, sale) => acc + (sale.totalFinal || 0), 0).toFixed(2) }}</span>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Fecha/Hora</th>
            <th>Modo Pago</th>
            <th>Precio Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="salesStore.loading">
            <td colspan="4" class="text-center">Cargando...</td>
          </tr>
          <tr v-else-if="salesStore.error">
             <td colspan="4" class="text-center text-danger">{{ salesStore.error }}</td>
          </tr>
          <tr v-else-if="salesStore.sales.length === 0">
             <td colspan="4" class="text-center">No se encontraron ventas.</td>
          </tr>
          <tr v-else v-for="sale in salesStore.sales" :key="sale.id">
            <td>{{ sale.fechaHora ? new Date(sale.fechaHora).toLocaleString() : 'Fecha inválida' }}</td>
            <td>{{ sale.modoPago || 'N/A' }}</td>
            <td>S/.{{ sale.totalFinal ? sale.totalFinal.toFixed(2) : '0.00' }}</td>
            <td>
              <BaseButton variant="primary" class="sm-btn" @click="openDetailsModal(sale)">Ver Detalles</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="salesStore.totalPages > 1">
      <button 
        :disabled="salesStore.currentPage === 0"
        @click="changePage(salesStore.currentPage - 1)"
      >Anterior</button>
      <span>Página {{ salesStore.currentPage + 1 }} de {{ salesStore.totalPages }}</span>
      <button 
        :disabled="salesStore.currentPage >= salesStore.totalPages - 1"
        @click="changePage(salesStore.currentPage + 1)"
      >Siguiente</button>
    </div>

    <!-- <ManualSaleModal :show="showManualSaleModal" @close="showManualSaleModal = false" /> -->
    <SaleDetailsModal :show="showDetailsModal" :saleId="selectedSale?.id" @close="showDetailsModal = false" />
  </div>
</template>

<style scoped>
.sales-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.top-actions {
  display: flex;
  gap: 1rem;
}

.filters-bar {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  background: var(--color-surface);
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.filter-input {
  flex: 1;
  min-width: 200px;
  margin-bottom: 0 !important;
}

.date-filters {
  display: flex;
  gap: 1rem;
}

.date-input {
  width: 200px;
  margin-bottom: 0 !important;
}

.total-summary {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.total-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.table-container {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  background-color: rgba(255,255,255,0.05);
  font-weight: 600;
  color: var(--color-text-muted);
}

.sm-btn {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
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

.text-danger {
  color: var(--color-danger);
}
</style>
