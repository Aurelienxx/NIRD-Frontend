<template>
  <div v-if="documents.length === 0" class="empty-state">
    <div class="empty-icon">📄</div>
    <p>Aucun document pour le moment</p>
    <button class="btn btn-add btn-secondary" @click="$emit('openModal')">
      + Ajouter votre premier document
    </button>
  </div>
  <div v-else class="grid">
    <div v-for="doc in documents" :key="`doc-${doc.id}`" class="card document-card">
      <div class="document-thumbnail">
        <span class="file-icon">📄</span>
      </div>
      <h4>{{ doc.title }}</h4>
      <p>{{ truncateText(doc.description, 100) }}</p>
      <div class="document-meta">
        <span class="date">{{ formatDate(doc.createdAt) }}</span>
        <div v-if="doc.tags.length > 0" class="tags">
          <span v-for="tag in doc.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-download" @click="$emit('download', doc)">⬇️ Télécharger</button>
        <button class="btn btn-delete" @click="$emit('delete', doc.id)">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Document } from '../../services/documentService';

defineProps<{
  documents: Document[];
}>();

defineEmits<{
  openModal: [];
  download: [doc: Document];
  delete: [id: number];
}>();

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
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

.btn-add.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(245, 87, 108, 0.4);
}

/* Spécifique aux documents */
.document-card {
  display: flex;
  flex-direction: column;
}

.document-thumbnail {
  width: 100%;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px 4px 0 0;
}

.file-icon {
  font-size: 40px;
}

.document-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 10px;
}

.date {
  font-weight: 500;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  background: #e8eef7;
  color: #1f73e7;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

/* =========================
   Responsive
========================= */

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .document-card {
    width: 100%;
  }

  .document-thumbnail {
    height: 90px;
  }

  .file-icon {
    font-size: 32px;
  }

  .document-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .tags {
    width: 100%;
  }

  .actions {
    display: flex;
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
    text-align: center;
    padding: 20px;
  }

  .empty-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .document-thumbnail {
    height: 80px;
  }

  .file-icon {
    font-size: 28px;
  }

  .document-meta {
    font-size: 11px;
  }

  .tag {
    font-size: 10px;
    padding: 2px 6px;
  }

  .btn-add.btn-secondary {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
