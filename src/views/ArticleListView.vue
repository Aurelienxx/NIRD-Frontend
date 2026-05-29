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
</style>
