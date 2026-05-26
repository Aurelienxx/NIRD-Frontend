<template>
  <main class="articles-container">
    <div class="wrapper">

      <div class="header">
        <h2>Mon Espace Personnel</h2>
        <div class="header-actions">
          <button v-if="activeTab === 'articles'" class="btn btn-add btn-primary" @click="openArticleModal">
            + Nouvel article   
          </button>
          <button v-if="activeTab === 'documents'" class="btn btn-add btn-secondary" @click="openDocumentModal">
            + Ajouter un document
          </button>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'articles' }"
          @click="activeTab = 'articles'"
        >
          📝 Articles
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'documents' }"
          @click="activeTab = 'documents'"
        >
          📄 Documents
        </button>
      </div>

      <div v-if="loading" class="loading-state">⏳ Chargement...</div>

      <div v-else-if="activeTab === 'articles'">
        <div v-if="articles.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>Aucun article pour le moment</p>
          <button class="btn btn-add btn-primary" @click="openArticleModal">
            <span class="plus-icon">+</span>
            Créer votre premier article
          </button>
        </div>
        <div v-else class="grid">
          <div v-for="article in articles" :key="`article-${article.id}`" class="card">
            <img 
              v-if="article.mediaType === 'IMAGE'" 
              :src="article.mediaUrl" 
              class="media"
            />
            <video 
              v-else-if="article.mediaType === 'VIDEO'" 
              class="media" 
              controls
            >
              <source :src="article.mediaUrl" />
            </video>
            <h4>{{ article.title }}</h4>
            <p>{{ article.description }}</p>
            <div class="actions">
              <button class="btn btn-edit" @click="edit(article)">Modifier</button>
              <button class="btn btn-delete" @click="remove(article.id)">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'documents'">
        <div v-if="documents.length === 0" class="empty-state">
          <div class="empty-icon">📄</div>
          <p>Aucun document pour le moment</p>
          <button class="btn btn-add btn-secondary" @click="openDocumentModal">
            <span class="plus-icon">+</span>
            Ajouter votre premier document
          </button>
        </div>
        <div v-else class="grid">
          <div v-for="doc in documents" :key="`doc-${doc.id}`" class="card document-card">
            <div class="document-thumbnail">
              <span class="file-icon">📄</span>
            </div>
            <h4>{{ doc.title }}</h4>
            <p>{{ truncateText(doc.description, 100) }}</p>
            <div class="document-meta">
              <span class="date">{{ formatDate(doc.createdAt) }}</span>
              <div v-if="doc.tags.length > 0" class="tags">
                <span v-for="tag in doc.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="actions">
              <button class="btn btn-download" @click="downloadDocument(doc)">⬇️ Télécharger</button>
              <button class="btn btn-delete" @click="removeDocument(doc.id)">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <ArticleFormModal
        :isOpen="isArticleModalOpen"
        :articleToEdit="articleToEdit"
        @close="closeArticleModal"
        @success="reload"
      />

      <DocumentFormModal
        :isOpen="isDocumentModalOpen"
        :documentToEdit="null"
        @close="closeDocumentModal"
        @success="onDocumentCreated"
      />

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { articleService } from '../services/articleService';
import { documentService, type Document } from '../services/documentService';
import { useAuthStore } from '../services/authService';
import ArticleFormModal from '../components/ArticleFormModal.vue';
import DocumentFormModal from '../components/DocumentFormModal.vue';

const authStore = useAuthStore();

const articles = ref([]);
const documents = ref<Document[]>([]);
const loading = ref(false);
const isArticleModalOpen = ref(false);
const isDocumentModalOpen = ref(false);
const articleToEdit = ref(null);
const activeTab = ref<'articles' | 'documents'>('articles');

const load = async () => {
  if (!authStore.user?.id) return;

  loading.value = true;

  try {
    const [userArticles, userDocuments] = await Promise.all([
      articleService.getArticlesByAuthor(authStore.user.id),
      documentService.getDocumentsByAuthor(authStore.user.id)
    ]);
    articles.value = userArticles;
    documents.value = userDocuments;
  } finally {
    loading.value = false;
  }
};

const openArticleModal = () => {
  articleToEdit.value = null;
  isArticleModalOpen.value = true;
};

const openDocumentModal = () => {
  isDocumentModalOpen.value = true;
};

const closeArticleModal = () => {
  isArticleModalOpen.value = false;
  articleToEdit.value = null;
};

const closeDocumentModal = () => {
  isDocumentModalOpen.value = false;
};

const edit = (article) => {
  articleToEdit.value = article;
  isArticleModalOpen.value = true;
};

const remove = async (id) => {
  await articleService.deleteArticle(id);
  articles.value = articles.value.filter(a => a.id !== id);
};

const removeDocument = async (id: string) => {
  await documentService.deleteDocument(id);
  documents.value = documents.value.filter(d => d.id !== id);
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
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const onDocumentCreated = () => {
  closeDocumentModal();
  load();
};

const reload = () => {
  closeArticleModal();
  load();
};

onMounted(load);
</script>

<style scoped>
.articles-container {
  padding: 40px 20px;
}

.wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
  flex-wrap: wrap;
}

.header h2 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-add.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.btn-add.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-add.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(245, 87, 108, 0.4);
}

.plus-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8e8e8;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e8e8e8;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #5f6368;
  transition: all 0.2s ease;
  position: relative;
  bottom: -2px;
}

.tab-btn:hover {
  color: #202124;
}

.tab-btn.active {
  color: #1f73e7;
  border-bottom-color: #1f73e7;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5f6368;
  font-size: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.card {
  background: var(--background-1);
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.media {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;

}


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

.btn-edit {
  background: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-edit:hover {
  opacity: 0.9;
}

.btn-delete {
  background: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-delete:hover {
  opacity: 0.9;
}

.primary {
  background: #007bff;
  color: white;
}

.document-card {
  display: flex;
  flex-direction: column;
}

.document-thumbnail {
  width: 100%;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 40px;
}

.document-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 10px;
}

.date {
  font-weight: 500;
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

.btn-download {
  background: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-download:hover {
  opacity: 0.9;
}
</style>