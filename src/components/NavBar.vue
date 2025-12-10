<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useProductsStore } from '@/stores/products';


const productsStore = useProductsStore();

const showNotifications = ref(false);
const notificationsViewed = ref(false);
const notificationContainer = ref(null);

const lowStockItems = computed(() => {
  // Filter products with stock < 10 (Red)
  return productsStore.products.filter(p => p.stockActual < 10);
});

const hasNotifications = computed(() => {
    return lowStockItems.value.length > 0 && !notificationsViewed.value;
});

// Watch for new low stock items to reset the "viewed" status
watch(() => lowStockItems.value.length, (newCount, oldCount) => {
    if (newCount > (oldCount || 0)) {
        notificationsViewed.value = false;
    }
});

const toggleNotifications = () => {
    if (!showNotifications.value) {
        notificationsViewed.value = true;
    }
    showNotifications.value = !showNotifications.value;
};

const handleClickOutside = (event) => {
    if (notificationContainer.value && !notificationContainer.value.contains(event.target)) {
        showNotifications.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <nav class="navbar" v-if="authStore.isAuthenticated">
    <div class="navbar-container">
      <div class="logo">
        <img src="@/assets/logo_ross_flor.png" alt="Ross&Flor Logo" class="logo-image" />
      </div>
      <div class="links">
        <router-link to="/boleta" class="nav-link">Emisión de Boletas</router-link>
        <router-link to="/products" class="nav-link">Inventario</router-link>
        <router-link to="/sales" class="nav-link">Ventas</router-link>
      </div>
      <div class="actions">
        <div class="user-info">
          <span class="username">{{ authStore.user?.username || 'Usuario' }}</span>
        </div>

        <div class="notification-container" ref="notificationContainer">
            <button class="icon-btn" @click="toggleNotifications">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bell-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span v-if="hasNotifications" class="red-dot"></span>
            </button>
            <div v-if="showNotifications" class="dropdown-menu">
                <div v-if="lowStockItems.length === 0" class="dropdown-item empty">
                    No hay notificaciones
                </div>
                <div v-else v-for="item in lowStockItems" :key="item.id" class="dropdown-item alert">
                    ⚠️ Reponer stock: {{ item.nombre }} ({{ item.stockActual }})
                </div>
            </div>
        </div>

        <button @click="logout" class="logout-btn">Salir</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  max-width: 1024px; /* Match App.vue */
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.logo-image {
  height: 35px;
  width: auto;
  object-fit: contain;
}

.links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-muted);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--color-primary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  font-size: 0.875rem;
  color: var(--color-text);
}

.logout-btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

/* Notification Styles */
.notification-container {
    position: relative;
    display: flex;
    align-items: center;
}

.icon-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    position: relative;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-btn:hover {
    background: var(--color-surface-hover);
}

.red-dot {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 10px;
    height: 10px;
    background-color: var(--color-danger);
    border-radius: 50%;
    border: 2px solid var(--color-surface);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    width: 300px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 0.5rem 0;
    z-index: 1000;
    padding: 0.5rem 0;
    z-index: 1000;
    margin-top: 0.5rem;
    max-height: 200px; /* Approx 4 items */
    overflow-y: auto;
}

.dropdown-item {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    border-bottom: 1px solid var(--color-border);
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-item.empty {
    text-align: center;
    color: var(--color-text-muted);
}

.dropdown-item.alert {
    color: var(--color-danger);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>
