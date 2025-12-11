<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductsStore } from '@/stores/products';
import { useSalesStore } from '@/stores/sales';
import BaseButton from '@/components/BaseButton.vue';
import PaymentModal from '@/components/PaymentModal.vue';
import ReceiptModal from '@/components/ReceiptModal.vue';
import BaseToast from '@/components/BaseToast.vue';

const productsStore = useProductsStore();
const salesStore = useSalesStore();

const cart = ref([]);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const lastSale = ref(null);

const toasts = ref([]);

const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    toasts.value.push({ id, message, type, duration });
};

const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
};

const selectedCategory = ref(null);

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

// Inicializar productos - obtener todos al inicio
onMounted(() => {
    // Queremos filtrar productos localmente para mayor velocidad en esta vista
    // Asumiendo que la paginación del backend es lo suficientemente grande o la lógica cambia para obtener por categoría
    // Por ahora, obtenemos por defecto y confiamos en el parámetro de categoría si es necesario, 
    // PERO el requerimiento implica una navegación rápida "estilo app". 
    // Solicitamos una cantidad grande para "quitar la paginación" visualmente
    productsStore.fetchProducts(0, '', '', 2000); 
});

const displayedProducts = computed(() => {
    if (!selectedCategory.value) return [];
    // Filtrar productos locales si los tenemos todos, O obtener del backend si está paginado estrictamente.
    // Dado que el paso anterior añadió filtrado en backend:
    return productsStore.products; // La tienda ya tiene la lista filtrada
});

const selectCategory = (category) => {
    selectedCategory.value = category;
    // Obtener productos para esta categoría
    // Asumimos que el backend maneja la paginación, solicitamos la página 0 con gran tamaño
    productsStore.fetchProducts(0, '', category, 2000);
};

const goBackToCategories = () => {
    selectedCategory.value = null;
    selectedCategory.value = null;
    productsStore.fetchProducts(0, '', '', 2000); // Opcional: limpiar filtro o simplemente no mostrar
};

// Ayudante de Lógica del Carrito
const getCartItem = (productId) => {
    return cart.value.find(item => item.id === productId);
};

const getProductQty = (productId) => {
    const item = getCartItem(productId);
    return item ? item.cantidad : 0;
};

const increaseQty = (product) => {
    const existingItem = getCartItem(product.id);
    if (existingItem) {
        if (existingItem.cantidad < product.stockActual) {
            existingItem.cantidad++;
            existingItem.subtotal = existingItem.cantidad * existingItem.precioUnitario;
        }
    } else {
        if (product.stockActual > 0) {
            cart.value.push({
                ...product,
                cantidad: 1,
                subtotal: product.precioUnitario
            });
        }
    }
};

const decreaseQty = (product) => {
    const existingItem = getCartItem(product.id);
    if (existingItem) {
        if (existingItem.cantidad > 1) {
            existingItem.cantidad--;
            existingItem.subtotal = existingItem.cantidad * existingItem.precioUnitario;
        } else {
            // Eliminar del carrito
            const index = cart.value.indexOf(existingItem);
            cart.value.splice(index, 1);
        }
    }
};

const clearCart = () => {
    if (confirm('¿Vaciar carrito?')) {
        cart.value = [];
    }
};

const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.subtotal, 0);
});

// Lógica de Paginación
// Lógica de Paginación retirada visualmente, pero mantenemos funciones si se necesitaran internamente
// const changePage = (page) => { ... }

const normalizeStr = (str) => {
    return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const filteredProducts = computed(() => {
    if (selectedCategory.value) {
        const normalizedSelected = normalizeStr(selectedCategory.value);
        return productsStore.products.filter(p => {
             return normalizeStr(p.categoria) === normalizedSelected;
        });
    }
    return productsStore.products;
});

const handleCheckout = async (paymentMethod) => {
    // Mantener registro de items para verificar stock después
    const itemsToCheck = cart.value.map(item => item.id);

    const saleRequest = {
        modoPago: paymentMethod,
        items: cart.value.map(item => ({
            idProducto: item.id,
            cantidad: item.cantidad
        }))
    };

    try {
        const sale = await salesStore.createSale(saleRequest);
        lastSale.value = sale;
        showReceiptModal.value = true;
        cart.value = [];
        showPaymentModal.value = false;
        
        // Actualizar productos y luego verificar stock bajo
        if (selectedCategory.value) {
            await productsStore.fetchProducts(0, '', selectedCategory.value, 2000); 
        } else {
            await productsStore.fetchProducts(0, '', '', 2000);
        }

        // Verificar stock bajo en items comprados
        itemsToCheck.forEach(itemId => {
            const product = productsStore.products.find(p => p.id === itemId);
            if (product && product.stockActual < 10) {
                // Estilo "Error" rojo, duración de 4 segundos
                addToast(`Reponer Stock de "${product.nombre}" (${product.stockActual})`, 'error', 4000);
            }
        });

    } catch (error) {
        alert('Error al emitir boleta: ' + (error.response?.data?.message || error.message));
    }
};

import imgLibreria from '@/assets/categories/cat_libreria.png';
import imgOficina from '@/assets/categories/cat_oficina.png';
import imgArte from '@/assets/categories/cat_arte.png';
import imgRegalos from '@/assets/categories/cat_regalos.png';
import imgJugueteria from '@/assets/categories/cat_jugueteria.png';
import imgPinateria from '@/assets/categories/cat_pinateria.png';
import imgBazar from '@/assets/categories/cat_bazar.png';
import imgOtros from '@/assets/categories/cat_otros.png';

const categoryImages = {
  'Librería y Escolar': imgLibreria,
  'Oficina y Papelería': imgOficina,
  'Arte y Diseño': imgArte,
  'Regalos y Detalles': imgRegalos,
  'Juguetería': imgJugueteria,
  'Piñatería y Fiestas': imgPinateria,
  'Bazar y Hogar': imgBazar,
  'Otros': imgOtros
};

const getCategoryIcon = (cat) => {
    return categoryImages[cat];
};
</script>

<template>
  <div class="pos-wrapper">
    <!-- Left Column: Navigation & Grid -->
    <div class="catalog-section">
        
        <!-- Header / Breadcrumb -->
        <div class="catalog-header" v-if="selectedCategory">
            <button class="back-btn" @click="goBackToCategories">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
            <h2>{{ selectedCategory }}</h2>
        </div>
        <div class="catalog-header" v-else>
            <h2>Seleccione una Categoría</h2>
            <small>Elija una categoría para ver sus productos</small>
        </div>

        <!-- CATEGORY GRID -->
        <div class="grid-container categories-grid" v-if="!selectedCategory">
            <div 
                v-for="cat in categories" 
                :key="cat" 
                class="category-card"
                @click="selectCategory(cat)"
            >
                <div class="cat-icon-wrapper">
                    <img :src="getCategoryIcon(cat)" :alt="cat" class="cat-img" />
                </div>
                <div class="cat-name">{{ cat }}</div>
            </div>
        </div>

        <!-- PRODUCT GRID -->
        <div class="grid-container products-grid" v-else>
             <div v-if="productsStore.loading" class="loading-state">Cargando productos...</div>
             <div v-else-if="filteredProducts.length === 0" class="empty-state">
                No hay productos en esta categoría.
             </div>

             <div v-else v-for="product in filteredProducts" :key="product.id" class="product-card" :class="{ 'card-out-stock': product.stockActual === 0 }">
                 <div class="agotado-overlay" v-if="product.stockActual === 0">AGOTADO</div>
                 <div class="product-main">
                     <div class="prod-name">{{ product.nombre }}</div>
                     <div class="prod-price">S/. {{ product.precioUnitario.toFixed(2) }}</div>
                     <div class="prod-stock" :class="{'out-stock': product.stockActual === 0}">
                        Stock: {{ product.stockActual }}
                     </div>
                 </div>
                 
                 <div class="product-actions">
                     <button 
                        class="action-btn minus" 
                        @click.stop="decreaseQty(product)"
                        :disabled="getProductQty(product.id) === 0"
                     >−</button>
                     <span class="qty-label">{{ getProductQty(product.id) }}</span>
                     <button 
                        class="action-btn plus" 
                        @click.stop="increaseQty(product)"
                        :disabled="getProductQty(product.id) >= product.stockActual"
                     >+</button>
                 </div>
             </div>
        </div>



    </div>

    <!-- Right Column: Cart (Unchanged logic, minor style tweaks) -->
    <div class="cart-section">
        <div class="cart-header">
            <h2>Resumen <span class="badge" v-if="cart.length > 0">#{{ cart.length }}</span></h2>
            <button v-if="cart.length > 0" @click="clearCart" class="clear-btn" title="Vaciar carrito">
                 <i class="fas fa-trash-alt"></i>
            </button>
        </div>

        <div class="cart-items">
            <div v-if="cart.length === 0" class="empty-cart-msg">
                <p>Carrito vacío</p>
            </div>
            <div v-else v-for="item in cart" :key="item.id" class="cart-item">
                <div class="cart-item-info">
                    <div class="item-name">{{ item.nombre }}</div>
                    <div class="item-meta">
                        {{ item.cantidad }} x S/. {{ item.precioUnitario.toFixed(2) }}
                    </div>
                </div>
                <div class="item-total">
                    S/. {{ item.subtotal.toFixed(2) }}
                </div>
            </div>
        </div>

        <div class="cart-footer">
            <div class="total-row">
                <span>Total Final</span>
                <span class="total-amount">S/. {{ cartTotal.toFixed(2) }}</span>
            </div>
            <BaseButton 
                class="checkout-btn"
                @click="showPaymentModal = true" 
                :disabled="cart.length === 0 || salesStore.loading"
            >
                {{ salesStore.loading ? 'Procesando...' : 'Emitir Boleta' }}
            </BaseButton>
        </div>
    </div>

    <!-- Modals -->
    <PaymentModal 
        :show="showPaymentModal"
        :total="cartTotal"
        @close="showPaymentModal = false"
        @confirm="handleCheckout"
    />

    <ReceiptModal
        :show="showReceiptModal"
        :sale="lastSale"
        @close="showReceiptModal = false"
    />

    <!-- Toasts Container -->
    <TransitionGroup name="toast" tag="div" class="toast-container">
        <BaseToast 
            v-for="toast in toasts" 
            :key="toast.id"
            :message="toast.message"
            :type="toast.type"
            :duration="toast.duration"
            @close="removeToast(toast.id)"
        />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.pos-wrapper {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    height: calc(100vh - 80px);
    padding-bottom: 0.5rem;
}

/* Catalog Section */
.catalog-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden;
}

.catalog-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 50px;
}

.catalog-header h2 { margin: 0; font-size: 1.5rem; }

.back-btn {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text);
}

.back-btn:hover {
    background: var(--color-background);
}

/* Grids Table */
.grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    overflow-y: auto;
    padding-right: 0.5rem;
    align-content: start; /* Don't stretch rows */
    flex: 1;
}

/* Category Cards */
.category-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    aspect-ratio: 1; /* Square */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 1rem;
    text-align: center;
}

.category-card:hover {
    box-shadow: var(--shadow-md);
}

.cat-icon-wrapper {
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cat-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
}

.category-card:hover .cat-img {
    transform: scale(1.1);
}

.cat-name { font-weight: 700; font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.2; }
.cat-name { font-weight: 700; font-size: 1.1rem; }

/* Product Cards */
.product-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    aspect-ratio: 1; /* Square */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
    transition: border-color 0.2s;
    position: relative;
    overflow: hidden;
}

.product-card.card-out-stock {
    opacity: 0.7;
    background-color: rgba(200, 200, 200, 0.1);
    border-color: var(--color-border);
}

.agotado-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    background: rgba(220, 38, 38, 0.9);
    color: white;
    padding: 0.5rem 1rem;
    font-weight: 800;
    font-size: 1.2rem;
    border-radius: 8px;
    z-index: 10;
    border: 2px solid white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    pointer-events: none;
}

.product-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow: hidden;
}

.prod-name { font-weight: 600; font-size: 1rem; line-height: 1.3; }
.prod-price { font-weight: 700; font-size: 1.2rem; }
.prod-stock { font-size: 0.85rem; color: var(--color-text-muted); }
.prod-stock.out-stock { color: var(--color-danger); }

.product-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--color-background);
    border-radius: var(--radius-md);
    padding: 0.25rem;
    margin-top: 0.5rem;
    border: 1px solid var(--color-border);
}

.action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.action-btn.minus { background: var(--color-danger); opacity: 0.8; }
.action-btn.plus { background: var(--color-success); }
.action-btn:disabled { opacity: 0.3; cursor: not-allowed; background: var(--color-text-muted); }
.action-btn:where(:not(:disabled)):hover { opacity: 1; transform: scale(1.05); }

.qty-label { font-weight: 700; width: 30px; text-align: center; }


/* Cart Section (Right) */
.cart-section {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.cart-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-header h2 { margin: 0; font-size: 1.25rem; }

.badge {
    background: var(--color-success);
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 99px;
    vertical-align: middle;
}

.clear-btn { background: none; border: none; cursor: pointer; color: var(--color-danger); font-size: 1.2rem; }

.cart-items { flex: 1; overflow-y: auto; padding: 1rem; }

.cart-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
}
.cart-item:last-child { border-bottom: none; }

.item-name { font-weight: 600; }
.item-meta { font-size: 0.85rem; color: var(--color-text-muted); }
.item-total { font-weight: 700; }

.empty-cart-msg { text-align: center; margin-top: 2rem; color: var(--color-text-muted); }

.cart-footer {
    padding: 1.5rem;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
}

.total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--color-text-muted);
}
.total-amount { font-size: 1.5rem; font-weight: 800; color: var(--color-text); }

.checkout-btn { width: 100%; justify-content: center; font-size: 1rem; padding: 1rem; }

.pagination-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
}
.page-btn {
    background: var(--color-surface); border: 1px solid var(--color-border);
    border-radius: var(--radius-md); padding: 0.25rem 0.75rem; cursor: pointer;
}

@media (min-width: 1300px) {
    .grid-container { grid-template-columns: repeat(4, 1fr); }
}

/* Existing max-width queries */
@media (max-width: 1100px) {
    .grid-container { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
    .pos-wrapper { grid-template-columns: 1fr; overflow-y: auto; height: auto; }
    .cart-section { order: -1; margin-bottom: 1rem; max-height: 300px; }
    .grid-container { max-height: 500px; }
}

.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%); /* Slide out to right */
}
</style>
