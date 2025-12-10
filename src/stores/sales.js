import { defineStore } from 'pinia';
import api from '@/services/api';

export const useSalesStore = defineStore('sales', {
    state: () => ({
        sales: [],
        loading: false,
        error: null,
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        pageSize: 10
    }),
    actions: {
        async fetchSales(page = 0, filters = {}) {
            this.loading = true;
            this.error = null;
            try {
                const params = {
                    page: page + 1, // Backend expects 1-based index
                    size: this.pageSize,
                    ...filters
                };
                const response = await api.get('/ventas', { params });
                this.sales = response.data.content;
                this.totalPages = response.data.totalPages;
                this.totalElements = response.data.totalElements;
                this.currentPage = page;
            } catch (err) {
                this.error = 'Error al cargar ventas';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async downloadReport(startDate, endDate) {
            if (!startDate || !endDate) {
                alert('Seleccione un rango de fechas');
                return;
            }
            try {
                const response = await api.get('/ventas/reporte-pdf', {
                    params: { fechaInicio: startDate, fechaFin: endDate },
                    responseType: 'blob'
                });

                // Create download link
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'reporte_ventas.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (err) {
                console.error('Error downloading PDF:', err);
                alert('Error al descargar el reporte');
            }
        },
        async createManualSale(saleData) {
            try {
                await api.post('/ventas/manual', saleData);
                await this.fetchSales(this.currentPage);
            } catch (err) {
                console.error('Error creating manual sale', err);
                throw err;
            }
        },
        async updateSale(id, data) {
            try {
                // Assuming endpoint format PUT /ventas/{id}
                await api.put(`/ventas/${id}`, data);
                await this.fetchSales(this.currentPage);
            } catch (err) {
                throw err;
            }
        },
        async createSale(saleRequest) {
            this.loading = true;
            try {
                const response = await api.post('/ventas/emitir-boleta', saleRequest);
                return response.data;
            } catch (err) {
                console.error('Error issuing sale:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async fetchSaleDetails(id) {
            // We usually don't set global loading here to avoid flickering the main list if we are just opening a modal
            // But we can if we want. Let's just return the data.
            try {
                const response = await api.get(`/ventas/${id}/detalles`);
                return response.data;
            } catch (err) {
                console.error('Error fetching details:', err);
                throw err;
            }
        }
    }
});
