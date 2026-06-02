<template>
  <main class="articles-container">
    <div class="wrapper">

      <div class="header">
        <h2>Mon Espace Personnel</h2>
        <div class="header-actions">
          <button v-if="activeTab === 'articles'" class="btn btn-add btn-primary" @click="openArticleModal">
            + Ajouter un article   
          </button>
          <button v-if="activeTab === 'documents'" class="btn btn-add btn-primary" @click="openDocumentModal">
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

      <template v-else>
        <ArticleListView
          v-if="activeTab === 'articles'"
          :articles="articles"
          @openModal="openArticleModal"
          @edit="edit"
          @delete="remove"
        />

        <DocumentListView
          v-else-if="activeTab === 'documents'"
          :documents="documents"
          @openModal="openDocumentModal"
          @download="downloadDocument"
          @delete="removeDocument"
        />
      </template>

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
import { articleService, type Article } from '../services/articleService';
import { documentService, type Document } from '../services/documentService';
import { useAuthStore } from '../services/authService';
import ArticleFormModal from '../components/Modal/ArticleFormModal.vue';
import DocumentFormModal from '../components/Modal/DocumentFormModal.vue';
import ArticleListView from './ArticleListView.vue';
import DocumentListView from './DocumentListView.vue';

const authStore = useAuthStore();

const articles = ref<Article[]>([])
const documents = ref<Document[]>([])
const loading = ref(false);
const isArticleModalOpen = ref(false);
const isDocumentModalOpen = ref(false);
const articleToEdit = ref<Article | null>(null);
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

const edit = (article: Article) => {
  articleToEdit.value = article
  isArticleModalOpen.value = true
}

const remove = async (id: number) => {
  await articleService.deleteArticle(id)
  articles.value = articles.value.filter(a => a.id !== id)
}

const removeDocument = async (id: number) => {
  await documentService.deleteDocument(id)
  documents.value = documents.value.filter(d => d.id !== id)
}

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
  color: var(--text-light);
  transition: all 0.2s ease;
  position: relative;
  bottom: -2px;
}

.tab-btn:hover {
  color: #5f6368;
}

.tab-btn.active {
  color: #1f73e7;
  border-bottom-color: #1f73e7;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  font-size: 18px;
  color: #5f6368;
}
</style>