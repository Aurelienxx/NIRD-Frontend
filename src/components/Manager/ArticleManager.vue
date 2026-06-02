<template>
  <div class="article-manager">
    <n-space justify="space-between" align="center" style="margin-bottom: 24px">
      <div style="font-size: 16px; font-weight: 600"> Liste des Articles</div>
    </n-space>
    <div class="article-layout">

      <!-- LISTE GAUCHE -->
      <div class="sidebar">
        <div class="sidebar-title">Articles</div>

        <div class="article-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-item"
            :class="{ active: editingArticle?.id === article.id }"
            @click="editArticle(article)"
          >
            <div class="title">
              {{ article.title }}
            </div>

            <div class="meta">
              {{ article.author?.name }} -
              {{ formatDate(article.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- EDITEUR DROITE -->
      <div class="editor">

        <n-card v-if="editingArticle">

          <n-form :model="editingArticle" label-placement="top">

            <div>
              <h2> Titre </h2>
                <n-input v-model:value="editingArticle.title" />
            </div>
            
            <div>
              <h2> Description </h2>
                <n-input
                  v-model:value="editingArticle.description"
                  type="textarea"
                  :rows="3"
                />
            </div>
            
            <div>
              <h2> Image (URL) </h2>
                <n-input
                  v-model:value="editingArticle.mediaUrl"
                  placeholder="https://..."
                  clearable
                />
            </div>

            <div>
              <h2> Contenu </h2>
              <RichTextEditor
                v-model="editingArticle.content"
                @save="saveArticle"
              />
            </div>

            <n-space>
              <n-button type="primary" @click="saveArticle">
                Sauvegarder
              </n-button>

              <n-button @click="cancelEdit">
                Annuler
              </n-button>

              <n-popconfirm
                v-if="editingArticle.id"
                @positive-click="deleteArticle(editingArticle.id)"
              >
                <template #trigger>
                  <n-button type="error">
                    Supprimer
                  </n-button>
                </template>

                Supprimer cet article

              </n-popconfirm>

            </n-space>

          </n-form>

        </n-card>

        <n-card v-else>
          <n-empty description="Sélectionne un article" />
        </n-card>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { NButton, NCard, NForm, NInput, NEmpty, NSpace, NPopconfirm } from 'naive-ui';
import { articleService, type Article } from '../../services/articleService';
import { userService } from '../../services/userService';
import RichTextEditor from '../Admin/RichTextEditor.vue';

type MediaType = 'IMAGE';

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
  mediaType: MediaType;
  publishedAt: string;
  author?: Article['author'];
}

const message = useMessage();
const articles = ref<Article[]>([]);
const authors = ref<User[]>([]);
const editingArticle = ref<EditingArticle | null>(null);
const selectedAuthorId = ref<number | null>(null);
const publishedAtLocal = ref('');
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
    message.error('Erreur lors du chargement des articles');
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
  let contentHTML = '';
  if (typeof article.content === 'string') {
    contentHTML = article.content;
  } else if (typeof article.content === 'object' && article.content !== null) {
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
    id: article.id,
    title: article.title,
    description: article.description,
    content: contentHTML,
    mediaUrl: article.mediaUrl,
    mediaType: 'IMAGE',
    publishedAt: article.publishedAt,
    author: article.author
  };
  selectedAuthorId.value = article.author?.id || null;
  publishedAtLocal.value = formatDateToLocal(article.publishedAt);
  editError.value = '';
};

const cancelEdit = () => {
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

    const publishedDate = new Date(publishedAtLocal.value).toISOString();

    const articleData = {
      title: editingArticle.value.title,
      description: editingArticle.value.description,
      content: editingArticle.value.content,
      mediaType: 'IMAGE' as const,
      mediaUrl: editingArticle.value.mediaUrl,
      publishedAt: publishedDate,
      authorId: selectedAuthorId.value
    };

    if (editingArticle.value.id) {
      await articleService.updateArticle(editingArticle.value.id, articleData);
      message.success('Article mis à jour avec succès');
    } else {
      await articleService.createArticle(articleData);
      message.success('Article créé avec succès');
    }

    editingArticle.value = null;
    await loadArticles();
  } catch (error: any) {
    editError.value = error.message || 'Erreur lors de la sauvegarde';
    message.error(editError.value);
  }
};

const deleteArticle = async (id: number) => {
  try {
    await articleService.deleteArticle(id);
    message.success('Article supprimé avec succès');
    await loadArticles();
  } catch (error) {
    message.error('Erreur lors de la suppression');
  }
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};
</script>

<style scoped>
.article-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px;
  border-right: 1px solid #e0e0e0;
  padding: 16px;
  overflow-y: auto;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-item {
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  background: var(--background-1);
}

.article-item.active {
  border: 1px solid #1f73e7;
}

.title {
  font-weight: 600;
}

.meta {
  font-size: 12px;
  opacity: 0.6;
}

.editor {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
