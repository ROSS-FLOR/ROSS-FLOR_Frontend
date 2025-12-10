<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useProductsStore } from '@/stores/products';
import { useSalesStore } from '@/stores/sales';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import PaymentModal from '@/components/PaymentModal.vue';
import ReceiptModal from '@/components/ReceiptModal.vue';

const productsStore = useProductsStore();
const salesStore = useSalesStore();

const searchQuery = ref('');
const cart = ref([]);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const lastSale = ref(null);

// Initialize products
onMounted(() => {
    productsStore.fetchProducts();
});

// Search & Filter Logic
// We want to filter the LOCALLY displayed products based on the search query
// IF the store already has them, OR fetch from backend.
// For a smooth POS experience, usually we filter the loaded list.
// Let's rely on the store's "fetchProducts" for the search to support server-side search.
let debounceTimeout;
watch(searchQuery, (newVal) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        productsStore.fetchProducts(0, newVal);
    }, 300);
});

// Cart Logic Helper
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
        } else {
            // Optional: Toast warning for stock limit
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
            // Remove from cart
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

// Pagination Logic
const changePage = (page) => {
    if (page >= 0 && page < productsStore.totalPages) {
        productsStore.fetchProducts(page, searchQuery.value);
    }
};

const handleCheckout = async (paymentMethod) => {
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
        // Refresh products to update stock
        productsStore.fetchProducts(); 
    } catch (error) {
        alert('Error al emitir boleta: ' + (error.response?.data?.message || error.message));
    }
};
</script>

<template>
  <div class="pos-wrapper">
    <!-- Left Column: Catalog -->
    <div class="catalog-section">
        <div class="search-header">
            <div class="search-bar">
                <span class="search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Buscar productos por nombre o código..." 
                    class="clean-search-input"
                >
            </div>
        </div>

        <div class="products-grid">
            <div v-if="productsStore.loading" class="loading-state">Cargando productos...</div>
            <div v-else-if="productsStore.products.length === 0" class="empty-state">No se encontraron productos</div>
            
            <div v-else v-for="product in productsStore.products" :key="product.id" class="product-card">
                <div class="product-info">
                    <h3 class="product-name">{{ product.nombre }}</h3>
                    <span class="product-code">Stock: {{ product.stockActual }}</span>
                </div>
                <div class="product-pricing">
                    <div class="price">S/. {{ product.precioUnitario.toFixed(2) }}</div>
                    
                    <div class="qty-stepper">
                        <button 
                            class="step-btn" 
                            @click="decreaseQty(product)"
                            :disabled="getProductQty(product.id) === 0"
                        >−</button>
                        <span class="qty-display">{{ getProductQty(product.id) }}</span>
                        <button 
                            class="step-btn" 
                            @click="increaseQty(product)"
                            :disabled="getProductQty(product.id) >= product.stockActual"
                        >+</button>
                    </div>
                </div>
            </div>
            
            <!-- Pagination Controls -->
            <div class="pagination-controls" v-if="productsStore.totalPages > 1">
                <button 
                    class="page-btn"
                    :disabled="productsStore.currentPage === 0"
                    @click="changePage(productsStore.currentPage - 1)"
                >
                    ◄
                </button>
                <span class="page-info">{{ productsStore.currentPage + 1 }} / {{ productsStore.totalPages }}</span>
                <button 
                    class="page-btn"
                    :disabled="productsStore.currentPage >= productsStore.totalPages - 1"
                    @click="changePage(productsStore.currentPage + 1)"
                >
                    ►
                </button>
            </div>
        </div>
    </div>

    <!-- Right Column: Cart -->
    <div class="cart-section">
        <div class="cart-header">
            <h2>Resumen <span class="badge" v-if="cart.length > 0">#{{ cart.length }}</span></h2>
            <button v-if="cart.length > 0" @click="clearCart" class="clear-btn" title="Vaciar carrito">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
        </div>

        <div class="cart-items">
            <div v-if="cart.length === 0" class="empty-cart-msg">
                <p>Carrito vacío</p>
                <small>Agregue productos del panel izquierdo</small>
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
  </div>
</template>

<style scoped>
.pos-wrapper {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1rem;
    height: calc(100vh - 80px); /* Tweak to fit exactly without page scroll */
    overflow: hidden;
    padding-bottom: 0.5rem;
}

/* --- Left Column: Catalog --- */
.catalog-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden; /* Contains the scrollable grid */
    padding-bottom: 0;
}

.search-header {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-background);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border); /* Subtle border for input area */
}

.clean-search-input {
    border: none;
    background: transparent;
    width: 100%;
    outline: none;
    font-size: 1rem;
    color: var(--color-text);
}

.products-grid {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-right: 0.5rem;
    flex: 1; /* Take remaining space */
}

.product-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    /* removed transition and hover transform */
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
    margin-top: auto; /* Push to bottom */
}

.page-btn {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 1rem;
    color: var(--color-text);
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
} 

/* Removed product-icon style */

.product-info {
    flex: 1;
}

.product-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
}

.product-code {
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.product-pricing {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.price {
    font-weight: 700;
    color: var(--color-text);
}

.qty-stepper {
    display: flex;
    align-items: center;
    background: var(--color-background);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.step-btn {
    border: none;
    background: none;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-weight: bold;
    color: var(--color-text-muted);
    transition: background 0.2s;
}

.step-btn:hover:not(:disabled) {
    background: var(--color-surface-hover);
    color: var(--color-primary);
}

.step-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.qty-display {
    min-width: 30px;
    text-align: center;
    font-weight: 600;
    font-size: 0.9rem;
}

/* --- Right Column: Cart --- */
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

.cart-header h2 {
    margin: 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.badge {
    background: var(--color-success);
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 99px;
}

.clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-danger);
    font-size: 1.2rem;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.clear-btn:hover { opacity: 1; }

.cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.empty-cart-msg {
    text-align: center;
    color: var(--color-text-muted);
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child { border-bottom: none; }

.item-name {
    font-weight: 500;
    font-size: 0.95rem;
}

.item-meta {
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.item-total {
    font-weight: 600;
}

.cart-footer {
    padding: 1.5rem;
    background: var(--color-surface); /* or slightly darker */
    border-top: 1px solid var(--color-border);
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--color-text-muted);
}

.total-amount {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text);
}

.checkout-btn {
    width: 100%;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    padding: 1rem !important;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Response for smaller screens */
@media (max-width: 900px) {
    .pos-wrapper {
        grid-template-columns: 1fr;
        height: auto;
        overflow: visible;
    }
    
    .products-grid {
        max-height: 500px; /* Limit height on mobile so cart is reachable */
    }
    
    .cart-section {
        position: sticky;
        bottom: 0;
        z-index: 100;
        box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
    }
}
</style>
