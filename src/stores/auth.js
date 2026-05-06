import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import * as authApi from '../api/authApi';
import api from '../api/config';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token'));
  const refreshToken = ref(localStorage.getItem('refresh_token'));

  const isAuthenticated = computed(() => !!accessToken.value);

  const userEmail = computed(() => {
    if (!accessToken.value) return null;

    try {
      const payload = JSON.parse(
        atob(accessToken.value.split('.')[1])
      );
      return payload.sub;
    } catch (e) {
      return null;
    }
  });

  async function login(email, password) {
    const { data } = await authApi.login(email, password);

    accessToken.value = data.access_token;
    refreshToken.value = data.refresh_token;

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  }

  async function register(email, password) {
    return authApi.register(email, password);
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    userEmail,
    login,
    register,
    logout,
  };
});
