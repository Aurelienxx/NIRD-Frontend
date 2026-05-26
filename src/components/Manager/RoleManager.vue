<template>
  <div class="role-manager">
    <div class="manager-header">
      <h2>Gestion des Rôles</h2>
      <button class="btn btn-primary" @click="showForm = true">+ Nouveau Rôle</button>
    </div>

    <!-- Formulaire d'ajout/édition -->
    <div v-if="showForm" class="form-modal">
      <div class="form-content">
        <h3>{{ editingRole ? 'Modifier' : 'Créer' }} un Rôle</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Nom du Rôle</label>
            <input 
              id="name"
              v-model="formData.name" 
              type="text" 
              placeholder="Ex: Administrateur, Modérateur, Auteur"
              required
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-success">{{ editingRole ? 'Mettre à jour' : 'Créer' }}</button>
            <button type="button" class="btn btn-secondary" @click="cancelForm">Annuler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Liste des rôles -->
    <div class="roles-list">
      <div v-if="roles.length === 0" class="empty-state">
        <p>Aucun rôle créé. Commencez par en ajouter un!</p>
      </div>
      
      <div v-for="role in roles" :key="role.id" class="role-card">
        <div class="role-info">
          <h4>{{ role.name }}</h4>
          <p class="role-id">ID: {{ role.id }}</p>
        </div>
        <div class="role-actions">
          <button class="btn btn-sm btn-warning" @click="editRole(role)">✏️ Éditer</button>
          <button class="btn btn-sm btn-danger" @click="deleteRole(role.id)">🗑️ Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <Transition name="toast">
      <div v-if="notification" :class="['toast', notification.type]">
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { roleService } from '../../services/cmsService';

interface Role {
  id: number;
  name: string;
}

const roles = ref<Role[]>([]);
const showForm = ref(false);
const editingRole = ref<Role | null>(null);
const formData = ref({ name: '' });
const notification = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

const loadRoles = async () => {
  try {
    const { data } = await roleService.getAllRoles();
    roles.value = data;
  } catch (error) {
    showNotification('Erreur lors du chargement des rôles', 'error');
  }
};

const editRole = (role: Role) => {
  editingRole.value = role;
  formData.value = { name: role.name };
  showForm.value = true;
};

const submitForm = async () => {
  try {
    if (editingRole.value) {
      await roleService.updateRole(editingRole.value.id, formData.value);
      showNotification('Rôle mis à jour avec succès', 'success');
    } else {
      await roleService.createRole(formData.value);
      showNotification('Rôle créé avec succès', 'success');
    }
    cancelForm();
    loadRoles();
  } catch (error) {
    showNotification('Erreur lors de la sauvegarde', 'error');
  }
};

const deleteRole = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle?')) return;
  
  try {
    await roleService.deleteRole(id);
    showNotification('Rôle supprimé avec succès', 'success');
    loadRoles();
  } catch (error) {
    showNotification('Erreur lors de la suppression', 'error');
  }
};

const cancelForm = () => {
  showForm.value = false;
  editingRole.value = null;
  formData.value = { name: '' };
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

onMounted(() => {
  loadRoles();
});
</script>

<style scoped>
.role-manager {
  padding: 20px;
}

.role-card {
  background: var(--background-2);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.role-card:hover {
  background: var(--background-1);
  box-shadow: var(--shadow-md);
}

.role-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--text-white);
}

.role-info .role-id {
  margin: 0;
  font-size: 12px;
  color: var(--text-light);
}

.role-actions {
  display: flex;
  gap: 8px;
}

.roles-list {
  display: grid;
  gap: 15px;
}

.form-content {
  background: var(--background-2);
  color: var(--text-white);
}

.form-content h3 {
  color: var(--text-white);
}

.form-group input {
  background: var(--background-1);
  color: var(--text-white);
  border-color: var(--background-3);
}

.form-group input:focus {
  border-color: var(--lk-1);
}

.toast.info {
  background: #17a2b8;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
