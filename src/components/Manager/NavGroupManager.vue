<template>
  <div class="navgroup-manager">
    <div class="manager-header">
      <h2>Gestion des Groupes</h2>
      <button class="btn btn-primary" @click="showForm = true">+ Nouveau Groupe</button>
    </div>

    <!-- Formulaire d'ajout/édition -->
    <div v-if="showForm" class="form-modal">
      <div class="form-content">
        <h3>{{ editingGroup ? 'Modifier' : 'Créer' }} un Groupe</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Nom du Groupe</label>
            <input 
              id="name"
              v-model="formData.name" 
              type="text" 
              placeholder="Ex: Services, Ressources, À propos"
              required
            />
          </div>
          <div class="form-group">
            <label for="order">Ordre d'affichage</label>
            <input 
              id="order"
              v-model.number="formData.order" 
              type="number" 
              placeholder="0"
              min="0"
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-success">{{ editingGroup ? 'Mettre à jour' : 'Créer' }}</button>
            <button type="button" class="btn btn-secondary" @click="cancelForm">Annuler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Liste des groupes -->
    <div class="navgroups-list">
      <div v-if="navgroups.length === 0" class="empty-state">
        <p>Aucun groupe créé. Commencez par en ajouter un!</p>
      </div>
      
      <div v-for="group in navgroups" :key="group.id" class="navgroup-card">
        <div class="group-info">
          <h4>{{ group.name }}</h4>
          <p class="group-pages">{{ group.pages?.length || 0 }} page(s) associée(s)</p>
        </div>
        <div class="group-actions">
          <button class="btn btn-sm btn-warning" @click="editGroup(group)">✏️ Éditer</button>
          <button class="btn btn-sm btn-danger" @click="deleteGroup(group.id)">🗑️ Supprimer</button>
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
import { navGroupService } from '../../services/cmsService';

interface NavGroup {
  id: number;
  name: string;
  order: number;
  pages?: any[];
}

const navgroups = ref<NavGroup[]>([]);
const showForm = ref(false);
const editingGroup = ref<NavGroup | null>(null);
const formData = ref({ name: '', order: 0 });
const notification = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

const loadNavGroups = async () => {
  try {
    const { data } = await navGroupService.getAllNavGroups();
    navgroups.value = data.sort((a: NavGroup, b: NavGroup) => a.order - b.order);
  } catch (error) {
    showNotification('Erreur lors du chargement des groupes', 'error');
  }
};

const editGroup = (group: NavGroup) => {
  editingGroup.value = group;
  formData.value = { name: group.name, order: group.order };
  showForm.value = true;
};

const submitForm = async () => {
  try {
    if (editingGroup.value) {
      await navGroupService.updateNavGroup(editingGroup.value.id, formData.value);
      showNotification('Groupe mis à jour avec succès', 'success');
    } else {
      await navGroupService.createNavGroup(formData.value);
      showNotification('Groupe créé avec succès', 'success');
    }
    cancelForm();
    loadNavGroups();
  } catch (error) {
    showNotification('Erreur lors de la sauvegarde', 'error');
  }
};

const deleteGroup = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe? Les pages seront dissociées mais non supprimées.')) return;
  
  try {
    await navGroupService.deleteNavGroup(id);
    showNotification('Groupe supprimé avec succès', 'success');
    loadNavGroups();
  } catch (error) {
    showNotification('Erreur lors de la suppression', 'error');
  }
};

const cancelForm = () => {
  showForm.value = false;
  editingGroup.value = null;
  formData.value = { name: '', order: 0 };
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

onMounted(() => {
  loadNavGroups();
});
</script>

<style scoped>
.navgroup-manager {
  padding: 20px;
}

.navgroup-card {
  background: var(--background-2);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.navgroup-card:hover {
  background: var(--background-1);
  box-shadow: var(--shadow-md);
}

.group-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--text-white);
}

.group-info .group-pages {
  margin: 0;
  font-size: 12px;
  color: var(--text-light);
}

.group-actions {
  display: flex;
  gap: 8px;
}

.navgroups-list {
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
</style>
