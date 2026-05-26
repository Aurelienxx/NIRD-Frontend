<template>
  <div class="page-editor">
    <div class="editor-header">
      <h2>{{ isEditing ? 'Modifier la page' : 'Créer une nouvelle page' }}</h2>
      <button @click="$emit('close')" class="btn-close">✕</button>
    </div>

    <form @submit.prevent="savePage" class="editor-form">
      <!-- Titre -->
      <div class="form-group">
        <label for="title">Titre de la page *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          placeholder="Ex: À propos"
          required
        />
      </div>

      <!-- Slug -->
      <div class="form-group">
        <label for="slug">URL (slug) *</label>
        <div class="slug-input">
          <span class="slug-prefix">/</span>
          <input
            id="slug"
            v-model="formData.slug"
            type="text"
            placeholder="ex-about"
            required
            @change="validateSlug"
          />
        </div>
        <small v-if="slugError" class="error-text">{{ slugError }}</small>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description">Description *</label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="2"
          placeholder="Description courte pour les métadonnées"
          required
        ></textarea>
      </div>

      <!-- Contenu -->
      <div class="form-group">
        <label for="content">Contenu *</label>
        <textarea
          id="content"
          v-model="formData.content"
          rows="8"
          placeholder="Contenu principal de la page"
          required
        ></textarea>
      </div>

      <!-- URL Image -->
      <div class="form-group">
        <label for="image">URL de l'image de couverture</label>
        <input
          id="image"
          v-model="formData.image"
          type="text"
          placeholder="/uploads/image.jpg"
        />
      </div>

      <!-- Statut Publication -->
      <div class="form-group checkbox-group">
        <input
          id="published"
          v-model="formData.published"
          type="checkbox"
        />
        <label for="published">Publier cette page</label>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('close')" class="btn btn-secondary">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="!!slugError">
          {{ isEditing ? 'Mettre à jour' : 'Créer la page' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { pageService, type Page } from '../../services/pageService';

interface Props {
  page: Page | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', page: Page): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEditing = computed(() => !!props.page);
const slugError = ref('');

const formData = ref({
  title: '',
  slug: '',
  description: '',
  content: '',
  image: '',
  published: true
});

// Initialiser le formulaire avec les données de la page
watch(() => props.page, (newPage) => {
  if (newPage) {
    formData.value = {
      title: newPage.title,
      slug: newPage.slug,
      description: newPage.description,
      content: newPage.content,
      image: newPage.image || '',
      published: newPage.published
    };
  } else {
    resetForm();
  }
}, { immediate: true });

const resetForm = () => {
  formData.value = {
    title: '',
    slug: '',
    description: '',
    content: '',
    image: '',
    published: true
  };
  slugError.value = '';
};

const validateSlug = () => {
  const slug = formData.value.slug.toLowerCase().replace(/\s+/g, '-');
  formData.value.slug = slug;

  // Vérifier que le slug est valide
  if (!/^[a-z0-9-]+$/.test(slug)) {
    slugError.value = 'Le slug ne peut contenir que des lettres, chiffres et tirets';
    return;
  }

  slugError.value = '';
};

const savePage = async () => {
  // Valider le slug
  validateSlug();
  if (slugError.value) return;

  try {
    let savedPage: Page;

    if (isEditing.value && props.page) {
      // Mise à jour
      savedPage = await pageService.updatePage(props.page.id, {
        ...formData.value,
        slug: formData.value.slug.toLowerCase()
      });
    } else {
      // Création
      savedPage = await pageService.createPage({
        ...formData.value,
        slug: formData.value.slug.toLowerCase()
      });
    }

    emit('save', savedPage);
    resetForm();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};
</script>

<style scoped>
.page-editor {
  background: var(--background-2);
  border-radius: 12px;
  padding: 2rem;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--background-3);
}

.editor-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-white);
  border: none;
}

.editor-header h2::after {
  display: none;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: var(--text-white);
  background: var(--background-3);
  border-radius: 6px;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group textarea {
  resize: vertical;
  font-size: 0.95rem;
  line-height: 1.5;
}

.slug-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slug-prefix {
  color: var(--text-light);
  font-weight: 500;
  padding: 0.75rem 0.5rem;
}

.slug-input input {
  flex: 1;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--lk-1);
}

.checkbox-group label {
  margin: 0;
  font-weight: 400;
  cursor: pointer;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--background-3);
}

@media (max-width: 768px) {
  .page-editor {
    padding: 1.5rem;
  }

  .editor-header h2 {
    font-size: 1.2rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
