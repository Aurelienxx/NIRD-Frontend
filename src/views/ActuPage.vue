<template>
  <div class="actu-page">
    <div class="actu-header">
      <h1>Actualités</h1>
      <button 
        v-if="isAuthenticated" 
        @click="openModal" 
        class="btn-add-article"
      >
        + Ajouter un article
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>Chargement des articles...</p>
    </div>

    <div v-else-if="articles.length === 0" class="no-articles">
      <p>Aucun article pour le moment.</p>
    </div>

    <div v-else class="articles-grid">
      <article 
        v-for="article in articles" 
        :key="article.id" 
        class="article-card"
        @click="viewArticle(article)"
      >
        <div class="article-image">
          <img 
            v-if="article.mediaUrl" 
            :src="article.mediaUrl" 
            :alt="article.title"
          />
          <div v-else class="placeholder">
            <span>📰</span>
          </div>
        </div>
        
        <div class="article-content">
          <h3>{{ article.title }}</h3>
          <p class="description">{{ article.description }}</p>
          
          <div class="article-meta">
            <span class="author">Par {{ article.author?.name || 'Anonyme' }}</span>
            <span class="date">{{ formatDate(article.publishedAt) }}</span>
          </div>
        </div>
      </article>
    </div>

    <ArticleFormModal 
      :isOpen="isModalOpen" 
      @close="closeModal"
      @success="loadArticles"
    />

    <ArticleDetailModal 
      :isOpen="isDetailModalOpen"
      :article="selectedArticle"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../services/authService'
import { articleService, type Article } from '../services/articleService'
import ArticleFormModal from '../components/ArticleFormModal.vue'
import ArticleDetailModal from '../components/ArticleDetailModal.vue'

const authStore = useAuthStore()

const articles = ref<Article[]>([])
const loading = ref(false)
const isModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedArticle = ref<Article | null>(null)

const isAuthenticated = computed(() => authStore.isAuthenticated)

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function loadArticles() {
  loading.value = true
  try {
    articles.value = await articleService.getPublishedArticles()
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error)
  } finally {
    loading.value = false
  }
}

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function viewArticle(article: Article) {
  selectedArticle.value = article
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
  selectedArticle.value = null
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.actu-page {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.actu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}


.btn-add-article {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-add-article:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.loading, .no-articles {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.1rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 30px;
}

.article-card {
  background: var(--background-2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.article-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
  font-size: 3rem;
}

.article-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.description {
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 15px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 0.85rem;
  color: #999;
}

.author {
  font-weight: 500;
  color: #667eea;
}

.place:hover {
  background: #f5f5f5;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.name {
  font-weight: 600;
}

.coords {
  font-size: 12px;
  color: #666;
}

.map {
  flex: 1;
}
</style>