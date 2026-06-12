<template>
  <div v-show="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div v-if="article" class="article-detail">
        <!-- Image de couverture -->
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

        <!-- Contenu de l'article -->
        <div class="article-body">
          <h1 class="article-title">{{ article.title }}</h1>
          
          <div class="article-meta">
            <span class="author">Par {{ article.author?.name || 'Anonyme' }}</span>
            <span class="date">{{ formatDate(article.publishedAt) }}</span>
          </div>

          <p class="article-description">{{ article.description }}</p>

          <div class="article-content" v-html="parseContent(article.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '../../services/articleService'

const props = defineProps<{
  isOpen: boolean
  article: Article | null
}>();

const emit = defineEmits<{
  close: []
}>();

function closeModal() {
  emit('close')
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function parseContent(content: any) {
  let parsed = ''

  if (typeof content === 'string') {
    parsed = content
  } else if (typeof content === 'object' && content) {
    // Si c'est un objet JSON avec une propriété "text"
    if (content.text) {
      parsed = content.text
    } else {
      // Sinon retourner le HTML ou la chaîne JSON
      parsed = content.html || JSON.stringify(content)
    }
  }

  // Supprimer les délimiteurs "text{" au début et "}" à la fin
  parsed = parsed.replace(/^text\{/, '').replace(/\}$/, '')

  return parsed
}
</script>

<style scoped>
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
  padding: 20px;
}

.modal-content {
  background: var(--background-2);
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  position: sticky;
  top: 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background: var(--background-2);
  z-index: 10;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.article-detail {
  display: flex;
  flex-direction: column;
}

.article-image {
  width: 100%;
  height: 400px;
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
  font-size: 5rem;
}

.article-body {
  padding: 40px;
}

.article-title {
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  flex-wrap: wrap;
}

.author {
  font-weight: 600;
  color: #667eea;
  font-size: 1.05rem;
}

.date {
  color: #999;
  font-size: 0.95rem;
}

.article-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 30px;
  font-style: italic;
}

.article-content {
  font-size: 1.05rem;
  line-height: 1.8;
}
@media (max-width: 1024px) {
  .modal-content {
    max-width: 95%;
  }

  .article-body {
    padding: 30px;
  }



  .article-image {
    height: 300px;
  }
}


@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }

  .modal-content {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
    margin-top: 0;
  }

  .modal-header {
    padding: 10px;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    font-size: 1.7rem;
  }

  .article-image {
    height: 220px;
  }

  .placeholder {
    font-size: 3rem;
  }

  .article-body {
    padding: 20px;
  }

  .article-title {
    margin-bottom: 15px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }

  .article-description {
    font-size: 1rem;
    margin-bottom: 20px;
  }

  .article-content {
    font-size: 0.95rem;
    line-height: 1.7;
  }
}


@media (max-width: 480px) {
  .article-image {
    height: 180px;
  }

  .article-body {
    padding: 15px;
  }


  .author,
  .date {
    font-size: 0.85rem;
  }

  .article-description {
    font-size: 0.95rem;
  }

  .article-content {
    font-size: 0.9rem;
  }
}
</style>
