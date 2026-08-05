<template>
  <div class="register-container">
    <h1>Criar conta</h1>

    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Senha" required />
      <input v-model="confirmPassword" type="password" placeholder="Confirmar senha" required />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit">Cadastrar</button>
    </form>

    <router-link to="/login">Já tem conta? Entrar</router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/api/authApi';

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem';
    return;
  }

  try {
    await authApi.register(email.value, password.value);

    router.push('/login?registered=true');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail || 'Erro ao cadastrar';
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: auto;
}

.error {
  color: red;
  margin: 10px 0;
}
</style>
