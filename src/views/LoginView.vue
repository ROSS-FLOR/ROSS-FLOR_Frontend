<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = '';
  isLoading.value = true;
  
  if (!username.value || !password.value) {
    error.value = 'Por favor complete todos los campos';
    isLoading.value = false;
    return;
  }

  // Basic SQL injection prevention regex
  // Allows alphanumeric, @, ., _, -
  const validUsernameRegex = /^[a-zA-Z0-9@._-]+$/;
  if (!validUsernameRegex.test(username.value)) {
    error.value = 'El usuario contiene caracteres no permitidos';
    isLoading.value = false;
    return;
  }

  try {
    await authStore.login(username.value, password.value);
    router.push('/boleta');
  } catch (err) {
    if (err.response && err.response.status === 401) {
       error.value = 'Credenciales inválidas';
    } else {
       error.value = 'Error al iniciar sesión. Intente nuevamente.';
    }
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <h1>Bienvenido</h1>
        <p>Ross&Flor</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="form">
        <BaseInput 
          label="Usuario" 
          v-model="username" 
          placeholder="Ingrese su usuario" 
          required 
        />
        
        <BaseInput 
          label="Contraseña" 
          v-model="password" 
          type="password" 
          placeholder="••••••••" 
          required 
        />
        
        <div v-if="error" class="error-msg">
          {{ error }}
        </div>
        
        <BaseButton type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Cargando...' : 'Ingresar' }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Subtract navbar height approximately to center in view */
  min-height: calc(100vh - 4rem); 
  width: 100%;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.header h1 {
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.header p {
  color: var(--color-text-muted);
}

.form {
  display: flex;
  flex-direction: column;
}

.error-msg {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-align: center;
}

.submit-btn {
  margin-top: 1rem;
  width: 100%;
}
</style>
