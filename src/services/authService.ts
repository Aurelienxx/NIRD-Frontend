import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from './userService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const roles = ref<any[]>([]);
  const token = ref(localStorage.getItem('authToken') || null);
  const loading = ref(false);
  const errorMessage = ref('');
  const successMessage = ref('');

  const isAuthenticated = computed(() => !!token.value);

  // Charger les données utilisateur depuis le localStorage au démarrage
  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('authUser');
    const storedRoles = localStorage.getItem('authRoles');
    
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
    if (storedRoles) {
      roles.value = JSON.parse(storedRoles);
    }
  }

  // Initialiser au chargement du store
  loadUserFromStorage();

  async function login(credentials: any) {
    loading.value = true;
    errorMessage.value = '';
    try {
      const response = await userService.login(credentials);
      
      token.value = response.token;
      user.value = response.user;
      roles.value = response.user.roles || [];
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(response.user));
      localStorage.setItem('authRoles', JSON.stringify(response.user.roles || []));
      
      successMessage.value = `Bienvenue ${response.user.name || response.user.email}!`;
      return true;
    } catch (error: any) {
      errorMessage.value = error.response?.data?.error || 'Erreur de connexion';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function signup(userData: any) {
    loading.value = true;
    errorMessage.value = '';
    try {
      const newUser = await userService.create(userData);
      successMessage.value = `Inscription réussie pour ${newUser.name}`;
      return true;
    } catch (error: any) {
      errorMessage.value = error.message || "Erreur lors de l'inscription";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    roles.value = [];
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('authRoles');
    window.location.href = '/';
  }

  return { 
    user, 
    roles,
    token, 
    loading, 
    errorMessage, 
    successMessage, 
    isAuthenticated, 
    login, 
    signup, 
    logout,
    loadUserFromStorage
  };
});