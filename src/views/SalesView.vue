<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSalesStore } from '@/stores/sales';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
// import ManualSaleModal from '@/components/ManualSaleModal.vue';
import SaleDetailsModal from '@/components/SaleDetailsModal.vue';
import DownloadReportModal from '@/components/DownloadReportModal.vue';
import ErrorModal from '@/components/ErrorModal.vue';

const salesStore = useSalesStore();
// const showManualSaleModal = ref(false);
const showDetailsModal = ref(false);
const showDownloadModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');
const selectedSale = ref(null);

// Filter states
const startDate = ref('');
const endDate = ref('');
let debounceTimeout = null;

const applyFilters = (page = 0) => {
  const filters = {};
  // If dates are provided, append time to cover the full range
  if (startDate.value) filters.fechaInicio = `${startDate.value}T00:00:00`;
  if (endDate.value) filters.fechaFin = `${endDate.value}T23:59:59`;
  
  salesStore.fetchSales(page, filters);
};

// Validates dates before showing download modal
const validateAndShowDownload = () => {
    if (!startDate.value || !endDate.value) {
        errorMessage.value = 'Para descargar el reporte, por favor seleccione un rango de fechas válido (Desde y Hasta).';
        showErrorModal.value = true;
        return;
    }
    showDownloadModal.value = true;
};

// Preset Date Logic
const setDateRange = (range) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (range === 'today') {
        startDate.value = todayStr;
        endDate.value = todayStr;
    } else if (range === 'week') {
        // First day of current week (Monday)
        const day = today.getDay() || 7; // Get current day number, convert Sun(0) to 7
        if (day !== 1) today.setHours(-24 * (day - 1));
        const startYYYY = today.getFullYear();
        const startMM = String(today.getMonth() + 1).padStart(2, '0');
        const startDD = String(today.getDate()).padStart(2, '0');
        
        startDate.value = `${startYYYY}-${startMM}-${startDD}`;
        endDate.value = todayStr; // End is today
    } else if (range === 'month') {
        startDate.value = `${yyyy}-${mm}-01`;
        endDate.value = todayStr;
    } else if (range === 'clear') {
        startDate.value = '';
        endDate.value = '';
    }
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

import { generateSalesPdf } from '@/utils/pdfGenerator';

const handleDownloadPdf = async () => {
    // Append time for backend filtering logic
    const start = startDate.value ? `${startDate.value}T00:00:00` : null;
    const end = endDate.value ? `${endDate.value}T23:59:59` : null;
    
    try {
        const filters = {};
        if (startDate.value) filters.fechaInicio = start;
        if (endDate.value) filters.fechaFin = end;

        const salesReport = await salesStore.fetchSalesForReport(filters);
        
        // Calculate total sum for local calculation
        const totalSum = salesReport.reduce((acc, sale) => acc + (sale.totalFinal || 0), 0);
        
        generateSalesPdf(salesReport, startDate.value, endDate.value, totalSum);
        showDownloadModal.value = false;
    } catch (error) {
        alert('Error al generar el reporte PDF');
    }
};

const handleDownloadExcel = () => {
    const start = startDate.value ? `${startDate.value}T00:00:00` : null;
    const end = endDate.value ? `${endDate.value}T23:59:59` : null;
    salesStore.downloadExcel(start, end);
    showDownloadModal.value = false;
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
        <BaseButton variant="secondary" @click="validateAndShowDownload">Descargar Reporte</BaseButton>
      </div>
    </div>

    <div class="filters-bar">
      <div class="date-filters-container">
          <div class="quick-filters">
              <button class="chip-btn" @click="setDateRange('today')">Hoy</button>
              <button class="chip-btn" @click="setDateRange('week')">Esta Semana</button>
              <button class="chip-btn" @click="setDateRange('month')">Este Mes</button>
              <button class="chip-btn clear" @click="setDateRange('clear')">Limpiar</button>
          </div>
          <div class="date-inputs">
            <BaseInput 
              v-model="startDate" 
              type="date" 
              label="Desde"
              class="date-input"
            />
            <BaseInput 
              v-model="endDate" 
              type="date" 
              label="Hasta"
              class="date-input"
            />
          </div>
      </div>
      
      <div class="total-summary">
        <span class="total-label">Ventas Totales:</span>
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
    <SaleDetailsModal :show="showDetailsModal" :sale="selectedSale" @close="showDetailsModal = false" />
    <DownloadReportModal 
      :show="showDownloadModal" 
      @close="showDownloadModal = false"
      @download-pdf="handleDownloadPdf"
      @download-excel="handleDownloadExcel"
    />
    <ErrorModal
        :show="showErrorModal"
        :message="errorMessage"
        @close="showErrorModal = false"
    />
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
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.date-filters-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.quick-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.chip-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    padding: 0.25rem 0.75rem;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: all 0.2s;
}

.chip-btn:hover {
    background: rgba(255,255,255,0.05);
    color: var(--color-text);
    border-color: var(--color-text-muted);
}

.chip-btn.clear:hover {
    border-color: var(--color-danger);
    color: var(--color-danger);
}

.date-inputs {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.date-input {
  width: 160px;
  margin-bottom: 0 !important;
}

.total-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: rgba(var(--color-primary-rgb), 0.05);
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
