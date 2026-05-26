<template>
  <main class="profile-container">
    <div class="profile-wrapper">
      <div v-if="authStore.isAuthenticated" class="profile-content">
        <!-- Carte de profil -->
        <div class="profile-card">
          <h1>Mon Profil</h1>
          
          <div class="profile-info">
            <div class="info-group">
              <label>Nom :</label>
              <span>{{ authStore.user?.name || 'Non disponible' }}</span>
            </div>
            
            <div class="info-group">
              <label>Email :</label>
              <span>{{ authStore.user?.email || 'Non disponible' }}</span>
            </div>
            
            <div class="info-group">
              <label>Rôles :</label>
              <div class="roles-list">
                <span v-if="authStore.roles && authStore.roles.length > 0" class="role-badge" v-for="role in authStore.roles" :key="role.id">
                  {{ role.name }}
                </span>
                <span v-else class="role-badge">Aucun rôle assigné</span>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <button @click="handleLogout" class="btn btn-secondary">Se déconnecter</button>
          </div>
        </div>
      </div>


      <div v-else class="not-authenticated">
        <p>Vous n'êtes pas connecté.</p>
        <router-link to="/auth" class="btn btn-primary">Se connecter</router-link>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useAuthStore } from '../services/authService';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

.profile-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  border-radius: 8px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  background: var(--background-2);
}

.profile-card h1 {
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.profile-info {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--background-3);
}

.info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--background-3);
}

.info-group:last-child {
  border-bottom: none;
}

.info-group span {
  color: var(--text-light);
}

.info-group label {
  font-weight: 700;
  color: var(--text-white);
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #dc3545;
  color: white;
}

.btn-secondary:hover {
  opacity: 0.9;
}


.not-authenticated {
  padding: 3rem;
  background: var(--background-1);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
}

.not-authenticated p {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: var(--text-light);
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  display: inline-block;
  background: #007bff;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}
</style>
