<script setup>
import BaseButton from '@/components/BaseButton.vue';
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  sale: Object
});

const emit = defineEmits(['close']);

const printObj = {
  id: 'receipt-print-area',
  popTitle: 'Boleta de Venta',
  extraCss: `
    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
    @page { size: 80mm auto; margin: 0mm; }
    body { margin: 0px; font-family: 'Courier Prime', monospace; }
    #receipt-print-area {
        width: 80mm;
        margin: 0;
        padding: 5px;
        font-size: 11px;
        color: black;
    }
    .receipt-header { text-align: center; }
    .company-name { font-size: 1.2rem; font-weight: bold; text-transform: uppercase; }
    .receipt-title { border-top: 1px dashed black; border-bottom: 1px dashed black; margin: 10px 0; padding: 5px 0; text-align: center; }
    .company-details p, .client-details p { margin: 2px 0; }
    .receipt-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .receipt-table th { border-top: 1px solid black; border-bottom: 1px solid black; text-align: left; }
    .receipt-table td { padding: 4px 0; vertical-align: top; }
    .col-price, .col-total { text-align: right; }
    .col-cant { text-align: center; }
    .receipt-totals { border-top: 1px solid black; margin-top: 5px; padding-top: 5px; }
    .total-row { display: flex; justify-content: space-between; text-align: right; }
    .main-total { font-size: 1.2rem; font-weight: bold; }
    .receipt-extras { border-top: 1px dashed black; margin-top: 10px; padding-top: 5px; }
  `,
  extraHead: '<meta http-equiv="Content-Language"content="es-pe"/>',
};

const formatDate = (dateString) => {
    if (!dateString) return 'dd/mm/yyyy';
    return new Date(dateString).toLocaleDateString('es-PE');
};

const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Simple Mock for Number to Text (since a full library is heavy)
const numberToText = (amount) => {
    if (!amount) return 'CERO';
    const integer = Math.floor(amount);
    return `${integer} CON ${Math.round((amount - integer) * 100)}/100`;
};
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <!-- Printable Area -->
      <div id="receipt-print-area" class="receipt-container">
          <!-- Header -->
          <div class="receipt-header">
              <div class="company-name">ROSS & FLOR</div>
              <div class="company-details">
                  <p>RUC: 20123456789</p>
                  <p>Av. Las Flores 123, Lima</p>
                  <p>Telf: 987 654 321</p>
                  <p>Correo: contacto@rossyflor.com</p>
              </div>

              <div class="receipt-title">
                  <h3>BOLETA DE VENTA ELECTRÓNICA</h3>
                  <h4>{{ sale?.id ? `B001 - ${String(sale.id).padStart(8, '0')}` : '---' }}</h4>
              </div>

              <div class="client-details">
                  <p><strong>CLIENTE:</strong> {{ sale?.cliente || 'CLIENTE VARIOS' }}</p>
                  <p><strong>DNI/RUC:</strong> {{ sale?.clienteDocumento || '00000000' }}</p>
                  <p class="date-row">
                      <span><strong>FECHA:</strong> {{ formatDate(sale?.fechaHora) }}</span>
                      <span><strong>HORA:</strong> {{ formatTime(sale?.fechaHora) }}</span>
                  </p>
              </div>
          </div>
          
          <!-- Items -->
          <table class="receipt-table">
              <thead>
                  <tr>
                      <th class="col-cant">CANT</th>
                      <th class="col-desc">DESCRIPCION</th>
                      <th class="col-price">P.U.</th>
                      <th class="col-total">TOTAL</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="detail in sale?.detalles" :key="detail.id">
                      <td class="col-cant">{{ detail.cantidad }}</td>
                      <td class="col-desc">{{ detail.producto?.nombre }}</td>
                      <td class="col-price">{{ detail.precioUnitario.toFixed(2) }}</td>
                      <td class="col-total">{{ detail.subtotal.toFixed(2) }}</td>
                  </tr>
              </tbody>
          </table>

          <!-- Totals -->
          <div class="receipt-totals">
              <div class="total-row">
                  <span>OP. GRAVADA (S/)</span>
                  <span>{{ (sale?.totalFinal / 1.18).toFixed(2) }}</span>
              </div>
              <div class="total-row">
                  <span>I.G.V. (18%) (S/)</span>
                  <span>{{ (sale?.totalFinal - (sale?.totalFinal / 1.18)).toFixed(2) }}</span>
              </div>
              <div class="total-row main-total">
                  <span>TOTAL (S/)</span>
                  <span>{{ sale?.totalFinal?.toFixed(2) }}</span>
              </div>
          </div>

          <!-- Text Amount & Extras -->
          <div class="receipt-extras">
              <p><strong>SON:</strong> {{ numberToText(sale?.totalFinal) }} SOLES</p>
              <p><strong>FORMA DE PAGO:</strong> {{ sale?.modoPago }}</p>
          </div>
      </div>

      <div class="actions">
        <!-- v-print directive applied directly to a native button -->
        <button class="btn btn-primary" v-print="printObj">Imprimir</button>
        <BaseButton variant="secondary" @click="$emit('close')">Cerrar</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  padding: 1rem;
  width: 100%;
  max-width: 85mm; /* Slightly wider than print for padding in view */
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  color: black;
  font-family: 'Courier Prime', 'Courier New', monospace;
}

/* Receipt Styles */
.receipt-container {
    width: 100%;
    padding: 0.5rem;
    font-size: 12px;
}

.receipt-header {
    text-align: center;
    margin-bottom: 1rem;
}

.company-name {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
}

.company-details p, .client-details p {
    margin: 2px 0;
    line-height: 1.2;
}

.receipt-title {
    margin: 1rem 0;
    border-top: 1px dashed #000;
    border-bottom: 1px dashed #000;
    padding: 0.5rem 0;
}

.receipt-title h3 {
    font-size: 1rem;
    margin: 0;
}
.receipt-title h4 {
    font-size: 1.1rem;
    margin: 0.2rem 0 0 0;
}

.client-details {
    text-align: left;
    margin-bottom: 0.5rem;
}

.date-row {
    display: flex;
    justify-content: space-between;
}

/* Table */
.receipt-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.5rem;
    font-size: 11px;
}
.receipt-table th {
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
    text-align: left;
    padding: 2px 0;
}
.receipt-table td {
    padding: 4px 0;
    vertical-align: top;
}

.col-cant { width: 10%; text-align: center; }
.col-desc { width: 50%; }
.col-price { width: 20%; text-align: right; }
.col-total { width: 20%; text-align: right; }

/* Totals */
.receipt-totals {
    border-top: 1px solid #000;
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.total-row {
    display: flex;
    justify-content: space-between;
    text-align: right;
}
.main-total {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 4px;
}

/* Extras */
.receipt-extras {
    margin-top: 1rem;
    border-top: 1px dashed #000;
    padding-top: 0.5rem;
    font-size: 11px;
}

.actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #eee;
}

/* Styles for native button used for v-print */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-text, #000000);
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}
</style>
