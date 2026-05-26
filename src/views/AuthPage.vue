<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-toggle">
        <button :class="['toggle-btn', { active: isLogin }]" @click="isLogin = true">Connexion</button>
        <button :class="['toggle-btn', { active: !isLogin }]" @click="isLogin = false">Inscription</button>
      </div>

      <!-- Messages via le Store -->
      <div v-if="auth.errorMessage" class="message error-message">{{ auth.errorMessage }}</div>
      <div v-if="auth.successMessage" class="message success-message">{{ auth.successMessage }}</div>

      <transition name="slide">
        <!-- FORMULAIRE DE CONNEXION -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
          <h2>Connexion</h2>
          <div class="form-group">
            <label>Email</label>
            <input v-model="loginForm.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input v-model="loginForm.password" type="password" required />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="auth.loading">
            {{ auth.loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <!-- FORMULAIRE D'INSCRIPTION -->
        <form v-else @submit.prevent="handleSignup" class="auth-form">
          <h2>Inscription</h2>
          <div class="form-group">
            <label>Nom complet</label>
            <input v-model="signupForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="signupForm.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input v-model="signupForm.password" type="password" required />
          </div>

          <div class="form-group">
            <label>Sélectionner votre rôle (optionnel)</label>
            <select v-model="signupForm.role">
              <option value="">-- Rôle par défaut (Membre) --</option>
              <option v-for="role in selectableRoles" :key="role.id" :value="role.name">
                {{ role.name }}
              </option>
            </select>
            <p v-if="availableRoles.length === 0" class="loading-text">Chargement des rôles...</p>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="auth.loading">
            S'inscrire
          </button>
        </form>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../services/authService';
import { useRouter } from 'vue-router';
import { roleService } from '../services/roleService';

const auth = useAuthStore();
const router = useRouter();
const isLogin = ref(true);
const availableRoles = ref<any[]>([]);

const selectableRoles = computed(() => {
  return availableRoles.value.filter(role => 
    role.name !== 'MEMBRE' && role.name !== 'ADMIN'
  );
});

const loginForm = ref({ email: '', password: '' });
const signupForm = ref({ name: '', email: '', password: '', role: '' });

onMounted(async () => {
  try {
    availableRoles.value = await roleService.getAll();
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
  }
});

const handleLogin = async () => {
  const success = await auth.login(loginForm.value);
  if (success) {
    setTimeout(() => router.push('/'), 1500);
  }
};

const handleSignup = async () => {
  const success = await auth.signup(signupForm.value);
  if (success) {
    isLogin.value = true;
    signupForm.value = { name: '', email: '', password: '', role: '' };
  }
};
</script>

<style scoped>
/* ============================================
   UNIQUE STYLES - Auth Page
   ============================================ */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--background-1) 0%, var(--background-2) 100%);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--background-2);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.auth-toggle {
  display: flex;
  background: var(--background-3);
}

.toggle-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.toggle-btn:hover {
  color: var(--text-white);
}

.toggle-btn.active {
  color: var(--lk-1);
}

.toggle-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--lk-1), var(--lk-2));
  border-radius: 2px;
}

.auth-form {
  padding: 2.5rem 2rem;
  animation: fadeIn 0.3s ease;
}

.auth-form h2 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  color: var(--text-white);
  border-bottom: none;
}

.auth-form h2::after {
  display: none;
}

.message {
  margin: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.error-message {
  background-color: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border-left: 4px solid #ff3b30;
}

.success-message {
  background-color: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border-left: 4px solid #34d399;
}

.forgot-password {
  display: inline-block;
  margin-top: 1rem;
  color: var(--lk-1);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--lk-2);
  text-decoration: underline;
}

/* Transitions spécifiques */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.form-group select option {
  background: var(--background-2);
  color: var(--text-white);
  padding: 0.5rem;
}

.loading-text {
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
  text-align: center;
}

/* Responsive */
@media (max-width: 640px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    max-width: 100%;
  }

  .auth-form {
    padding: 1.5rem;
  }

  .auth-form h2 {
    font-size: 1.5rem;
  }

  .toggle-btn {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
