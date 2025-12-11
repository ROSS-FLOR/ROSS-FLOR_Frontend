<script setup>
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'download-pdf', 'download-excel']);
</script>

<template>
  <BaseModal :show="show" title="Descargar Reporte de Ventas" @close="$emit('close')">
    <div class="download-options">
      <p>Seleccione el formato para descargar el historial de ventas:</p>
      
      <div class="actions">
        <BaseButton variant="primary" class="action-btn" @click="$emit('download-pdf')">
          <i class="fas fa-file-pdf"></i>
          Descargar PDF
        </BaseButton>
        <BaseButton variant="success" class="action-btn excel-btn" @click="$emit('download-excel')">
          <i class="fas fa-file-excel"></i>
          Descargar Excel
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.download-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  min-width: 160px;
}

/* Estilo personalizado para botón excel si la variante success no está definida o necesita color específico */
.excel-btn {
  background-color: #107c41; /* Verde Excel */
  border-color: #107c41;
}

.excel-btn:hover {
  background-color: #0c5e31;
}
</style>
