import { defineStore } from 'pinia';
import api from '@/services/api';

export const useProductsStore = defineStore('products', {
    state: () => ({
        products: [],
        loading: false,
        error: null,
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        pageSize: 10
    }),
    actions: {
        async fetchProducts(page = 0, search = '', category = '', size = null) {
            this.loading = true;
            this.error = null;
            try {
                const params = {
                    page: page,
                    size: size || this.pageSize,
                    busqueda: search || undefined,
                    categoria: category || undefined
                };
                const response = await api.get('/productos', { params });
                // Response format: { content: [], totalPages: 1, ... }
                this.products = response.data.content;
                this.totalPages = response.data.totalPages;
                this.totalElements = response.data.totalElements;
                this.currentPage = page;
            } catch (err) {
                this.error = 'Error al cargar productos';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async createProduct(productData) {
            try {
                await api.post('/productos', productData);
                await this.fetchProducts(this.currentPage);
            } catch (err) {
                throw err;
            }
        },
        async updateProduct(id, productData) {
            try {
                await api.put(`/productos/${id}`, productData);
                await this.fetchProducts(this.currentPage);
            } catch (err) {
                throw err;
            }
        },
        async deleteProduct(id) {
            try {
                await api.delete(`/productos/${id}`);
                await this.fetchProducts(this.currentPage);
            } catch (err) {
                console.error('Error al eliminar producto', err);
                throw err;
            }
        },
        async sellProduct(id, amount, price) {
            try {
                const payload = {
                    cantidad: amount,
                    precioVenta: price // sending as precioVenta based on common patterns, if backend expects something else user might need to adjust
                };
                await api.post(`/productos/${id}/vender`, payload);
                await this.fetchProducts(this.currentPage); // Refresh stock
            } catch (err) {
                throw err;
            }
        }
    }
});
