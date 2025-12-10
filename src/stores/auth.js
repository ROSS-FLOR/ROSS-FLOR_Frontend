import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/login', { username, password });
                console.log('Login Response:', response.data);

                // Handle different token field names (backend documentation says 'jwt', but standard is often 'token')
                const token = response.data.jwt || response.data.token || response.data.accessToken;

                if (!token) {
                    throw new Error('No authentication token found in response');
                }

                this.token = token;
                this.user = { username };

                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return true;
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },
        async register(username, password) {
            try {
                await api.post('/register', { username, password });
                // Automatically login after register? Or redirect to login?
                // User request says "Crea un nuevo usuario".
                return true;
            } catch (error) {
                console.error('Registration failed:', error);
                throw error;
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});
