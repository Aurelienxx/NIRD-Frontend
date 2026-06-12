<template>
  <div v-if="articles.length === 0" class="empty-state">
    <div class="empty-icon">📝</div>
    <p>Aucun article pour le moment</p>
    <button class="btn btn-add btn-primary" @click="$emit('openModal')">
      + Créer votre premier article
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
        <button class="btn btn-edit" @click="$emit('edit', article)">Modifier</button>
        <button class="btn btn-delete" @click="$emit('delete', article.id)">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  articles: any[];
}>();

defineEmits<{
  openModal: [];
  edit: [article: any];
  delete: [id: any];
}>();
</script>

<style scoped>
.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 24px;
  margin-top: 15px;
}

.btn-add.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

/* =========================
   Responsive
========================= */

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card {
    width: 100%;
  }

  .media {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  .actions {
    flex-direction: column;
    gap: 10px;
  }

  .actions .btn {
    width: 100%;
  }

  .btn-add {
    width: 100%;
    max-width: 320px;
    margin: 15px auto 0;
  }

  .empty-state {
    padding: 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .media {
    height: 180px;
  }

  .card h4 {
    font-size: 1rem;
  }

  .card p {
    font-size: 0.9rem;
  }

  .btn-add.btn-primary {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
