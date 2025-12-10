import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/',
            redirect: '/boleta',
            meta: { requiresAuth: true }
        },
        {
            path: '/products',
            name: 'products',
            component: () => import('../views/ProductsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/sales',
            name: 'sales',
            component: () => import('../views/SalesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/boleta',
            name: 'boleta',
            component: () => import('../views/BoletasView.vue'),
            meta: { requiresAuth: true }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    } else if (to.name === 'login' && authStore.isAuthenticated) {
        next('/boleta');
    } else {
        next();
    }
});

export default router;
