<template>
  <div v-show="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ articleToEdit ? 'Modifier l\'article' : 'Écrire un nouvel article' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitArticle">
          <div class="form-group">
            <label for="title">Titre *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="Titre de l'article"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Description courte de l'article"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="content">Contenu *</label>
            <RichTextEditor
              v-model="form.contentText"
              @save="submitArticle"
            />
          </div>

          <div class="form-group">
            <label for="mediaUrl">URL de l'image</label>
            <input
              id="mediaUrl"
              v-model="form.mediaUrl"
              type="url"
              placeholder="https://exemple.com/image.jpg"
            />
          </div>

          <div class="form-group">
            <label for="mediaType">Type de média</label>
            <select id="mediaType" v-model="form.mediaType">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Vidéo</option>
            </select>
          </div>

          <div class="form-group">
            <label for="publishedAt">Date de publication</label>
            <input
              id="publishedAt"
              v-model="form.publishedAt"
              type="datetime-local"
            />
          </div>

          <div class="error" v-if="error">
            {{ error }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Annuler
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? (articleToEdit ? 'Modification en cours...' : 'Création en cours...') : (articleToEdit ? 'Mettre à jour l\'article' : 'Publier l\'article') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { articleService, type Article } from '../../services/articleService.ts';
import { useAuthStore } from '../../services/authService.ts';
import RichTextEditor from './../Admin/RichTextEditor.vue';

const props = defineProps<{
  isOpen: boolean;
  articleToEdit?: Article | null;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const authStore = useAuthStore();

const form = ref({
  title: '',
  description: '',
  contentText: '',
  mediaUrl: '',
  mediaType: 'IMAGE' as 'IMAGE' | 'VIDEO',
  publishedAt: new Date().toISOString().slice(0, 16)
});

const submitting = ref(false);
const error = ref<string | null>(null);

const closeModal = () => {
  resetForm();
  emit('close');
};

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    contentText: '',
    mediaUrl: '',
    mediaType: 'IMAGE',
    publishedAt: new Date().toISOString().slice(0, 16)
  };
  error.value = null;
};


// Charger les données de l'article à éditer
watch(() => props.articleToEdit, (article) => {
  if (article) {
    form.value = {
      title: article.title,
      description: article.description,
      contentText: typeof article.content === 'string' ? article.content : article.content?.text || '',
      mediaUrl: article.mediaUrl || '',
      mediaType: article.mediaType || 'IMAGE',
      publishedAt: new Date(article.publishedAt).toISOString().slice(0, 16)
    };
  } else {
    resetForm();
  }
}, { deep: true });

const submitArticle = async () => {
  if (!authStore.user?.id) {
    error.value = 'Vous devez être connecté pour créer un article';
    return;
  }

  try {
    submitting.value = true;
    error.value = null;

    if (props.articleToEdit) {
      // Mode édition
      await articleService.updateArticle(props.articleToEdit.id, {
        title: form.value.title,
        description: form.value.description,
        content: form.value.contentText,
        mediaUrl: form.value.mediaUrl || undefined,
        mediaType: form.value.mediaType,
        publishedAt: new Date(form.value.publishedAt).toISOString()
      });
    } else {
      // Mode création
      await articleService.createArticle({
        title: form.value.title,
        description: form.value.description,
        content: form.value.contentText,
        mediaUrl: form.value.mediaUrl || undefined,
        mediaType: form.value.mediaType,
        publishedAt: new Date(form.value.publishedAt).toISOString(),
        authorId: authStore.user.id
      }); 
    }

    resetForm();
    emit('success');
    closeModal();
  } catch (err: any) {
    error.value = err.message || (props.articleToEdit ? 'Erreur lors de la mise à jour de l\'article' : 'Erreur lors de la création de l\'article');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--background-2);
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--background-3, #f0f0f0);
}


.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

input,
textarea,
select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

textarea {
  resize: vertical;
}

.error {
  padding: 12px;
  background: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid var(--background-3, #f0f0f0);
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: var(--primary-color, #007bff);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-color-dark, #0056b3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
