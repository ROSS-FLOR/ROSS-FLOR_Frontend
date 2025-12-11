<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'info' // info, success, warning, error
    },
    duration: {
        type: Number,
        default: 3000
    }
});

const emit = defineEmits(['close']);

let timer;

onMounted(() => {
    if (props.duration > 0) {
        timer = setTimeout(() => {
            emit('close');
        }, props.duration);
    }
});

onUnmounted(() => {
    clearTimeout(timer);
});
</script>

<template>
    <div class="toast-notification" :class="type">
        <div class="toast-content">
            <span class="message">{{ message }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">×</button>
    </div>
</template>

<style scoped>
/* Toast suave inspirado en PrimeVue */
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.25rem;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    display: flex;
    align-items: flex-start; /* Mejor para múltiples líneas */
    justify-content: space-between;
    gap: 1rem;
    z-index: 10001; /* Más alto que el modal */
    min-width: 320px;
    max-width: 400px;
    border: 1px solid transparent;
}

/* Estilos de Severidad Suave */
.toast-notification.info {
    background: #EFF6FF; /* Blue 50 */
    border-color: #BFDBFE; /* Blue 200 */
    color: #1E40AF; /* Blue 800 */
}
.toast-notification.success {
    background: #ECFDF5; /* Green 50 */
    border-color: #A7F3D0; /* Green 200 */
    color: #065F46; /* Green 800 */
}
.toast-notification.warning {
    background: #FFFBEB; /* Amber 50 */
    border-color: #FDE68A; /* Amber 200 */
    color: #92400E; /* Amber 800 */
}
.toast-notification.error {
    background: #FFE5E5; /* Rojo claro distintivo */
    border-color: #FCA5A5; /* Red 300 */
    color: #991B1B; /* Texto rojo oscuro */
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.message {
    font-weight: 500;
    font-size: 0.95rem;
    line-height: 1.4;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.6;
    line-height: 1;
    color: inherit; /* Heredar color de severidad */
    padding: 0;
    margin-left: auto;
}

.close-btn:hover {
    opacity: 1;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
