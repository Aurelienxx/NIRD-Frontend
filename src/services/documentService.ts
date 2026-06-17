import apiClient from './apiClient';

export type DocumentTag = 'TUTORIEL' | 'GUIDE' | 'LETTRE' | 'RAPPORT';

export interface Document {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileData?: Uint8Array | string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  tags: DocumentTag[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDocumentInput {
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileData: Uint8Array | string | File;
  authorId: number;
  tags: DocumentTag[];
}

export const documentService = {
  // Récupérer tous les documents
  async getAllDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/documents');
    return response.data;
  },

  // Récupérer un document par ID
  async getDocumentById(id: number): Promise<Document> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // Récupérer les documents d'un auteur
  async getDocumentsByAuthor(authorId: number): Promise<Document[]> {
    const response = await apiClient.get(`/documents/author/${authorId}`);
    return response.data;
  },

  // Récupérer les documents par tag
  async getDocumentsByTag(tag: DocumentTag): Promise<Document[]> {
    const response = await apiClient.get(`/documents/tag/${tag}`);
    return response.data;
  },

  // Rechercher des documents
  async searchDocuments(query: string): Promise<Document[]> {
    const response = await apiClient.get('/documents/search', { params: { q: query } });
    return response.data;
  },

  // Créer un nouveau document
  async createDocument(document: CreateDocumentInput): Promise<Document> {
    // Convertir le fichier en base64 si c'est un File ou Uint8Array
    let fileDataString = document.fileData;
    if (document.fileData instanceof File) {
      fileDataString = await this.fileToBase64(document.fileData);
    } else if (document.fileData instanceof Uint8Array) {
      fileDataString = btoa(String.fromCharCode.apply(null, Array.from(document.fileData)));
    }

    const response = await apiClient.post('/documents', {
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      fileType: document.fileType,
      fileData: fileDataString,
      authorId: document.authorId,
      tags: document.tags
    });
    return response.data;
  },

  // Mettre à jour un document
  async updateDocument(id: number, document: Partial<CreateDocumentInput>): Promise<Document> {
    let updateData: any = {
      title: document.title,
      description: document.description,
      tags: document.tags
    };

    if (document.fileData) {
      let fileDataString = document.fileData;
      if (document.fileData instanceof File) {
        fileDataString = await this.fileToBase64(document.fileData);
      } else if (document.fileData instanceof Uint8Array) {
        fileDataString = btoa(String.fromCharCode.apply(null, Array.from(document.fileData)));
      }
      updateData.fileData = fileDataString;
      updateData.fileName = document.fileName;
      updateData.fileType = document.fileType;
    }

    const response = await apiClient.put(`/documents/${id}`, updateData);
    return response.data;
  },

  // Supprimer un document
  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },

  // Télécharger/récupérer le fichier binaire
  async downloadDocument(id: number): Promise<Blob> {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Utilitaire pour convertir File en base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extraire la partie base64 (après "data:...;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};