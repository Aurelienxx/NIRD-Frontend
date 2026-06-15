<template>
  <div class="doc-manager">
    <n-space justify="space-between" align="center" style="margin-bottom: 24px">
      <div style="font-size: 16px; font-weight: 600"> Liste des Documents</div>
      <n-input
        v-model:value="search"
        placeholder="Rechercher un document"
        @input="searchDocuments"
      />
    </n-space>

    <!-- Modal Formulaire d'ajout/édition -->
    <n-modal
      v-model:show="showForm"
      preset="dialog"
      :title="editingDocument ? 'Modifier un document' : 'Ajouter un document'"
      positive-text="Enregistrer"
      negative-text="Annuler"
      @positive-click="submitForm"
      @negative-click="cancelForm"
    >
    <n-form :model="formData">

      <n-form-item label="Titre">
        <n-input
          v-model:value="formData.title"
          placeholder="Titre du document"
        />
      </n-form-item>

      <n-form-item label="Description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
        />
      </n-form-item>

      <n-form-item label="Tags">
        <n-select
          v-model:value="formData.tags"
          multiple
          :options="[
            { label: 'Tutoriel', value: 'TUTORIEL' },
            { label: 'Guide', value: 'GUIDE' },
            { label: 'Lettre', value: 'LETTRE' },
            { label: 'Rapport', value: 'RAPPORT' }
          ]"
        />
      </n-form-item>

      <n-form-item label="Fichier">
        <n-upload
          :max="1"
          :default-upload="false"
          @change="handleFileChange"
        >
          <n-button>Sélectionner un fichier</n-button>
        </n-upload>
      </n-form-item>

      </n-form>
    </n-modal>

    <!-- Liste des documents -->
    <div v-if="documents.length === 0">
      <n-empty description="Aucun document disponible" />
    </div>

    <div v-else class="roles-grid">
      <n-card
        v-for="document in documents"
        :key="document.id"
        class="doc-card"
      >
        <div class="doc-title">
          {{ document.title }}
        </div>

        <div style="margin-top: 8px">
          {{ document.description }}
        </div>

        <div>
          <n-tag
            v-for="tag in document.tags"
            :key="tag"
            size="small"
            style="margin-right: 4px"
          >
            {{ tag }}
          </n-tag>
        </div>

    <div style="margin-top: 8px; font-size: 12px">
      Auteur : {{ document.author.name }}
    </div>

    <div class="doc-actions">
      <n-button
        type="info"
        quaternary
        @click="downloadDocument(document.id, document.fileName)"
      >
        📥 Télécharger
      </n-button>

      <n-button
        type="warning"
        quaternary
        @click="editDocument(document)"
      >
        ✏️ Éditer
      </n-button>

      <n-popconfirm
        @positive-click="deleteDocument(document.id)"
      >
        <template #trigger>
          <n-button type="error" quaternary>
            🗑️ Supprimer
          </n-button>
        </template>

        Confirmer la suppression
      </n-popconfirm>
    </div>
  </n-card>
</div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import {
  documentService,
  type Document,
  type DocumentTag,
  type CreateDocumentInput
} from '../../services/documentService';

const message = useMessage();

const documents = ref<Document[]>([]);
const showForm = ref(false);
const editingDocument = ref<Document | null>(null);

const search = ref('')

const formData = ref<{
  title: string;
  description: string;
  tags: DocumentTag[];
  file: File | null;
}>({
  title: '',
  description: '',
  tags: [],
  file: null
});

const loadDocuments = async () => {
  try {
    documents.value = await documentService.getAllDocuments();
  } catch {
    message.error('Erreur lors du chargement des documents');
  }
};

const editDocument = (document: Document) => {
  editingDocument.value = document;

  formData.value = {
    title: document.title,
    description: document.description,
    tags: [...document.tags],
    file: null
  };

  showForm.value = true;
};

const submitForm = async () => {
  try {
    if (editingDocument.value) {
      await documentService.updateDocument(
        editingDocument.value.id,
        {
          title: formData.value.title,
          description: formData.value.description,
          tags: formData.value.tags,
          fileData: formData.value.file ?? undefined,
          fileName: formData.value.file?.name,
          fileType: formData.value.file?.type
        }
      );

      message.success('Document mis à jour');
    } else {
      if (!formData.value.file) {
        message.error('Veuillez sélectionner un fichier');
        return;
      }

      const payload: CreateDocumentInput = {
        title: formData.value.title,
        description: formData.value.description,
        fileData: formData.value.file,
        fileName: formData.value.file.name,
        fileType: formData.value.file.type,
        authorId: 1,
        tags: formData.value.tags
      };

      await documentService.createDocument(payload);

      message.success('Document créé');
    }

    cancelForm();
    await loadDocuments();
  } catch {
    message.error('Erreur lors de la sauvegarde');
  }
};

const deleteDocument = async (id: number) => {
  try {
    await documentService.deleteDocument(id);
    message.success('Document supprimé');
    await loadDocuments();
  } catch {
    message.error('Erreur lors de la suppression');
  }
};

const downloadDocument = async (id: number, fileName: string) => {
  try {
    const blob = await documentService.downloadDocument(id);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
  } catch {
    message.error('Erreur lors du téléchargement');
  }
};

const handleFileChange = ({ file }: any) => {
  formData.value.file = file.file;
};

const cancelForm = () => {
  showForm.value = false;
  editingDocument.value = null;

  formData.value = {
    title: '',
    description: '',
    tags: [],
    file: null
  };
};


const searchDocuments = async () => {
  if (search.value.trim() === '') {
    await loadDocuments()
    return
  }

  try {
    documents.value = await documentService.searchDocuments(search.value)
  } catch {
    message.error('Erreur lors de la recherche')
  }
}


onMounted(() => {
  loadDocuments();
});
</script>


<style scoped>
.doc-manager {
  width: 100%;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.doc-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.doc-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid var(--background-3);
}

.doc-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
}

@media (max-width: 1200px) {
  .roles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .roles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }

  .doc-card {
    padding: 16px;
    text-align: center;
  }

  .doc-title {
    text-align: center;
  }

  .doc-actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .doc-actions .n-button {
    width: 140px;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .doc-actions .n-button {
    width: 48%;
  }
}
</style>
