<template>
  <div class="article-manager">
    <div class="manager-header">
      <h2>Gestion des Articles</h2>
    </div>

    <div v-if="loading" class="loading">
      <p>Chargement des articles...</p>
    </div>

    <div v-else class="articles-container">
      <!-- Liste des articles -->
      <div class="articles-list">
        <div v-if="articles.length === 0" class="empty-state">
          <p>Aucun article créé</p>
        </div>
        
        <div v-for="article in articles" :key="article.id" class="article-item" :class="{ active: editingArticle?.id === article.id }">
          <div class="article-item-info" @click="editArticle(article)">
            <h4>{{ article.title }}</h4>
            <p class="article-description">{{ truncate(article.description, 80) }}</p>
            <div class="article-meta">
              <span class="author">✍️ {{ article.author?.name || 'Inconnu' }}</span>
              <span class="date">📅 {{ formatDate(article.publishedAt || article.createdAt) }}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-danger" @click="deleteArticle(article.id)">🗑️</button>
        </div>
      </div>

      <!-- Éditeur d'article -->
      <div v-if="showEditor && editingArticle" class="article-editor">
        <div class="editor-wrapper">
          <form @submit.prevent="saveArticle">
            <!-- Informations de base -->
            <div class="form-section">
              <h3>Informations de l'article</h3>
              
              <div class="form-group">
                <label for="title">Titre</label>
                <input 
                  id="title"
                  v-model="editingArticle.title" 
                  type="text" 
                  placeholder="Titre de l'article"
                  required
                />
              </div>

              <div class="form-group">
                <label for="description">Description courte</label>
                <textarea 
                  id="description"
                  v-model="editingArticle.description" 
                  placeholder="Description de l'article"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="mediaType">Type de média</label>
                  <select v-model="editingArticle.mediaType" id="mediaType">
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Vidéo</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="mediaUrl">URL du média</label>
                  <input 
                    id="mediaUrl"
                    v-model="editingArticle.mediaUrl" 
                    type="url" 
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="author">Auteur</label>
                  <select v-model.number="selectedAuthorId" id="author" required>
                    <option :value="null">-- Sélectionner un auteur --</option>
                    <option v-for="author in authors" :key="author.id" :value="author.id">
                      {{ author.name }} ({{ author.email }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="publishedAt">Date de publication</label>
                  <input 
                    id="publishedAt"
                    v-model="publishedAtLocal" 
                    type="datetime-local"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Contenu -->
            <div class="form-section">
              <h3>Contenu de l'article</h3>
              <RichTextEditor 
                v-model="editingArticle.content" 
                @save="saveArticle" 
              />
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="submit" class="btn btn-success">💾 Sauvegarder</button>
              <button type="button" class="btn btn-secondary" @click="cancelEdit">Annuler</button>
            </div>

            <div v-if="editError" class="error-message">
              {{ editError }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { articleService, type Article } from '../../services/articleService';
import { userService } from '../../services/userService';
import RichTextEditor from '../Admin/RichTextEditor.vue';

interface User {
  id: number;
  name: string;
  email: string;
}

interface EditingArticle {
  id?: number;
  title: string;
  description: string;
  content: string;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  publishedAt: string;
  author?: Article['author'];
}

const articles = ref<Article[]>([]);
const authors = ref<User[]>([]);
const editingArticle = ref<EditingArticle | null>(null);
const selectedAuthorId = ref<number | null>(null);
const publishedAtLocal = ref('');
const showEditor = ref(false);
const loading = ref(false);
const editError = ref('');

onMounted(() => {
  loadArticles();
  loadAuthors();
});

const loadArticles = async () => {
  try {
    loading.value = true;
    articles.value = await articleService.getAllArticles();
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error);
  } finally {
    loading.value = false;
  }
};

const loadAuthors = async () => {
  try {
    const users = await userService.getAll();
    authors.value = users.map(user => ({
      id: user.id,
      name: user.name || 'Inconnu',
      email: user.email
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des auteurs:', error);
  }
};

const formatDateToLocal = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


const editArticle = (article: Article) => {
  // Extraire le contenu correctement (peut être string ou object JSON)
  let contentHTML = '';
  if (typeof article.content === 'string') {
    contentHTML = article.content;
  } else if (typeof article.content === 'object' && article.content !== null) {
    // Si c'est un objet, essayer d'extraire le HTML
    if ('text' in article.content) {
      contentHTML = String(article.content.text);
    } else if ('html' in article.content) {
      contentHTML = String(article.content.html);
    } else if ('content' in article.content) {
      contentHTML = String(article.content.content);
    } else {
      contentHTML = '';
    }
  }
  
  editingArticle.value = {
    ...article,
    author: article.author,
    content: contentHTML
  };
  selectedAuthorId.value = article.author?.id || null;
  publishedAtLocal.value = formatDateToLocal(article.publishedAt);
  showEditor.value = true;
  editError.value = '';
};

const cancelEdit = () => {
  showEditor.value = false;
  editingArticle.value = null;
  editError.value = '';
};

const saveArticle = async () => {
  if (!editingArticle.value || !selectedAuthorId.value) {
    editError.value = 'Veuillez sélectionner un auteur';
    return;
  }

  try {
    editError.value = '';

    // Convertir le datetime-local en ISO string
    const publishedDate = new Date(publishedAtLocal.value).toISOString();

    const articleData = {
      title: editingArticle.value.title,
      description: editingArticle.value.description,
      content: editingArticle.value.content,
      mediaType: editingArticle.value.mediaType,
      mediaUrl: editingArticle.value.mediaUrl,
      publishedAt: publishedDate,
      author: {
        id: selectedAuthorId.value,
        name: authors.value.find(a => a.id === selectedAuthorId.value)?.name || '',
        email: authors.value.find(a => a.id === selectedAuthorId.value)?.email || ''
      }
    };

    if (editingArticle.value.id) {
      await articleService.updateArticle(editingArticle.value.id, articleData);
    } else {
      await articleService.createArticle(articleData);
    }

    showEditor.value = false;
    editingArticle.value = null;
    await loadArticles();
  } catch (error: any) {
    editError.value = error.message || 'Erreur lors de la sauvegarde';
  }
};

const deleteArticle = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    return;
  }

  try {
    await articleService.deleteArticle(id);
    await loadArticles();
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const truncate = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<style scoped>
.article-manager {
  padding: 20px;
}



.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-light);
}

.articles-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-light);
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.article-item.active {
  background-color: rgba(0, 123, 255, 0.15);
  border-color: #007bff;
}

.article-item-info {
  flex: 1;
  cursor: pointer;
}

.article-item-info h4 {
  margin: 0 0 8px 0;
  color: var(--text-white);
  font-size: 15px;
}

.article-description {
  margin: 0 0 8px 0;
  color: var(--text-light);
  font-size: 13px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.article-editor {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.editor-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 25px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: var(--text-white);
  font-size: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-light);
  font-size: 13px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: var(--text-white);
  font-family: inherit;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.12);
  border-color: #007bff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background-color: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
  border-radius: 4px;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .articles-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .manager-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .btn {
    width: 100%;
  }

  .article-item {
    flex-direction: column;
  }
}
</style>
