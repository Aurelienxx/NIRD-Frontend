<template>
  <div class="page-list">
    <div class="list-header">
      <h3>Pages du site</h3>
      <button @click="$emit('create')" class="btn btn-primary">
        + Nouvelle page
      </button>
    </div>

    <div v-if="pages.length === 0" class="empty-state">
      <p>Aucune page créée. Créez votre première page !</p>
    </div>

    <div v-else class="list-container">
      <!-- Filtres -->
      <div class="filters">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher une page..."
          class="search-input"
        />
        <select v-model="filterPublished" class="filter-select">
          <option value="">Tous les statuts</option>
          <option value="true">Publiées</option>
          <option value="false">Brouillons</option>
        </select>
      </div>

      <!-- Liste des pages -->
      <div class="pages-table">
        <div class="table-header">
          <div class="col-title">Titre</div>
          <div class="col-slug">URL</div>
          <div class="col-status">Statut</div>
          <div class="col-date">Modifiée</div>
          <div class="col-actions">Actions</div>
        </div>

        <div
          v-for="page in filteredPages"
          :key="page.id"
          class="table-row"
          :class="{ draft: !page.published }"
        >
          <div class="col-title">
            <button @click="$emit('select', page)" class="page-title-btn">
              {{ page.title }}
            </button>
          </div>
          <div class="col-slug">
            <span class="slug-badge">/{{ page.slug }}</span>
          </div>
          <div class="col-status">
            <span :class="['status-badge', page.published ? 'published' : 'draft']">
              {{ page.published ? 'Publiée' : 'Brouillon' }}
            </span>
          </div>
          <div class="col-date">
            {{ formatDate(page.updatedAt) }}
          </div>
          <div class="col-actions">
            <button
              @click="$emit('select', page)"
              class="btn-action btn-edit"
              title="Éditer"
            >
              ✎
            </button>
            <button
              @click="confirmDelete(page)"
              class="btn-action btn-delete"
              title="Supprimer"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation suppression -->
    <div v-if="pageToDelete" class="modal-overlay" @click="pageToDelete = null">
      <div class="modal-content" @click.stop>
        <h3>Supprimer la page ?</h3>
        <p>Êtes-vous sûr de vouloir supprimer "<strong>{{ pageToDelete.title }}</strong>" ?</p>
        <p class="warning">Cette action ne peut pas être annulée.</p>
        <div class="modal-actions">
          <button @click="pageToDelete = null" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="deletePage" class="btn btn-danger">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { pageService, type Page } from '../../services/pageService';

interface Emits {
  (e: 'create'): void;
  (e: 'select', page: Page): void;
}

defineEmits<Emits>();

const searchTerm = ref('');
const filterPublished = ref('');
const pageToDelete = ref<Page | null>(null);
const pages = ref<Page[]>([]);

onMounted(async () => {
  pages.value = await pageService.getAllPages();
});

const filteredPages = computed(() => {
  return pages.value.filter((page: Page) => {
    // Filtre recherche
    const matchSearch = page.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                       page.slug.toLowerCase().includes(searchTerm.value.toLowerCase());

    // Filtre statut
    let matchStatus = true;
    if (filterPublished.value === 'true') {
      matchStatus = page.published;
    } else if (filterPublished.value === 'false') {
      matchStatus = !page.published;
    }

    return matchSearch && matchStatus;
  });
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const confirmDelete = (page: Page) => {
  pageToDelete.value = page;
};

const deletePage = () => {
  if (pageToDelete.value) {
    pageService.deletePage(pageToDelete.value.id);
    pageToDelete.value = null;
  }
};
</script>

<style scoped>
.page-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--background-3);
}

.list-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-white);
}

.search-input,
.filter-select {
  background: var(--background-1);
  color: var(--text-white);
  border-color: var(--background-3);
}

.search-input:focus,
.filter-select:focus {
  border-color: var(--lk-1);
}

.filter-select option {
  background: var(--background-2);
  color: var(--text-white);
}

.pages-table {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--background-3);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-3);
  font-weight: 600;
  color: var(--text-white);
  border-bottom: 2px solid var(--background-2);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 120px;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid var(--background-3);
  transition: all 0.3s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--background-3);
}

.table-row.draft {
  opacity: 0.7;
}

.page-title-btn {
  background: none;
  border: none;
  color: var(--lk-1);
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0;
  font-size: 0.95rem;
}

.page-title-btn:hover {
  color: var(--lk-2);
  text-decoration: underline;
}

.slug-badge {
  background: var(--background-1);
  color: var(--text-light);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.status-badge.published {
  background: rgba(96, 198, 255, 0.2);
  color: var(--lk-1);
}

.status-badge.draft {
  background: rgba(252, 180, 58, 0.2);
  color: var(--ac-1);
}

.col-date {
  color: var(--text-light);
  font-size: 0.9rem;
}

.btn-action {
  background: var(--background-1);
  border: 2px solid var(--background-3);
  color: var(--text-white);
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.btn-action:hover {
  border-color: var(--text-white);
}

.btn-edit:hover {
  background: var(--lk-1);
  color: var(--lk-tx);
  border-color: var(--lk-1);
}

.btn-delete:hover {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--background-2);
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text-white);
  font-size: 1.2rem;
  border: none;
}

.modal-content h3::after {
  display: none;
}

.modal-content p {
  margin: 0.5rem 0;
  color: var(--text-light);
}

.warning {
  color: #ff6b6b;
  font-weight: 500;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--background-3);
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .col-slug,
  .col-status,
  .col-date {
    display: none;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
