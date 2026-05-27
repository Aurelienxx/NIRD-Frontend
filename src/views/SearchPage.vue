<template>
  <div class="search-page">
    <div class="search-header">
      <form class="search-form" @submit.prevent="performSearch">
        <input
          v-model="query"
          type="text"
          placeholder="Rechercher un article, une annonce ou un document..."
          class="search-input"
        />

        <button type="submit" class="search-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            class="search-icon"
          >
            <path
              d="M27 9C17.075 9 9 17.075 9 27C9 36.925 17.075 45 27 45C31.129213 45 34.9263 43.587367 37.966797 41.240234L51.048828 54.322266C51.952828 55.226266 53.418266 55.226266 54.322266 54.322266C55.226266 53.418266 55.226266 51.952828 54.322266 51.048828L41.240234 37.966797C43.587367 34.9263 45 31.129213 45 27C45 17.075 36.925 9 27 9ZM27 13C34.719 13 41 19.281 41 27C41 34.719 34.719 41 27 41C19.281 41 13 34.719 13 27C13 19.281 19.281 13 27 13Z"
            />
          </svg>
        </button>
      </form>
    </div>

    <div class="page-content">
      <div v-if="!loading" class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label class="filter-label">Filtrer par tags:</label>
            <n-select 
              v-model:value="selectedTags" 
              :options="tagOptions" 
              placeholder="Sélectionnez un ou plusieurs tags..."
              multiple
              clearable
              filterable
              class="tags-select"
              @update:value="performSearch"
            />
          </div>
          <button 
            v-if="selectedTags && selectedTags.length > 0" 
            class="clear-filters-btn"
            @click="clearFilters"
          >
            ✕ Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div v-if="!searchPerformed" class="initial-state">
        <div class="welcome-section">
          <h2>Explorer les documents</h2>
          <p>Recherchez par mots-clés ou filtrez par tags</p>
        </div>
      </div>
      
      <!-- État de chargement -->
      <div v-if="loading" class="loading-state">
        <p>Recherche en cours...</p>
      </div>

      <!-- Résultats de recherche -->
      <div v-else-if="searchPerformed && documents.length > 0" class="results-section">
        <h2 class="results-title">{{ documents.length }} résultat(s) trouvé(s)</h2>
        <div class="documents-grid">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="document-card"
            @click="selectDocument(doc)"
          >
            <div class="document-thumbnail">
              <span class="file-icon">📄</span>
            </div>
            <div class="document-info">
              <h3 class="document-title">{{ doc.title }}</h3>
              <p class="document-description">{{ truncateText(doc.description, 100) }}</p>
              <div class="document-meta">
                <span class="author">{{ doc.author?.name }}</span>
                <span class="separator">•</span>
                <span class="date">{{ formatDate(doc.createdAt) }}</span>
                <span v-if="doc.tags.length > 0" class="separator">•</span>
                <div v-if="doc.tags.length > 0" class="tags">
                  <span v-for="tag in doc.tags" :key="tag" class="tag">{{ formatTag(tag) }}</span>
                </div>
              </div>
            </div>
            <div class="document-actions">
              <button class="action-btn" @click.stop="downloadDocument(doc)">Télécharger ⬇️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pas de résultats -->
      <div v-else-if="searchPerformed && documents.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10C28 10 10 28 10 50C10 72 28 90 50 90C72 90 90 72 90 50C90 28 72 10 50 10Z" fill="none" stroke="#ccc" stroke-width="2"/>
          <text x="50" y="55" text-anchor="middle" font-size="30" fill="#ccc">?</text>
        </svg>
        <h3>Aucun document trouvé</h3>
        <p>Essayez une autre recherche</p>
      </div>

     
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue';
import { NSelect } from 'naive-ui';
import { documentService, type Document, type DocumentTag } from '../services/documentService';
import { DOCUMENT_TAGS, formatTag } from '../config/tags';

const query = ref('');
const documents = ref<Document[]>([]);
const loading = ref(false);
const searchPerformed = ref(false);
const selectedTags = ref<string[]>([]);


const tagOptions = DOCUMENT_TAGS.map(tag => ({
  label: `${tag.emoji} ${tag.label}`,
  value: tag.value
}));

const performSearch = async () => {
  try {
    loading.value = true;
    searchPerformed.value = true;

    let results: Document[] = [];

    if (query.value.trim()) {
      results = await documentService.searchDocuments(query.value.trim());
    }

    if (selectedTags.value && selectedTags.value.length > 0) {
      const tagResults: Document[] = [];
      
      for (const tag of selectedTags.value) {
        const docsForTag = await documentService.getDocumentsByTag(tag);
        tagResults.push(...docsForTag);
      }

      if (results.length > 0) {
        // Intersection: keep only documents that match both search and tags
        const tagIds = new Set(tagResults.map(t => t.id));
        results = results.filter(doc => tagIds.has(doc.id));
      } else {
        // Si pas de recherche textuelle, retourner les documents des tags sélectionnés
        results = [...new Map(tagResults.map(item => [item.id, item])).values()];
      }
    }

    documents.value = results;

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    documents.value = [];
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  selectedTags.value = [];
  query.value = '';
  documents.value = [];
  searchPerformed.value = false;
};

const filterByTag = async (tag: DocumentTag) => {
  try {
    loading.value = true;
    searchPerformed.value = true;
    documents.value = await documentService.getDocumentsByTag(tag);
  } catch (error) {
    console.error('Erreur lors du filtre par tag:', error);
    documents.value = [];
  } finally {
    loading.value = false;
  }
};

const selectDocument = (doc: Document) => {
  console.log('Document sélectionné:', doc);
};

const downloadDocument = async (doc: Document) => {
  try {
    const blob = await documentService.downloadDocument(doc.id);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    alert('Erreur lors du téléchargement du document');
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
};
</script>

<style scoped>
.search-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-header {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 30px 20px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.search-form {
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #dcdcdc;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}

.search-form:focus-within {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 16px 20px;
  font-size: 16px;
  background: transparent;
  color: #202124;
  font-family: inherit;
}

.search-input::placeholder {
  color: #9aa0a6;
}

.search-button {
  width: 60px;
  height: 56px;
  border: none;
  background: #1f73e7;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-button:hover {
  background: #1765cc;
}

.search-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.page-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.initial-state {
  text-align: center;
  padding: 30px 20px;
}

.welcome-section {
  margin-bottom: 20px;
}

.filters-section {
  padding: 20px;
  margin: 0;
}

.filters-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}



.tags-select {
  min-width: 250px;
}

.clear-filters-btn {
  padding: 8px 16px;
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #5f6368;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.clear-filters-btn:hover {
  background: #dadce0;
  color: #202124;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
}

.results-section {
  animation: fadeIn 0.3s ease;
}


.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.document-card {
  border: 1px solid #dadce0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.document-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.document-thumbnail {
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 48px;
}

.document-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}


.document-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--text-light);
}

.author {
  font-weight: 500;
  color: #1f73e7;
}

.separator {
  color: #dadce0;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  background: #e8eef7;
  color: #1f73e7;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.document-actions {
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  color: var(--text-light);
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 4px;
}

.action-btn:hover {
  transform: scale(1.2);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  opacity: 0.5;
}


@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>