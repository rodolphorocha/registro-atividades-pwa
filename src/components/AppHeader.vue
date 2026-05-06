<template>
  <header class="app-header">
    <h1>Meu gestor de Tarefas!!!!</h1>

    <nav>
      <router-link to="/">Início</router-link>
      <router-link to="/about">Sobre</router-link>
      <router-link to="/register">Criar conta</router-link>


      <span v-if="authStore.userEmail" class="user-email">
        {{ authStore.userEmail }}
      </span>

      <button
        v-if="authStore.isAuthenticated"
        class="logout-btn"
        @click="handleLogout"
      >
        Sair
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between; /* corrigido */
  align-items: center;
  padding: 16px 0;
  border-bottom: 2px solid #4a90d9;
  margin-bottom: 24px;
}

.app-header h1 {
  font-size: 1.4rem;
  color: #4a90d9;
}

nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

nav a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

nav a.router-link-active {
  color: #4a90d9;
}

.user-email {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

.logout-btn {
  padding: 6px 10px;
  border: none;
  background: #e74c3c;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c0392b;
}
</style>
