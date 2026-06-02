<template>
  <main class="profile-container">
    <div class="profile-wrapper">
      <div v-if="authStore.isAuthenticated" class="profile-content">
        <!-- Carte de profil -->
        <div class="profile-card">
          <div class="profile-header">
            <h1>Mon Profil</h1>
          </div>

          <!-- Mode Affichage -->
          <div v-if="!isEditing" class="profile-info">
            <div class="info-group">
              <label>Nom :</label>
              <span>{{ authStore.user?.name || 'Non disponible' }}</span>
            </div>
            
            <div class="info-group">
              <label>Email :</label>
              <span>{{ authStore.user?.email || 'Non disponible' }}</span>
            </div>

            <div class="info-group">
              <label>Localité :</label>
              <span v-if="userPlace">
                <strong>{{ userPlace.name }}</strong> - {{ userPlace.address }}
              </span>
              <span v-else class="not-assigned">Aucune localité assignée</span>
            </div>

            <div class="info-group" v-if="userPlace && userPlace.description">
              <label>Description :</label>
              <span>{{ userPlace.description }}</span>
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

          <!-- Mode Édition -->
          <div v-else class="profile-edit-form">
            <div class="form-group">
              <label for="name">Nom :</label>
              <input 
                id="name"
                v-model="formData.name" 
                type="text" 
                class="form-input"
                placeholder="Votre nom"
              />
            </div>

            <div class="form-group">
              <label for="email">Email :</label>
              <input 
                id="email"
                v-model="formData.email" 
                type="email" 
                class="form-input"
                placeholder="votre@email.com"
                disabled
              />
              <small class="form-hint">L'email ne peut pas être modifié</small>
            </div>

            <div class="form-group">
              <label for="place">Localité :</label>
              <n-select
                v-model:value="formData.placeId"
                :options="placeOptions"
                :disabled="places.length === 0"
                placeholder="Choisir une localité"
                clearable
              />
            </div>

            <div class="form-info" v-if="selectedPlace">
              <p><strong>{{ selectedPlace.name }}</strong></p>
              <p>{{ selectedPlace.description }}</p>
              <p>{{ selectedPlace.address }}</p>
            </div>

            <div class="form-actions">
              <button @click="saveProfile" class="btn btn-success" :disabled="isSaving">
                {{ isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder' }}
              </button>
              <button @click="cancelEditing" class="btn btn-secondary" :disabled="isSaving">
                Annuler
              </button>
            </div>

            <div v-if="errorMessage" class="error-message">
              ⚠️ {{ errorMessage }}
            </div>
          </div>

          <div class="profile-actions">
            <button 
              v-if="!isEditing" 
              @click="startEditing" 
              class="btn btn-primary btn-small"
            >
              Modifier le profil
            </button>
            <button @click="handleLogout" class="btn btn-danger">
            Se déconnecter
            </button>
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
import { ref, computed } from 'vue';
import { NSelect } from 'naive-ui'
import { useAuthStore } from '../services/authService';
import { useRouter } from 'vue-router';
import { userService } from '../services/userService';
import { placeService } from '../services/placeService';

const authStore = useAuthStore();
const router = useRouter();

const isEditing = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');

const places = ref<any[]>([]);
const placeOptions = ref<any[]>([]);

const formData = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  placeId: (authStore.user as any)?.placeId || null,
});

const userPlace = computed(() => {
  if (!(authStore.user as any)?.place) return null;
  return (authStore.user as any).place;
});

const selectedPlace = computed(() => {
  if (!formData.value.placeId) return null;
  return places.value.find(p => p.id === formData.value.placeId) || null;
});

const startEditing = async () => {
  try {
    // Charger les places disponibles SEULEMENT quand on passe en mode édition
    if (places.value.length === 0) {
      places.value = await placeService.getAllPlaces();
      placeOptions.value = places.value.map(p => ({
        label: `${p.name} - ${p.address}`,
        value: p.id
      }));
    }

    // Initialiser le formulaire
    formData.value = {
      name: authStore.user?.name || '',
      email: authStore.user?.email || '',
      placeId: (authStore.user as any)?.placeId || null,
    };
    errorMessage.value = '';
    isEditing.value = true;
  } catch (error) {
    console.error('Erreur lors du chargement des localités:', error);
    errorMessage.value = 'Erreur lors du chargement des localités';
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  errorMessage.value = '';
};

const saveProfile = async () => {
  try {
    errorMessage.value = '';
    isSaving.value = true;

    if (!authStore.user?.id) {
      throw new Error('ID utilisateur non trouvé');
    }

    // Préparer les données à envoyer
    const updateData: any = {
      name: formData.value.name,
      placeId: formData.value.placeId // Toujours envoyer la placeId (peut être null)
    };

    // Mettre à jour l'utilisateur
    const updatedUser = await userService.update(authStore.user.id, updateData);

    // Mettre à jour le store
    authStore.user = updatedUser;

    isEditing.value = false;
    isSaving.value = false;
  } catch (error: any) {
    isSaving.value = false;
    errorMessage.value = error.message || 'Erreur lors de la sauvegarde du profil';
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: var(--background-1);
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

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-card h1 {
  font-size: 1.8rem;
  margin: 0;
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
  min-width: 150px;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.not-assigned {
  color: var(--text-light);
  font-style: italic;
}

/* Formulaire d'édition */
.profile-edit-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-white);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--background-3);
  border-radius: 4px;
  background: var(--background-1);
  color: var(--text-white);
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.form-input:disabled {
  background: var(--background-3);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.form-info {
  background: var(--background-1);
  border-left: 4px solid #17a2b8;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form-info p {
  margin: 0.5rem 0;
  color: var(--text-light);
}

.form-info strong {
  color: var(--text-white);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  margin-top: 1rem;
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
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  opacity: 1;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.not-authenticated {
  text-align: center;
  padding: 3rem;
  background: var(--background-2);
  border-radius: 8px;
}

.not-authenticated p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--text-light);
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
