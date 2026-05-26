<template>
  <div v-show="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ documentToEdit ? 'Modifier le document' : 'Déposer un nouveau document' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitDocument">
          <div class="form-group">
            <label for="title">Titre *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="Titre du document"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Description du document"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="file">Fichier *</label>
            <div class="file-input-wrapper">
              <input
                id="file"
                type="file"
                @change="handleFileUpload"
                :required="!documentToEdit"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              />
              <span v-if="form.fileName" class="file-name">{{ form.fileName }}</span>
            </div>
            <p class="file-info">Formats acceptés: PDF, Word, Excel, PowerPoint, TXT, ZIP (Max: 50MB)</p>
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tags-selector">
              <label class="tag-checkbox">
                <input type="checkbox" value="TUTORIEL" v-model="form.tags" />
                <span>📚 Tutoriel</span>
              </label>
              <label class="tag-checkbox">
                <input type="checkbox" value="GUIDE" v-model="form.tags" />
                <span>📖 Guide</span>
              </label>
              <label class="tag-checkbox">
                <input type="checkbox" value="LETTRE" v-model="form.tags" />
                <span>📮 Lettre</span>
              </label>
            </div>
          </div>

          <div class="error" v-if="error">
            {{ error }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Annuler
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? (documentToEdit ? 'Modification en cours...' : 'Dépôt en cours...') : (documentToEdit ? 'Mettre à jour' : 'Déposer le document') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { documentService, type Document, type DocumentTag } from '../services/documentService';
import { useAuthStore } from '../services/authService';

const props = defineProps<{
  isOpen: boolean;
  documentToEdit?: Document | null;
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const authStore = useAuthStore();

const form = ref({
  title: '',
  description: '',
  fileName: '',
  fileType: '',
  fileData: null as File | null,
  tags: [] as DocumentTag[]
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
    fileName: '',
    fileType: '',
    fileData: null,
    tags: []
  };
  error.value = null;
};

// Charger les données du document à éditer
watch(() => props.documentToEdit, (document) => {
  if (document) {
    form.value = {
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      fileType: document.fileType,
      fileData: null, // Ne pas recharger le fichier existant
      tags: document.tags || []
    };
  } else {
    resetForm();
  }
}, { deep: true });

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      error.value = `Le fichier est trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Taille maximale: 50MB`;
      form.value.fileData = null;
      input.value = '';
      return;
    }

    error.value = null;
    form.value.fileData = file;
    form.value.fileName = file.name;
    form.value.fileType = file.type;
  }
};

const submitDocument = async () => {
  if (!authStore.user?.id) {
    error.value = 'Vous devez être connecté pour déposer un document';
    return;
  }

  if (!form.value.title || !form.value.description) {
    error.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  if (!documentToEdit && !form.value.fileData) {
    error.value = 'Veuillez sélectionner un fichier';
    return;
  }

  try {
    submitting.value = true;
    error.value = null;

    if (props.documentToEdit) {
      // Mode édition
      const updateData: any = {
        title: form.value.title,
        description: form.value.description,
        tags: form.value.tags
      };

      if (form.value.fileData) {
        updateData.fileData = form.value.fileData;
        updateData.fileName = form.value.fileName;
        updateData.fileType = form.value.fileType;
      }

      await documentService.updateDocument(props.documentToEdit.id, updateData);
    } else {
      // Mode création
      if (!form.value.fileData) {
        error.value = 'Veuillez sélectionner un fichier';
        return;
      }

      await documentService.createDocument({
        title: form.value.title,
        description: form.value.description,
        fileName: form.value.fileName,
        fileType: form.value.fileType,
        fileData: form.value.fileData,
        authorId: authStore.user.id,
        tags: form.value.tags
      });
    }

    resetForm();
    emit('success');
    closeModal();
  } catch (err: any) {
    console.error('Erreur:', err);
    if (err.response?.status === 413) {
      error.value = 'Le fichier est trop volumineux. Veuillez utiliser un fichier plus petit.';
    } else {
      error.value = err.message || (props.documentToEdit ? 'Erreur lors de la mise à jour du document' : 'Erreur lors du dépôt du document');
    }
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
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
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
  border-bottom: 1px solid #dadce0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #202124;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #5f6368;
  transition: color 0.2s ease;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #202124;
}

.modal-body {
  padding: 24px;
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

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1f73e7;
  box-shadow: 0 0 0 3px rgba(31, 115, 231, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.file-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-group input[type="file"] {
  flex: 1;
  padding: 10px 12px;
  border: 2px dashed #dadce0;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.form-group input[type="file"]:hover {
  border-color: #1f73e7;
}

.file-name {
  color: #1f73e7;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.file-info {
  font-size: 12px;
  color: #5f6368;
  margin: 8px 0 0 0;
}

.tags-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #202124;
}

.tag-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #1f73e7;
}

.error {
  padding: 12px 16px;
  background: #fce8e6;
  border-left: 4px solid #d33b27;
  border-radius: 4px;
  color: #d33b27;
  font-size: 13px;
  animation: slideDown 0.2s ease;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #dadce0;
}

.btn-cancel,
.btn-submit {
  padding: 10px 24px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: white;
  border: 1px solid #dadce0;
  color: #202124;
}

.btn-cancel:hover {
  background: #f8f9fa;
}

.btn-submit {
  background: #1f73e7;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #1765cc;
  box-shadow: 0 2px 8px rgba(31, 115, 231, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
