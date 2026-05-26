<template>
  <div class="page-manager">
    <div class="manager-header">
      <h2>Gestion des Pages</h2>
      <button class="btn btn-primary" @click="createNewPage">+ Nouvelle Page</button>
    </div>

    <div class="page-container">
      <!-- Liste des pages -->
      <div class="pages-list">
        <div v-if="pages.length === 0" class="empty-state">
          <p>Aucune page créée</p>
        </div>
        
        <div v-for="page in pages" :key="page.id" class="page-item" :class="{ active: editingPage?.id === page.id }">
          <div class="page-item-info" @click="editPage(page)">
            <h4>{{ page.title }}</h4>
            <p class="page-slug">{{ page.slug }}</p>
            <p class="page-location">📍 {{ page.location }}</p>
          </div>
          <button class="btn btn-sm btn-danger" @click="deletePage(page.id!)">🗑️</button>
        </div>
      </div>

      <!-- Éditeur de page -->
      <div class="page-editor">
        <div v-if="editingPage" class="editor-wrapper">
          <form @submit.prevent="() => savePage()"
            <!-- Informations de base -->
            <div class="form-section">
              <h3>Informations de la page</h3>
              
              <div class="form-group">
                <label for="title">Titre</label>
                <input 
                  id="title"
                  v-model="editingPage.title" 
                  type="text" 
                  placeholder="Titre de la page"
                  required
                />
              </div>

              <div class="form-group">
                <label for="slug">Slug (URL)</label>
                <input 
                  id="slug"
                  v-model="editingPage.slug" 
                  type="text" 
                  placeholder="slug-de-la-page"
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="type">Type de page</label>
                  <select v-model="editingPage.type" id="type">
                    <option value="SIMPLE">Simple</option>
                    <option value="ARTICLE">Article</option>
                    <option value="ANNONCES">Annonces</option>
                    <option value="DOCUMENTS">Documents</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="location">Position</label>
                  <select v-model="editingPage.location" id="location">
                    <option value="HEADER">Header</option>
                    <option value="BURGER">Menu burger</option>
                    <option value="HIDDEN">Masquée</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="navgroup">Groupe de navigation</label>
                  <select v-model.number="editingPage.navGroupId" id="navgroup">
                    <option :value="null">Aucun groupe</option>
                    <option v-for="group in navgroups" :key="group.id" :value="group.id">
                      {{ group.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="order">Ordre</label>
                  <input 
                    id="order"
                    v-model.number="editingPage.order" 
                    type="number" 
                    min="0"
                  />
                </div>
              </div>
            </div>

            <!-- Sélection des rôles -->
            <div class="form-section">
              <h3>Rôles autorisés</h3>
              <p class="section-hint">Laissez vide pour laisser la page publique</p>
              <div class="roles-checkboxes">
                <label v-for="role in roles" :key="role.id" class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :value="role.id"
                    :checked="editingPage.allowedRoles?.some((r: any) => r.id === role.id)"
                    @change="toggleRole(role.id)"
                  />
                  {{ role.name }}
                </label>
              </div>
            </div>

            <div class="form-section">
              <h3>Contenu</h3>
              <!-- On écoute l'événement @save émis par l'éditeur -->
              <RichTextEditor 
                v-model="editingPage.layout" 
                @save="savePage" 
              />
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="submit" class="btn btn-success">💾 Sauvegarder</button>
              <button type="button" class="btn btn-secondary" @click="cancelEdit">Annuler</button>
            </div>
          </form>
        </div>

        <div v-else class="no-selection">
          <p>Sélectionnez une page à éditer ou créez-en une nouvelle</p>
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
import { pageService, navGroupService, roleService } from '../../services/cmsService';
import RichTextEditor from '../Admin/RichTextEditor.vue';

interface Page {
  id?: number;
  title: string;
  slug: string;
  location: string;
  order: number;
  navGroupId: number | null;
  layout: string;
  type: string;
  allowedRoles?: any[];
}

const pages = ref<Page[]>([]);
const navgroups = ref<any[]>([]);
const roles = ref<any[]>([]);
const editingPage = ref<Page | null>(null);
const notification = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

const loadPages = async () => {
  try {
    const { data } = await pageService.getAllPages();
    pages.value = data;
  } catch (error) {
    showNotification('Erreur lors du chargement des pages', 'error');
  }
};

const loadNavGroups = async () => {
  try {
    const { data } = await navGroupService.getAllNavGroups();
    navgroups.value = data;
  } catch (error) {
    console.error('Erreur chargement navgroups', error);
  }
};

const loadRoles = async () => {
  try {
    const { data } = await roleService.getAllRoles();
    roles.value = data;
  } catch (error) {
    console.error('Erreur chargement rôles', error);
  }
};

const createNewPage = () => {
  editingPage.value = {
    title: '',
    slug: '',
    location: 'HIDDEN',
    order: 0,
    navGroupId: null,
    layout: '[]',
    type: 'SIMPLE',
    allowedRoles: []
  };
};

const editPage = (page: Page) => {
  editingPage.value = { ...page };
};

const toggleRole = (roleId: number) => {
  if (!editingPage.value) return;
  if (!editingPage.value.allowedRoles) {
    editingPage.value.allowedRoles = [];
  }
  
  const index = editingPage.value.allowedRoles.findIndex((r: any) => r.id === roleId);
  if (index > -1) {
    editingPage.value.allowedRoles.splice(index, 1);
  } else {
    editingPage.value.allowedRoles.push({ id: roleId });
  }
};

const savePage = async (updatedContent?: string) => {
  if (!editingPage.value) return;

  // 1. Si updatedContent est passé (via @save de l'éditeur), on l'utilise.
  // 2. Sinon, on utilise editingPage.value.layout (mis à jour par le v-model).
  const finalContent = (typeof updatedContent === 'string') 
    ? updatedContent 
    : editingPage.value.layout;

  try {
    const pageData = {
      title: editingPage.value.title,
      slug: editingPage.value.slug,
      location: editingPage.value.location,
      order: editingPage.value.order,
      navGroupId: editingPage.value.navGroupId,
      layout: finalContent, // On utilise la constante sécurisée ici
      type: editingPage.value.type,
      roleIds: editingPage.value.allowedRoles?.map((r: any) => r.id) || []
    };

    if (editingPage.value.id) {
      await pageService.updatePage(editingPage.value.id, pageData);
      showNotification('Page mise à jour avec succès', 'success');
    } else {
      await pageService.createPage(pageData);
      showNotification('Page créée avec succès', 'success');
    }

    loadPages();
  } catch (error: any) {
    showNotification(error.response?.data?.error || 'Erreur lors de la sauvegarde', 'error');
  }
};

const deletePage = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette page?')) return;

  try {
    await pageService.deletePage(id);
    showNotification('Page supprimée avec succès', 'success');
    if (editingPage.value?.id === id) {
      editingPage.value = null;
    }
    loadPages();
  } catch (error) {
    showNotification('Erreur lors de la suppression', 'error');
  }
};

const cancelEdit = () => {
  editingPage.value = null;
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

onMounted(() => {
  loadPages();
  loadNavGroups();
  loadRoles();
});
</script>

<style scoped>
.page-manager {
  padding: 20px;
  min-height: 100vh;
}

.page-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  min-height: calc(100vh - 150px);
}

.pages-list {
  background: var(--background-2);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.page-item {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.page-item:hover {
  background: var(--background-1);
}

.page-item.active {
  background: #007bff;
  color: white;
}

.page-item.active .page-slug,
.page-item.active .page-location {
  color: #e7f3ff;
}

.page-item-info {
  flex: 1;
}

.page-item-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-white);
}

.page-slug,
.page-location {
  margin: 2px 0;
  font-size: 12px;
  color: var(--text-white);
}

.page-editor {
  background: var(--background-2);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow-y: auto;
  padding: 25px;
}

.editor-wrapper form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-light);
  text-align: center;
}

.form-group input,
.form-group select {
  background-color: var(--background-1);
  color: var(--text-white);
  border-color: var(--background-3);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--lk-1);
  box-shadow: 0 0 0 3px rgba(96, 198, 255, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

@media (max-width: 768px) {
  .page-container {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
